import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { getActiveListings, getAvailableLocations, createListing } from '../services/listings';
import { getMetersBySellerId } from '../services/meters';
import { createTransaction, getTransactionByUserId } from '../services/transactions';
import { initiatePayment } from '../services/payments';
import type { Listing, Meter, Transaction } from '../types';
import { Modal } from '../components/ui';
import './marketplace.css';
import '../components/ui/components.css';
import '../assets/design-tokens.css';

type Tab = 'buy' | 'sell' | 'history';

function statusClass(s: string) {
  const map: Record<string, string> = {
    PendingPayment: 'status-pending',
    Paid: 'status-paid',
    EnergyLocked: 'status-locked',
    Delivering: 'status-delivering',
    Completed: 'status-completed',
    Failed: 'status-failed',
    Refunded: 'status-refunded',
  };
  return `status-badge ${map[s] ?? 'status-pending'}`;
}

function statusLabel(s: string) {
  const labels: Record<string, string> = {
    PendingPayment: 'Pending',
    EnergyLocked: 'Locked',
  };
  return labels[s] ?? s;
}

export function BrowseListings() {
  const user = useAuthStore((s) => s.user);
  const uid = Number(user?.id);
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('buy');

  // Buy tab
  const [listings, setListings] = useState<Listing[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buy modal
  const [buyListing, setBuyListing] = useState<Listing | null>(null);
  const [kwhAmount, setKwhAmount] = useState('');
  const [buyStep, setBuyStep] = useState<'order' | 'processing'>('order');
  const [buyError, setBuyError] = useState<string | null>(null);

  // Sell tab
  const [meters, setMeters] = useState<Meter[]>([]);
  const [metersLoading, setMetersLoading] = useState(false);
  const [metersLoaded, setMetersLoaded] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newMeterId, setNewMeterId] = useState('');
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false);

  // History tab
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txLoaded, setTxLoaded] = useState(false);

  useEffect(() => {
    loadBuyData();
  }, []);

  useEffect(() => {
    if (tab === 'sell' && user && !metersLoaded && !metersLoading) {
      loadMeters();
    }
    if (tab === 'history' && user && !txLoaded) {
      loadTransactions();
    }
  }, [tab]);

  async function loadBuyData() {
    try {
      const [listResult, locResult] = await Promise.allSettled([
        getActiveListings(),
        getAvailableLocations(),
      ]);

      if (listResult.status === 'fulfilled') {
        setListings(listResult.value.data ?? []);
      } else {
        setError('Failed to load listings.');
      }

      if (locResult.status === 'fulfilled') {
        const rawLocs = locResult.value.data ?? [];
        setLocations(rawLocs.map((loc: unknown) =>
          typeof loc === 'object' && loc !== null ? (loc as { location: string }).location : String(loc)
        ));
      }
      // locations failure is non-critical — filter just won't populate
    } finally {
      setLoading(false);
    }
  }

  async function filterByLocation(loc: string) {
    setSelectedLocation(loc);
    setLoading(true);
    setError(null);
    try {
      const res = await getActiveListings(loc || undefined);
      setListings(res.data ?? []);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMeters() {
    setMetersLoading(true);
    try {
      const res = await getMetersBySellerId(uid);
      setMeters(res.data ?? []);
    } catch {
      setMeters([]);
    } finally {
      setMetersLoading(false);
      setMetersLoaded(true);
    }
  }

  async function loadTransactions() {
    setTxLoading(true);
    try {
      const res = await getTransactionByUserId(uid);
      const sorted = [...(res.data ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(sorted);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
      setTxLoaded(true);
    }
  }

  function openBuyModal(listing: Listing) {
    if (!user) {
      navigate('/login');
      return;
    }
    setBuyListing(listing);
    setKwhAmount('');
    setBuyStep('order');
    setBuyError(null);
  }

  function closeBuyModal() {
    if (buyStep === 'processing') return;
    setBuyListing(null);
    setBuyError(null);
  }

  const kwh = parseFloat(kwhAmount) || 0;
  const totalNGN = buyListing ? kwh * buyListing.pricePerKwh : 0;
  const totalKobo = Math.round(totalNGN * 100);

  async function handleProceedToPayment() {
    if (!buyListing || !user || kwh <= 0) return;
    setBuyStep('processing');
    setBuyError(null);
    try {
      const txnRes = await createTransaction(
        buyListing.sellerId,
        Number(user.id),
        buyListing.id,
        kwh
      );
      const transactionId = txnRes.data?.id;
      sessionStorage.setItem(
        'kilo_pending_txn',
        JSON.stringify({ transactionId, listingId: buyListing.id })
      );
      const payRes = await initiatePayment({
        amount: totalKobo,
        currency: 'NGN',
        description: `Purchase ${kwh} kWh from listing #${buyListing.id}`,
        customer_name: user.full_name ?? 'Kilo User',
        customer_email: user.email ?? '',
        customer_mobile: (user as { phone_number?: string }).phone_number ?? '08000000000',
        redirect_url: `${window.location.origin}/payment/callback`,
      });
      window.location.href = payRes.redirect_url;
    } catch (err: unknown) {
      setBuyStep('order');
      setBuyError(err instanceof Error ? err.message : 'Payment initiation failed. Please try again.');
    }
  }

  async function handleCreateListing() {
    if (!newPrice || !newMeterId) {
      setSellError('Price and meter are required.');
      return;
    }
    setSellLoading(true);
    setSellError(null);
    try {
      await createListing(uid, Number(newMeterId), parseFloat(newPrice), newLocation);
      setSellSuccess(true);
      setNewPrice('');
      setNewLocation('');
      setNewMeterId('');
    } catch (err: unknown) {
      setSellError(err instanceof Error ? err.message : 'Failed to create listing.');
    } finally {
      setSellLoading(false);
    }
  }

  return (
    <div className="browse-root">
      {/* Nav */}
      <nav className="browse-nav">
        <Link to="/" className="browse-nav-logo">
          <div className="browse-nav-logo-bolt" />
          <span className="browse-nav-logo-text">Kilo</span>
        </Link>
        <div className="browse-nav-right">
          {user ? (
            <>
              <span className="browse-nav-user">
                <span>{user.full_name?.split(' ')[0]}</span>
              </span>
              <Link to="/dashboard" className="ui-btn ui-btn-tertiary ui-btn-sm">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="ui-btn ui-btn-tertiary ui-btn-sm">Login</Link>
              <Link to="/register" className="ui-btn ui-btn-primary ui-btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="browse-header">
        <h1 className="browse-title">Energy Market</h1>
        <p className="browse-subtitle">
          Buy solar surplus directly from verified producers. Pay instantly, receive energy in real-time.
        </p>
      </div>

      {/* Tabbed Panel */}
      <div className="browse-panel-wrap">
        <div className="browse-panel">

          {/* Panel header: tabs + optional filter */}
          <div className="browse-panel-header">
            <div className="browse-tab-row">
              {(['buy', 'sell', 'history'] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={`browse-tab${tab === t ? ' active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t === 'buy' ? 'Buy' : t === 'sell' ? 'Sell' : 'History'}
                </button>
              ))}
            </div>
            {tab === 'buy' && (
              <div className="browse-filter-inline">
                <select
                  className="browse-filter-select"
                  value={selectedLocation}
                  onChange={(e) => filterByLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <span className="browse-count">
                  {listings.length} listing{listings.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* ── Buy Tab ── */}
          {tab === 'buy' && (
            <div className="browse-table-wrap">
              <table className="browse-table">
                <thead>
                  <tr>
                    <th>Seller</th>
                    <th>Location</th>
                    <th>Available</th>
                    <th>Generated</th>
                    <th>Price / kWh</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="browse-skel-row">
                        <td><div className="browse-skel" style={{ width: 110 }} /></td>
                        <td><div className="browse-skel" style={{ width: 80 }} /></td>
                        <td><div className="browse-skel" style={{ width: 65 }} /></td>
                        <td><div className="browse-skel" style={{ width: 65 }} /></td>
                        <td><div className="browse-skel" style={{ width: 70 }} /></td>
                        <td className="bt-action-cell"><div className="browse-skel" style={{ width: 44, marginLeft: 'auto' }} /></td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="browse-table-empty">⚡ {error}</td>
                    </tr>
                  ) : listings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="browse-table-empty">
                        No active listings right now. Check back soon.
                      </td>
                    </tr>
                  ) : (
                    listings.map((listing) => (
                      <tr key={listing.id} className="browse-table-row">
                        <td>
                          <div className="bt-seller-cell">
                            <span className="bt-seller">Seller #{listing.sellerId}</span>
                            <span className="bt-badge">Solar</span>
                          </div>
                        </td>
                        <td className="bt-dim">{listing.location ?? '—'}</td>
                        <td>
                          <span className="bt-kwh">
                            {listing.availableKwh != null
                              ? `${Number(listing.availableKwh).toFixed(1)} kWh`
                              : '—'}
                          </span>
                        </td>
                        <td className="bt-dim">
                          {Number(listing.totalGeneratedKwh).toFixed(1)} kWh
                        </td>
                        <td>
                          <span className="bt-price">
                            ₦{Number(listing.pricePerKwh).toLocaleString('en-NG', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="bt-action-cell">
                          <button
                            className="ui-btn ui-btn-primary ui-btn-sm"
                            onClick={() => openBuyModal(listing)}
                          >
                            Buy
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Sell Tab ── */}
          {tab === 'sell' && (
            <div className="browse-sell-wrap">
              {!user ? (
                <div className="browse-auth-cta">
                  <div className="browse-auth-icon">⚡</div>
                  <p className="browse-auth-title">Sell Your Surplus Energy</p>
                  <p className="browse-auth-sub">
                    Sign in to list your solar surplus on the marketplace.
                  </p>
                  <div className="browse-auth-actions">
                    <Link to="/login" className="ui-btn ui-btn-primary ui-btn-md">Log In</Link>
                    <Link to="/register" className="ui-btn ui-btn-tertiary ui-btn-md">Register</Link>
                  </div>
                </div>
              ) : sellSuccess ? (
                <div className="browse-auth-cta">
                  <div className="browse-auth-icon" style={{ color: 'var(--green)' }}>✓</div>
                  <p className="browse-auth-title">Listing Created!</p>
                  <p className="browse-auth-sub">Your energy is now live on the marketplace.</p>
                  <div className="browse-auth-actions">
                    <button
                      className="ui-btn ui-btn-primary ui-btn-md"
                      onClick={() => { setSellSuccess(false); setTab('buy'); }}
                    >
                      View Marketplace
                    </button>
                    <button
                      className="ui-btn ui-btn-tertiary ui-btn-md"
                      onClick={() => setSellSuccess(false)}
                    >
                      Add Another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="browse-sell-label">List Your Surplus Energy</p>
                  {sellError && <div className="buy-error">{sellError}</div>}
                  <div className="browse-sell-form">
                    <div className="ui-field">
                      <label className="ui-field-label">Price per kWh (₦)</label>
                      <div className="ui-field-wrap">
                        <input
                          className="ui-input ui-input-no-icon"
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="e.g. 80.00"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="ui-field">
                      <label className="ui-field-label">Location (LGA)</label>
                      <div className="ui-field-wrap">
                        <input
                          className="ui-input ui-input-no-icon"
                          type="text"
                          placeholder="e.g. Ikeja, Lagos"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
                      <label className="ui-field-label">Meter</label>
                      <div className="ui-field-wrap">
                        {metersLoading ? (
                          <div className="browse-skel" style={{ height: 38, width: '100%' }} />
                        ) : (
                          <select
                            className="ui-input ui-input-no-icon"
                            value={newMeterId}
                            onChange={(e) => setNewMeterId(e.target.value)}
                            style={{ cursor: 'pointer' }}
                          >
                            <option value="">Select a meter</option>
                            {meters.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.deviceId} — {(Number(m.totalGeneratedKwh) - Number(m.consumedKwh)).toFixed(1)} kWh surplus
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      {metersLoaded && meters.length === 0 && (
                        <span className="ui-field-hint">
                          No meters yet — <Link to="/dashboard">add one in your dashboard</Link>.
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="ui-btn ui-btn-primary ui-btn-md"
                    style={{ width: '100%', marginTop: 8 }}
                    onClick={handleCreateListing}
                    disabled={sellLoading || metersLoading}
                  >
                    {sellLoading ? 'Listing...' : 'List Energy for Sale'}
                    {!sellLoading && <span className="ui-btn-arrow">→</span>}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── History Tab ── */}
          {tab === 'history' && (
            <div className="browse-table-wrap">
              {!user ? (
                <div className="browse-auth-cta">
                  <div className="browse-auth-icon">⚡</div>
                  <p className="browse-auth-title">Your Transaction History</p>
                  <p className="browse-auth-sub">
                    Sign in to see all your energy purchases and sales.
                  </p>
                  <div className="browse-auth-actions">
                    <Link to="/login" className="ui-btn ui-btn-primary ui-btn-md">Log In</Link>
                    <Link to="/register" className="ui-btn ui-btn-tertiary ui-btn-md">Register</Link>
                  </div>
                </div>
              ) : (
                <table className="browse-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Requested</th>
                      <th>Delivered</th>
                      <th>Price / kWh</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="browse-skel-row">
                          <td><div className="browse-skel" style={{ width: 90 }} /></td>
                          <td><div className="browse-skel" style={{ width: 60 }} /></td>
                          <td><div className="browse-skel" style={{ width: 60 }} /></td>
                          <td><div className="browse-skel" style={{ width: 60 }} /></td>
                          <td><div className="browse-skel" style={{ width: 80 }} /></td>
                          <td><div className="browse-skel" style={{ width: 64 }} /></td>
                        </tr>
                      ))
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="browse-table-empty">
                          No transactions yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="browse-table-row">
                          <td className="bt-dim">
                            {new Date(tx.createdAt).toLocaleDateString('en-NG', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </td>
                          <td>{Number(tx.requestedKwh).toFixed(2)} kWh</td>
                          <td className="bt-dim">
                            {tx.deliveredKwh != null ? `${Number(tx.deliveredKwh).toFixed(2)} kWh` : '—'}
                          </td>
                          <td className="bt-dim">
                            ₦{Number(tx.pricePerKwhSnapshot).toLocaleString('en-NG')}
                          </td>
                          <td>
                            <span className="bt-price">
                              ₦{Number(tx.totalAmount).toLocaleString('en-NG')}
                            </span>
                          </td>
                          <td>
                            <span className={statusClass(tx.status)}>
                              {statusLabel(tx.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Buy Modal */}
      {buyListing && (
        <Modal
          open={!!buyListing}
          onClose={closeBuyModal}
          title={buyStep === 'order' ? 'Buy Energy' : 'Processing Payment'}
        >
          {buyStep === 'order' && (
            <>
              {buyError && <div className="buy-error">{buyError}</div>}
              <div className="buy-modal-listing-summary">
                <p className="buy-modal-price-display">
                  ₦{Number(buyListing.pricePerKwh).toLocaleString('en-NG', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                  <span style={{
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 400,
                  }}> / kWh</span>
                </p>
                <p className="buy-modal-meta">
                  Seller #{buyListing.sellerId}
                  {buyListing.location ? ` · ${buyListing.location}` : ''}
                  {` · ${Number(buyListing.availableKwh).toFixed(1)} kWh available`}
                </p>
              </div>
              <div className="ui-field">
                <label className="ui-field-label">kWh to purchase</label>
                <div className="ui-field-wrap">
                  <input
                    className="ui-input ui-input-no-icon"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="e.g. 5.0"
                    value={kwhAmount}
                    onChange={(e) => setKwhAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              {kwh > 0 && (
                <div className="buy-cost-preview">
                  <span className="buy-cost-label">Total cost</span>
                  <span className="buy-cost-value">
                    ₦{totalNGN.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="ui-modal-footer">
                <button className="ui-btn ui-btn-tertiary ui-btn-md" onClick={closeBuyModal}>
                  Cancel
                </button>
                <button
                  className="ui-btn ui-btn-primary ui-btn-md"
                  disabled={kwh <= 0}
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                  <span className="ui-btn-arrow">→</span>
                </button>
              </div>
            </>
          )}
          {buyStep === 'processing' && (
            <div className="buy-processing">
              <div className="buy-processing-spinner" />
              <p className="buy-processing-text">
                Creating transaction and redirecting to payment...
              </p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
