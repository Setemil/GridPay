import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { getMetersBySellerId, createMeter } from '../services/meters';
import type { Meter } from '../types';
import { Modal } from '../components/ui';
import './profile.css';
import '../components/ui/components.css';
import '../assets/design-tokens.css';

export function Profile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const uid = Number(user?.id);

  const [meters, setMeters] = useState<Meter[]>([]);
  const [meterLoading, setMeterLoading] = useState(true);

  const [meterOpen, setMeterOpen] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [meterError, setMeterError] = useState<string | null>(null);
  const [meterSaving, setMeterSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;
    async function load() {
      try {
        const res = await getMetersBySellerId(uid);
        setMeters(res.data ?? []);
      } catch {
        setMeters([]);
      } finally {
        setMeterLoading(false);
      }
    }
    load();
  }, [uid]);

  async function handleAddMeter() {
    if (!deviceId.trim()) { setMeterError('Device ID is required.'); return; }
    setMeterSaving(true);
    setMeterError(null);
    try {
      await createMeter(uid, deviceId.trim());
      const res = await getMetersBySellerId(uid);
      setMeters(res.data ?? []);
      setMeterOpen(false);
      setDeviceId('');
    } catch (err: unknown) {
      setMeterError(err instanceof Error ? err.message : 'Failed to add meter.');
    } finally {
      setMeterSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <p className="profile-page-label">Account</p>
        <h1 className="profile-page-title">Profile</h1>
        <p className="profile-page-sub">Your account details and connected meters.</p>
      </div>

      <div className="profile-grid">
        {/* Account Info */}
        <div className="profile-card">
          <h2 className="profile-card-title">Account Info</h2>

          <div className="profile-info-row">
            <span className="profile-info-label">Full Name</span>
            <span className="profile-info-value">{user?.full_name ?? '—'}</span>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user?.email ?? '—'}</span>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-label">Phone</span>
            <span className="profile-info-value">
              {(user as { phone_number?: string })?.phone_number ?? '—'}
            </span>
          </div>

          <div style={{ marginTop: 24 }}>
            <button className="ui-btn ui-btn-tertiary ui-btn-md" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Meters */}
        <div className="profile-card">
          <div className="profile-meters-header">
            <h2 className="profile-meters-title">My Meters</h2>
            <button className="ui-btn ui-btn-secondary ui-btn-sm" onClick={() => setMeterOpen(true)}>
              + Add
            </button>
          </div>

          {meterLoading ? (
            <div className="profile-loading">
              <div className="profile-spinner" /> Loading meters...
            </div>
          ) : meters.length === 0 ? (
            <div className="profile-meters-empty">
              No meters linked yet.<br />
              <button
                className="ui-btn ui-btn-tertiary ui-btn-sm"
                style={{ marginTop: 10 }}
                onClick={() => setMeterOpen(true)}
              >
                Add your first meter
              </button>
            </div>
          ) : (
            meters.map((m) => (
              <div key={m.id} className="profile-meter-item">
                <span className="profile-meter-device">{m.deviceId}</span>
                <span className="profile-meter-badge">
                  <span className={`status-badge ${m.isActive ? 'status-completed' : 'status-failed'}`}>
                    {m.isActive ? 'Active' : 'Offline'}
                  </span>
                </span>
                <div className="profile-meter-stats">
                  <span>Gen: <span className="profile-meter-stat-val">{Number(m.totalGeneratedKwh).toFixed(1)} kWh</span></span>
                  <span>Used: {Number(m.consumedKwh).toFixed(1)} kWh</span>
                  <span>Surplus: <span className="profile-meter-stat-val">{(Number(m.totalGeneratedKwh) - Number(m.consumedKwh)).toFixed(1)} kWh</span></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Meter Modal */}
      <Modal open={meterOpen} onClose={() => !meterSaving && setMeterOpen(false)} title="Add Smart Meter">
        {meterError && <div className="profile-error">{meterError}</div>}
        <div className="ui-field">
          <label className="ui-field-label">Device ID</label>
          <div className="ui-field-wrap">
            <input
              className="ui-input ui-input-no-icon"
              type="text"
              placeholder="e.g. KL-2025-XXXX"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              autoFocus
            />
          </div>
          <span className="ui-field-hint">Found on your smart meter label.</span>
        </div>
        <div className="ui-modal-footer">
          <button className="ui-btn ui-btn-tertiary ui-btn-md" onClick={() => setMeterOpen(false)} disabled={meterSaving}>
            Cancel
          </button>
          <button className="ui-btn ui-btn-primary ui-btn-md" onClick={handleAddMeter} disabled={meterSaving}>
            {meterSaving ? 'Adding...' : 'Add Meter'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
