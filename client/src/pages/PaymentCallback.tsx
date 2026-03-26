import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../services/payments';
import { confirmPayment } from '../services/transactions';
import '../components/ui/components.css';
import '../assets/design-tokens.css';

type State = 'verifying' | 'success' | 'error';

export function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const transactionRef = searchParams.get('transactionRef') ?? searchParams.get('txnref');
    const callbackError = searchParams.get('error');

    async function process() {
      if (callbackError === 'missing_ref' || !transactionRef) {
        setMessage('No transaction reference found. Please check your transactions.');
        setState('error');
        return;
      }

      try {
        // Read pending transaction (includes amount stored at initiation)
        const raw = sessionStorage.getItem('kilo_pending_txn');
        const pending = raw
          ? (JSON.parse(raw) as { transactionId: string; listingId: number; amount: number })
          : null;

        const verifyRes = await verifyPayment(transactionRef, pending?.amount ?? 0);

        if (verifyRes.status !== '00') {
          setMessage(verifyRes.response_description || 'Payment was not successful.');
          setState('error');
          return;
        }

        if (pending && verifyRes.amount !== null && verifyRes.amount !== pending.amount) {
          setMessage('Payment amount mismatch. Please contact support.');
          setState('error');
          return;
        }

        if (pending) {
          await confirmPayment(pending.listingId, pending.transactionId, transactionRef);
          sessionStorage.removeItem('kilo_pending_txn');
        }

        setState('success');
        setMessage('Payment confirmed! Your energy delivery is being processed.');
      } catch {
        setMessage('Something went wrong confirming your payment. Check your transactions for status.');
        setState('error');
      }
    }

    process();
  }, [searchParams]);

  return (
    <div className="callback-root">
      <div className="callback-card">
        {/* Top amber bar */}
        <div className="callback-bar" />

        <div className="callback-icon-wrap">
          {state === 'verifying' && (
            <div className="callback-spinner" />
          )}
          {state === 'success' && (
            <div className="callback-icon callback-icon-success">✓</div>
          )}
          {state === 'error' && (
            <div className="callback-icon callback-icon-error">✕</div>
          )}
        </div>

        <h1 className="callback-title">
          {state === 'verifying' && 'Processing Payment'}
          {state === 'success' && 'Payment Successful'}
          {state === 'error' && 'Payment Issue'}
        </h1>

        <p className="callback-msg">{message}</p>

        {state !== 'verifying' && (
          <div className="callback-actions">
            <Link to="/transactions" className="ui-btn ui-btn-primary ui-btn-md">
              View Transactions
            </Link>
            <Link to="/browse" className="ui-btn ui-btn-tertiary ui-btn-md">
              Browse Market
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .callback-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'DM Mono', monospace;
        }
        .callback-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 48px 40px;
          width: min(460px, 94vw);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .callback-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--amber);
        }
        .callback-icon-wrap {
          margin: 0 auto 24px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .callback-spinner {
          width: 48px;
          height: 48px;
          border: 2px solid var(--border);
          border-top-color: var(--amber);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .callback-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-family: 'Chakra Petch', sans-serif;
          font-weight: 700;
          animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes pop-in {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .callback-icon-success {
          background: rgba(0, 214, 143, 0.12);
          color: var(--green);
          border: 1px solid rgba(0, 214, 143, 0.3);
        }
        .callback-icon-error {
          background: rgba(255, 77, 106, 0.1);
          color: var(--red);
          border: 1px solid rgba(255, 77, 106, 0.25);
        }
        .callback-title {
          font-family: 'Chakra Petch', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 12px;
        }
        .callback-msg {
          font-size: 13px;
          color: var(--text-dim);
          line-height: 1.6;
          margin: 0 0 32px;
        }
        .callback-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
