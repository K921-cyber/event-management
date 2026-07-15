import { useState } from 'react';
import client from '../api/client';

const emptyTier = () => ({ name: '', price: '', quantityTotal: '' });

export default function CreateEventForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'General',
    venueName: '', address: '', city: '',
    startDate: '', endDate: '',
  });
  const [tiers, setTiers] = useState([emptyTier()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateTier = (i, field, value) => {
    const next = [...tiers];
    next[i][field] = value;
    setTiers(next);
  };

  const removeTier = (i) => {
    if (tiers.length <= 1) return;
    setTiers(tiers.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        venue: { name: form.venueName, address: form.address, city: form.city },
        startDate: form.startDate,
        endDate: form.endDate,
        ticketTiers: tiers.map((t) => ({
          name: t.name,
          price: Number(t.price),
          quantityTotal: Number(t.quantityTotal),
        })),
      };
      const { data } = await client.post('/events', payload);
      onCreated(data);
      setForm({
        title: '', description: '', category: 'General',
        venueName: '', address: '', city: '',
        startDate: '', endDate: '',
      });
      setTiers([emptyTier()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create event');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['General', 'Music', 'Technology', 'Food', 'Entertainment', 'Sports', 'Education', 'Art'];

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ marginBottom: 20 }}>Create a new event</h3>

      <div className="grid grid-2">
        <div className="field">
          <label>Event title</label>
          <input
            className="input" required
            placeholder="e.g. Mumbai Music Festival 2026"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          className="input" rows={3} required
          placeholder="Describe what makes this event special…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <h4 style={{ margin: '16px 0 12px', fontSize: '0.95rem' }}>📍 Venue</h4>
      <div className="grid grid-2">
        <div className="field">
          <label>Venue name</label>
          <input className="input" required value={form.venueName}
            onChange={(e) => setForm({ ...form, venueName: e.target.value })} />
        </div>
        <div className="field">
          <label>City</label>
          <input className="input" required value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Address</label>
          <input className="input" required value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
      </div>

      <h4 style={{ margin: '16px 0 12px', fontSize: '0.95rem' }}>📅 Date & time</h4>
      <div className="grid grid-2">
        <div className="field">
          <label>Start date/time</label>
          <input className="input" type="datetime-local" required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div className="field">
          <label>End date/time</label>
          <input className="input" type="datetime-local" required
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
      </div>

      <h4 style={{ margin: '16px 0 12px', fontSize: '0.95rem' }}>🎟️ Ticket tiers</h4>
      {tiers.map((t, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 10,
            alignItems: 'center',
            padding: 12,
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <input className="input" placeholder="Tier name" required
            value={t.name} onChange={(e) => updateTier(i, 'name', e.target.value)}
            style={{ flex: 2 }} />
          <input className="input" placeholder="Price ($)" type="number" min="0" step="0.01" required
            value={t.price} onChange={(e) => updateTier(i, 'price', e.target.value)}
            style={{ flex: 1 }} />
          <input className="input" placeholder="Qty" type="number" min="1" required
            value={t.quantityTotal} onChange={(e) => updateTier(i, 'quantityTotal', e.target.value)}
            style={{ flex: 1 }} />
          {tiers.length > 1 && (
            <button type="button" className="btn-icon btn-ghost" onClick={() => removeTier(i)}
              style={{ flexShrink: 0, fontSize: '1rem', color: 'var(--color-error)' }}>
              ✕
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={() => setTiers([...tiers, emptyTier()])}>
        + Add tier
      </button>

      {error && <p className="error-text">{error}</p>}
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Creating…' : '🎪 Create event (as draft)'}
        </button>
      </div>
    </form>
  );
}
