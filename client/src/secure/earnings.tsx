import { useEffect, useState } from 'react';
import {
  getEarningsBalance,
  getEarningsHistory,
  getBankDetails,
  saveBankDetails,
  requestPayout,
  type EarningsBalance,
  type EarningRecord,
  type BankDetails,
} from '../services/earnings';
import './earnings.css';
import '../components/ui/components.css';
import '../assets/design-tokens.css';

export function Earnings() {
  const [balance, setBalance] = useState<EarningsBalance | null>(null);
  const [history, setHistory] = useState<EarningRecord[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Bank details form
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankSaving, setBankSaving] = useState(false);
  const [bankMsg, setBankMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payout
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [balRes, histRes, bankRes] = await Promise.allSettled([
          getEarningsBalance(),
          getEarningsHistory(),
          getBankDetails(),
        ]);
        if (balRes.status === 'fulfilled') setBalance(balRes.value as EarningsBalance);
        if (histRes.status === 'fulfilled') setHistory((histRes.value as EarningRecord[]) ?? []);
        if (bankRes.status === 'fulfilled') {
          const b = bankRes.value as BankDetails;
          if (b?.bankName) {
            setBankDetails(b);
            setBankName(b.bankName);
            setAccountNumber(b.accountNumber);
            setAccountName(b.accountName);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveBankDetails() {
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setBankMsg({ type: 'error', text: 'All bank detail fields are required.' });
      return;
    }
    if (!/^\d{10}$/.test(accountNumber)) {
      setBankMsg({ type: 'error', text: 'Account number must be exactly 10 digits.' });
      return;
    }
    setBankSaving(true);
    setBankMsg(null);
    try {
      await saveBankDetails({ bankName, accountNumber, accountName });
      setBankDetails({ bankName, accountNumber, accountName });
      setBankMsg({ type: 'success', text: 'Bank details saved.' });
    } catch (err: unknown) {
      setBankMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save.' });
    } finally {
      setBankSaving(false);
    }
  }

  async function handleRequestPayout() {
    if (!balance || balance.available <= 0) return;
    setPayoutLoading(true);
    setPayoutMsg(null);
    try {
      await requestPayout(balance.available);
      setPayoutMsg({ type: 'success', text: 'Payout request submitted. We\'ll process it within 3–5 business days.' });
    } catch (err: unknown) {
      setPayoutMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to submit request.' });
    } finally {
      setPayoutLoading(false);
    }
  }

  const hasBankDetails = !!bankDetails?.bankName;
  const canRequestPayout = hasBankDetails && (balance?.available ?? 0) > 0;

  return (
    <div className="earn-page">
      <div className="earn-page-header">
        <p className="earn-page-label">Seller</p>
        <h1 className="earn-page-title">Earnings</h1>
        <p className="earn-page-sub">Track your revenue from energy sales and request payouts.</p>
      </div>

      {/* Balance Cards */}
      <div className="earn-balance-grid">
        {(['total_earned', 'available', 'paid_out'] as const).map((key) => {
          const labels = { total_earned: 'Total Earned', available: 'Available', paid_out: 'Paid Out' };
          const value = balance?.[key] ?? 0;
          return (
            <div key={key} className={`earn-balance-card${key === 'available' ? ' earn-balance-card--highlight' : ''}`}>
              <span className="earn-balance-label">{labels[key]}</span>
              {loading ? (
                <div className="skel" style={{ height: 28, width: 120, marginTop: 8 }} />
              ) : (
                <span className="earn-balance-value">
                  ₦{value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Payout Request */}
      <div className="earn-section">
        <div className="earn-section-header">
          <h2 className="earn-section-title">Request Payout</h2>
        </div>
        {payoutMsg && (
          <div className={`earn-msg earn-msg--${payoutMsg.type}`}>{payoutMsg.text}</div>
        )}
        {!hasBankDetails && (
          <p className="earn-hint">Add your bank details below before requesting a payout.</p>
        )}
        <button
          className="ui-btn ui-btn-primary ui-btn-md"
          onClick={handleRequestPayout}
          disabled={!canRequestPayout || payoutLoading}
        >
          {payoutLoading ? 'Submitting...' : `Request Payout${balance ? ` — ₦${balance.available.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : ''}`}
        </button>
        <p className="earn-hint" style={{ marginTop: 8 }}>
          Payouts are processed manually within 3–5 business days via bank transfer.
        </p>
      </div>

      <div className="earn-divider" />

      {/* Bank Details */}
      <div className="earn-section">
        <div className="earn-section-header">
          <h2 className="earn-section-title">Bank Details</h2>
          {hasBankDetails && <span className="earn-saved-badge">Saved</span>}
        </div>
        {bankMsg && (
          <div className={`earn-msg earn-msg--${bankMsg.type}`}>{bankMsg.text}</div>
        )}
        <div className="earn-bank-form">
          <div className="ui-field">
            <label className="ui-field-label">Bank Name</label>
            <div className="ui-field-wrap">
              <input
                className="ui-input ui-input-no-icon"
                type="text"
                placeholder="e.g. First Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
          </div>
          <div className="ui-field">
            <label className="ui-field-label">Account Number</label>
            <div className="ui-field-wrap">
              <input
                className="ui-input ui-input-no-icon"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit NUBAN"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-field-label">Account Name</label>
            <div className="ui-field-wrap">
              <input
                className="ui-input ui-input-no-icon"
                type="text"
                placeholder="As it appears on your bank account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <button
          className="ui-btn ui-btn-secondary ui-btn-md"
          style={{ marginTop: 12 }}
          onClick={handleSaveBankDetails}
          disabled={bankSaving}
        >
          {bankSaving ? 'Saving...' : 'Save Bank Details'}
        </button>
      </div>

      <div className="earn-divider" />

      {/* Earnings History */}
      <div className="earn-section">
        <div className="earn-section-header">
          <h2 className="earn-section-title">Earnings History</h2>
          <span className="earn-section-sub">{history.length} record{history.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="earn-table-wrap">
          <table className="earn-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Listing</th>
                <th>Energy Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="skel-row">
                    <td><div className="skel" style={{ width: 80 }} /></td>
                    <td><div className="skel" style={{ width: 140 }} /></td>
                    <td><div className="skel" style={{ width: 50 }} /></td>
                    <td><div className="skel" style={{ width: 90 }} /></td>
                    <td><div className="skel" style={{ width: 60 }} /></td>
                  </tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="earn-empty">
                    No earnings yet. Complete a sale to see your revenue here.
                  </td>
                </tr>
              ) : (
                history.map((r) => (
                  <tr key={r.transactionId}>
                    <td className="earn-dim">
                      {new Date(r.createdAt).toLocaleDateString('en-NG', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="earn-mono earn-dim" style={{ fontSize: 11 }}>
                      {r.transactionId.slice(0, 16)}…
                    </td>
                    <td className="earn-dim">#{r.listingId}</td>
                    <td>
                      <span className="earn-amount">
                        ₦{r.energyCostNGN.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${r.paid ? 'status-completed' : 'status-pending'}`}>
                        {r.paid ? 'Paid Out' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
