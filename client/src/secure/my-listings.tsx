import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import {
  getListingBySellerId,
  createListing,
  updateListingActiveStatus,
  deleteListing,
} from '../services/listings';
import { getMetersBySellerId, createMeter } from '../services/meters';
import type { Listing, Meter } from '../types';
import { Modal } from '../components/ui';
import './my-listings.css';
import '../components/ui/components.css';
import '../assets/design-tokens.css';

export function MyListings() {
  const user = useAuthStore((s) => s.user);
  const uid = Number(user?.id);

  const [listings, setListings] = useState<Listing[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [meterLoading, setMeterLoading] = useState(true);

  // Create listing modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newMeterId, setNewMeterId] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add meter modal
  const [meterOpen, setMeterOpen] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [meterError, setMeterError] = useState<string | null>(null);
  const [meterSaving, setMeterSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;
    loadListings();
    loadMeters();
  }, [uid]);

  async function loadListings() {
    setListLoading(true);
    try {
      const res = await getListingBySellerId(uid);
      setListings(res.data ?? []);
    } catch {
      setListings([]);
    } finally {
      setListLoading(false);
    }
  }

  async function loadMeters() {
    setMeterLoading(true);
    try {
      const res = await getMetersBySellerId(uid);
      setMeters(res.data ?? []);
    } catch {
      setMeters([]);
    } finally {
      setMeterLoading(false);
    }
  }

  async function handleCreateListing() {
    if (!newPrice || !newMeterId) {
      setCreateError('Price and meter are required.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      await createListing(uid, Number(newMeterId), parseFloat(newPrice), newLocation);
      setCreateOpen(false);
      setNewLocation('');
      setNewPrice('');
      setNewMeterId('');
      await loadListings();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create listing.');
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleToggleActive(listing: Listing) {
    try {
      await updateListingActiveStatus(listing.id, uid, !listing.isActive);
      setListings((prev) =>
        prev.map((l) => l.id === listing.id ? { ...l, isActive: !l.isActive } : l)
      );
    } catch {
      // silently fail
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteListing(deleteTarget.id, uid);
      setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // silently fail
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleAddMeter() {
    if (!newDeviceId.trim()) {
      setMeterError('Device ID is required.');
      return;
    }
    setMeterSaving(true);
    setMeterError(null);
    try {
      await createMeter(uid, newDeviceId.trim());
      setMeterOpen(false);
      setNewDeviceId('');
      await loadMeters();
    } catch (err: unknown) {
      setMeterError(err instanceof Error ? err.message : 'Failed to add meter.');
    } finally {
      setMeterSaving(false);
    }
  }

  return (
    <div className="ml-page">
      <div className="ml-page-header">
        <p className="ml-page-label">My Account</p>
        <h1 className="ml-page-title">My Listings</h1>
        <p className="ml-page-sub">Manage your energy listings and connected meters.</p>
      </div>

      {/* ── Energy Listings ── */}
      <div className="ml-section">
        <div className="ml-section-header">
          <div>
            <h2 className="ml-section-title">Energy Listings</h2>
            <p className="ml-section-sub">{listings.length} listing{listings.length !== 1 ? 's' : ''} total</p>
          </div>
          <button className="ui-btn ui-btn-primary ui-btn-md" onClick={() => setCreateOpen(true)}>
            + New Listing
          </button>
        </div>

        {listLoading ? (
          <div className="ml-loading"><div className="ml-spinner" /> Loading listings...</div>
        ) : (
          <div className="ml-table-wrap">
            <table className="ml-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Location</th>
                  <th>Price / kWh</th>
                  <th>Available kWh</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                  <tr className="ml-empty-row">
                    <td colSpan={6}>No listings yet. Create one to start selling energy.</td>
                  </tr>
                ) : (
                  listings.map((l) => (
                    <tr key={l.id}>
                      <td style={{ color: 'var(--text-muted)' }}>#{l.id}</td>
                      <td>{l.location ?? '—'}</td>
                      <td><span className="ml-price">₦{Number(l.pricePerKwh).toLocaleString('en-NG')}</span></td>
                      <td><span className="ml-surplus">{Number(l.availableKwh).toFixed(1)} kWh</span></td>
                      <td>
                        <span className={`status-badge ${l.isActive ? 'status-completed' : 'status-failed'}`}>
                          {l.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="ml-row-actions">
                          <button
                            className={`ml-action-btn ${l.isActive ? 'toggle-on' : ''}`}
                            onClick={() => handleToggleActive(l)}
                          >
                            {l.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="ml-action-btn delete"
                            onClick={() => setDeleteTarget(l)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ml-divider" />

      {/* ── Meters ── */}
      <div className="ml-section">
        <div className="ml-section-header">
          <div>
            <h2 className="ml-section-title">My Meters</h2>
            <p className="ml-section-sub">Smart meters linked to your solar installation.</p>
          </div>
          <button className="ui-btn ui-btn-secondary ui-btn-md" onClick={() => setMeterOpen(true)}>
            + Add Meter
          </button>
        </div>

        {meterLoading ? (
          <div className="ml-loading"><div className="ml-spinner" /> Loading meters...</div>
        ) : (
          <div className="ml-table-wrap">
            <table className="ml-table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Generated</th>
                  <th>Consumed</th>
                  <th>Surplus</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {meters.length === 0 ? (
                  <tr className="ml-empty-row">
                    <td colSpan={6}>No meters registered. Add your smart meter to get started.</td>
                  </tr>
                ) : (
                  meters.map((m) => (
                    <tr key={m.id}>
                      <td style={{ color: 'var(--text)', fontFamily: "'Chakra Petch', sans-serif" }}>
                        {m.deviceId}
                      </td>
                      <td>{Number(m.totalGeneratedKwh).toFixed(2)} kWh</td>
                      <td>{Number(m.consumedKwh).toFixed(2)} kWh</td>
                      <td>
                        <span className="ml-surplus">
                          {(Number(m.totalGeneratedKwh) - Number(m.consumedKwh)).toFixed(2)} kWh
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${m.isActive ? 'status-completed' : 'status-failed'}`}>
                          {m.isActive ? 'Active' : 'Offline'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {new Date(m.lastUpdated).toLocaleString('en-NG', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create Listing Modal ── */}
      <Modal open={createOpen} onClose={() => !createLoading && setCreateOpen(false)} title="New Energy Listing">
        {createError && <div className="ml-error">{createError}</div>}
        <div className="ui-field">
          <label className="ui-field-label">Location</label>
          <div className="ui-field-wrap">
            <input
              className="ui-input ui-input-no-icon"
              type="text"
              placeholder="e.g. Lagos, Ikeja"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>
        </div>
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
          <label className="ui-field-label">Meter</label>
          <div className="ui-field-wrap">
            <select
              className="ui-input ui-input-no-icon"
              value={newMeterId}
              onChange={(e) => setNewMeterId(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select a meter</option>
              {meters.map((m) => (
                <option key={m.id} value={m.id}>{m.deviceId} — {(Number(m.totalGeneratedKwh) - Number(m.consumedKwh)).toFixed(1)} kWh surplus</option>
              ))}
            </select>
          </div>
          {meters.length === 0 && (
            <span className="ui-field-hint">No meters yet — add one below first.</span>
          )}
        </div>
        <div className="ui-modal-footer">
          <button className="ui-btn ui-btn-tertiary ui-btn-md" onClick={() => setCreateOpen(false)} disabled={createLoading}>
            Cancel
          </button>
          <button className="ui-btn ui-btn-primary ui-btn-md" onClick={handleCreateListing} disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteTarget} onClose={() => !deleteLoading && setDeleteTarget(null)} title="Delete Listing">
        <p className="ml-confirm-text">
          Are you sure you want to delete listing <strong>#{deleteTarget?.id}</strong>?
        </p>
        <p className="ml-confirm-warn">This action cannot be undone.</p>
        <div className="ui-modal-footer">
          <button className="ui-btn ui-btn-tertiary ui-btn-md" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
            Cancel
          </button>
          <button className="ui-btn ui-btn-primary ui-btn-md" onClick={handleDelete} disabled={deleteLoading}
            style={{ background: 'var(--red)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* ── Add Meter Modal ── */}
      <Modal open={meterOpen} onClose={() => !meterSaving && setMeterOpen(false)} title="Add Smart Meter">
        {meterError && <div className="ml-error">{meterError}</div>}
        <div className="ui-field">
          <label className="ui-field-label">Device ID</label>
          <div className="ui-field-wrap">
            <input
              className="ui-input ui-input-no-icon"
              type="text"
              placeholder="e.g. KL-2025-XXXX"
              value={newDeviceId}
              onChange={(e) => setNewDeviceId(e.target.value)}
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
