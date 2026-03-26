import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { getTransactionByUserId } from '../services/transactions';
import { getEnergyLogsByTransactionId } from '../services/energyLogs';
import type { Transaction, EnergyLog } from '../types';
import { Modal } from '../components/ui';
import './transactions.css';
import '../components/ui/components.css';
import '../assets/design-tokens.css';

type TabFilter = 'all' | 'buying' | 'selling';

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
    PendingPayment: 'Pending Payment',
    EnergyLocked: 'Energy Locked',
    Delivering: 'Delivering',
    Completed: 'Completed',
    Failed: 'Failed',
    Refunded: 'Refunded',
  };
  return labels[s] ?? s;
}

export function TransactionsPage() {
  const user = useAuthStore((s) => s.user);
  const uid = Number(user?.id);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('all');

  const [selected, setSelected] = useState<Transaction | null>(null);
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!uid) return;
    async function load() {
      try {
        const res = await getTransactionByUserId(uid);
        const sorted = [...(res.data ?? [])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTransactions(sorted);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid]);

  async function openDetail(txn: Transaction) {
    setSelected(txn);
    setLogs([]);
    setLogsLoading(true);
    try {
      const res = await getEnergyLogsByTransactionId(txn.id);
      const sorted = [...(res.data ?? [])].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setLogs(sorted);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }

  const buyCount = transactions.filter((t) => t.buyerId === uid).length;
  const sellCount = transactions.filter((t) => t.sellerId === uid).length;

  const filtered = transactions.filter((t) => {
    if (tab === 'buying') return t.buyerId === uid;
    if (tab === 'selling') return t.sellerId === uid;
    return true;
  });

  return (
    <div className="txn-page">
      <div className="txn-page-header">
        <p className="txn-page-label">History</p>
        <h1 className="txn-page-title">Transactions</h1>
        <p className="txn-page-sub">Your complete energy trading activity.</p>
      </div>

      <div className="txn-tabs">
        <button className={`txn-tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>
          All ({transactions.length})
        </button>
        <button className={`txn-tab${tab === 'buying' ? ' active' : ''}`} onClick={() => setTab('buying')}>
          Buying ({buyCount})
        </button>
        <button className={`txn-tab${tab === 'selling' ? ' active' : ''}`} onClick={() => setTab('selling')}>
          Selling ({sellCount})
        </button>
      </div>

      {loading ? (
        <div className="txn-loading">
          <div className="txn-spinner" /> Loading transactions...
        </div>
      ) : (
        <div className="txn-table-wrap">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Delivered</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="txn-empty-row">
                  <td colSpan={6}>No transactions found.</td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isBuy = t.buyerId === uid;
                  return (
                    <tr key={t.id} className="txn-table-row" onClick={() => openDetail(t)}>
                      <td>
                        {new Date(t.createdAt).toLocaleDateString('en-NG', {
                          day: '2-digit', month: 'short', year: '2-digit',
                        })}
                      </td>
                      <td>
                        <span className={`status-badge ${isBuy ? 'type-buy' : 'type-sell'}`}>
                          {isBuy ? 'Buy' : 'Sell'}
                        </span>
                      </td>
                      <td>
                        <span className={statusClass(t.status)}>{statusLabel(t.status)}</span>
                      </td>
                      <td>{Number(t.requestedKwh).toFixed(2)} kWh</td>
                      <td style={{ color: Number(t.deliveredKwh) > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                        {Number(t.deliveredKwh).toFixed(2)} kWh
                      </td>
                      <td className={`txn-amount ${isBuy ? 'buy' : 'sell'}`}>
                        ₦{Number(t.totalAmount).toLocaleString('en-NG')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal
          open={!!selected}
          onClose={() => setSelected(null)}
          title="Transaction Detail"
          style={{ width: 'min(560px, 94vw)' }}
        >
          <div className="txn-detail-id">ID: {selected.id}</div>

          <div className="txn-detail-grid">
            <div className="txn-detail-item">
              <div className="txn-detail-label">Status</div>
              <div className="txn-detail-value">
                <span className={statusClass(selected.status)}>{statusLabel(selected.status)}</span>
              </div>
            </div>
            <div className="txn-detail-item">
              <div className="txn-detail-label">Type</div>
              <div className="txn-detail-value">
                <span className={`status-badge ${selected.buyerId === uid ? 'type-buy' : 'type-sell'}`}>
                  {selected.buyerId === uid ? 'Buy' : 'Sell'}
                </span>
              </div>
            </div>
            <div className="txn-detail-item">
              <div className="txn-detail-label">Requested kWh</div>
              <div className="txn-detail-value">{Number(selected.requestedKwh).toFixed(2)} kWh</div>
            </div>
            <div className="txn-detail-item">
              <div className="txn-detail-label">Delivered kWh</div>
              <div className="txn-detail-value" style={{ color: 'var(--green)' }}>
                {Number(selected.deliveredKwh).toFixed(2)} kWh
              </div>
            </div>
            <div className="txn-detail-item">
              <div className="txn-detail-label">Price / kWh</div>
              <div className="txn-detail-value" style={{ color: 'var(--amber)' }}>
                ₦{Number(selected.pricePerKwhSnapshot).toLocaleString('en-NG')}
              </div>
            </div>
            <div className="txn-detail-item">
              <div className="txn-detail-label">Total Amount</div>
              <div className="txn-detail-value" style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700 }}>
                ₦{Number(selected.totalAmount).toLocaleString('en-NG')}
              </div>
            </div>
            <div className="txn-detail-item">
              <div className="txn-detail-label">Platform Fee</div>
              <div className="txn-detail-value" style={{ color: 'var(--text-muted)' }}>
                ₦{Number(selected.platformFee).toLocaleString('en-NG')}
              </div>
            </div>
            <div className="txn-detail-item">
              <div className="txn-detail-label">Date</div>
              <div className="txn-detail-value">
                {new Date(selected.createdAt).toLocaleString('en-NG')}
              </div>
            </div>
          </div>

          <div className="txn-logs-title">⚡ Energy Delivery Log</div>

          {logsLoading ? (
            <div className="txn-logs-loading">
              <div className="txn-spinner" /> Loading delivery log...
            </div>
          ) : logs.length === 0 ? (
            <div className="txn-logs-empty">
              No delivery logs yet.
              {['Paid', 'EnergyLocked', 'Delivering'].includes(selected.status)
                ? ' Delivery will begin shortly.'
                : ''}
            </div>
          ) : (
            <div className="txn-logs-list">
              {logs.map((log) => (
                <div key={log.id} className="txn-log-item">
                  <span className="txn-log-kwh">+{Number(log.deliveredKwh).toFixed(3)} kWh</span>
                  <span className="txn-log-time">
                    {new Date(log.timestamp).toLocaleTimeString('en-NG', {
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
