import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { getActiveListings, getListingBySellerId } from '../services/listings';
import { getTransactionByUserId } from '../services/transactions';
import type { Transaction } from '../types';
import './dashboard.css';
import '../components/ui/components.css';
import '../assets/design-tokens.css';

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
  const map: Record<string, string> = {
    PendingPayment: 'Pending',
    EnergyLocked: 'Locked',
    Delivering: 'Delivering',
    Completed: 'Completed',
    Failed: 'Failed',
    Refunded: 'Refunded',
  };
  return map[s] ?? s;
}

interface Stats {
  activeListings: number;
  totalTxns: number;
  kwhSold: number;
  marketListings: number;
}

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Stats>({ activeListings: 0, totalTxns: 0, kwhSold: 0, marketListings: 0 });
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const uid = Number(user.id);

    async function load() {
      try {
        const [myListRes, txnRes, mktRes] = await Promise.all([
          getListingBySellerId(uid),
          getTransactionByUserId(uid),
          getActiveListings(),
        ]);
        const myListings = myListRes.data ?? [];
        const txns = txnRes.data ?? [];
        const market = mktRes.data ?? [];

        const activeListings = myListings.filter((l) => l.isActive).length;
        const kwhSold = txns
          .filter((t) => t.sellerId === uid)
          .reduce((sum, t) => sum + Number(t.deliveredKwh), 0);

        setStats({
          activeListings,
          totalTxns: txns.length,
          kwhSold: Math.round(kwhSold * 10) / 10,
          marketListings: market.length,
        });

        const sorted = [...txns].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentTxns(sorted.slice(0, 5));
      } catch {
        // silently fail — page renders with zeros
      } finally {
        setLoaded(true);
      }
    }

    load();
  }, [user?.id]);

  // Trigger top-bar animation after load
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      statRefs.current.forEach((el) => el?.classList.add('loaded'));
    }, 100);
    return () => clearTimeout(timer);
  }, [loaded]);

  const firstName = user?.full_name?.split(' ')[0] ?? 'User';

  const statItems = [
    { label: 'Active Listings', value: String(stats.activeListings) },
    { label: 'Total Transactions', value: String(stats.totalTxns) },
    { label: 'kWh Sold', value: `${stats.kwhSold}` },
    { label: 'Market Listings', value: String(stats.marketListings) },
  ];

  return (
    <div className="dash-page">
      <div className="dash-greeting">
        <p className="dash-greeting-label">Overview</p>
        <h1 className="dash-greeting-name">Hey, {firstName}</h1>
        <p className="dash-greeting-sub">Here's your energy trading summary.</p>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        {statItems.map((item, i) => (
          <div
            key={item.label}
            className="dash-stat-card"
            ref={(el) => { statRefs.current[i] = el; }}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {loaded ? (
              <span className="dash-stat-num">{item.value}</span>
            ) : (
              <div className="dash-skel dash-skel-stat" />
            )}
            <span className="dash-stat-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Quick Actions</h2>
        </div>
        <div className="dash-actions">
          <Link to="/my-listings" className="ui-btn ui-btn-primary ui-btn-md">
            + Create Listing
          </Link>
          <Link to="/browse" className="ui-btn ui-btn-secondary ui-btn-md">
            Browse Market
            <span className="ui-btn-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Recent Transactions</h2>
          <Link to="/transactions" className="ui-btn ui-btn-tertiary ui-btn-sm">
            View All →
          </Link>
        </div>

        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>kWh</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {!loaded ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="dash-skel-row">
                    <td><div className="dash-skel" style={{ width: 56 }} /></td>
                    <td><div className="dash-skel" style={{ width: 36 }} /></td>
                    <td><div className="dash-skel" style={{ width: 72 }} /></td>
                    <td><div className="dash-skel" style={{ width: 56 }} /></td>
                    <td><div className="dash-skel" style={{ width: 80 }} /></td>
                  </tr>
                ))
              ) : recentTxns.length === 0 ? (
                <tr className="dash-empty-row">
                  <td colSpan={5}>No transactions yet. Start by buying or listing energy.</td>
                </tr>
              ) : (
                recentTxns.map((t) => {
                  const isBuy = t.buyerId === Number(user?.id);
                  return (
                    <tr key={t.id}>
                      <td>{new Date(t.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}</td>
                      <td>
                        <span className={`status-badge ${isBuy ? 'type-buy' : 'type-sell'}`}>
                          {isBuy ? 'Buy' : 'Sell'}
                        </span>
                      </td>
                      <td><span className={statusClass(t.status)}>{statusLabel(t.status)}</span></td>
                      <td>{Number(t.requestedKwh).toFixed(1)} kWh</td>
                      <td className={isBuy ? 'dash-amount-negative' : 'dash-amount-positive'}>
                        ₦{Number(t.totalAmount).toLocaleString('en-NG')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
