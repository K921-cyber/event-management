import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get(`/events/${id}`).then(({ data }) => {
      setEvent(data);
      if (data.ticketTiers.length) setSelectedTier(data.ticketTiers[0]._id);
    });
  }, [id]);

  const bookTicket = async () => {
    if (!user) return navigate('/login');
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/bookings/checkout', {
        eventId: id,
        ticketTierId: selectedTier,
        quantity: Number(quantity),
      });
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not book ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="container">
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  const tier = event.ticketTiers.find((t) => t._id === selectedTier);
  const remaining = tier ? tier.quantityTotal - tier.quantitySold : 0;

  if (booking) {
    return (
      <div className="container">
        <div className="confirmation">
          <div className="check-icon">🎉</div>
          <h2>You're booked!</h2>
          <p>Your free ticket is confirmed. Show the QR code at the venue entrance to check in.</p>
          <div className="qr-box">
            <img src={booking.qrCodeDataUrl} alt="Ticket QR code" />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => navigate('/my-tickets')}>
              View My Tickets
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="detail-hero">
        <span className={`badge-status badge-${event.status}`}>
          {event.status.replace('_', ' ')}
        </span>
        <div className="hero-overlay">
          <h1>{event.title}</h1>
          <div className="hero-meta">
            <span>📅 {new Date(event.startDate).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            })}</span>
            <span>⏰ {new Date(event.startDate).toLocaleTimeString(undefined, {
              hour: '2-digit', minute: '2-digit'
            })}</span>
            <span>📍 {event.venue?.name}, {event.venue?.city}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 20 }}>
            {event.description}
          </p>
          <div className="card" style={{ background: 'var(--color-bg)', border: 'none' }}>
            <h4>Venue</h4>
            <p style={{ margin: 0 }}>
              <strong>{event.venue?.name}</strong><br />
              {event.venue?.address}, {event.venue?.city}
            </p>
          </div>
          {event.organizer && (
            <div className="card" style={{ background: 'var(--color-bg)', border: 'none', marginTop: 16 }}>
              <h4>Hosted by</h4>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-ink)' }}>
                {event.organizer.name}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="booking-card">
            <h3>Get your free ticket</h3>
            <div className="field">
              <label>Ticket type</label>
              <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
                {event.ticketTiers.map((t) => (
                  <option key={t._id} value={t._id} disabled={t.quantitySold >= t.quantityTotal}>
                    {t.name} — ${t.price.toFixed(2)} ({t.quantityTotal - t.quantitySold} left)
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Quantity</label>
              <input
                className="input" type="number" min={1} max={Math.max(remaining, 1)}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            {tier && (
              <div style={{
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: 'var(--color-ink-soft)', fontSize: '0.85rem' }}>Total</span>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-display)',
                }}>
                  ${(tier.price * quantity).toFixed(2)}
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 500, marginLeft: 8 }}>
                    Free
                  </span>
                </span>
              </div>
            )}
            {error && <p className="error-text">{error}</p>}
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 24px' }}
              disabled={!tier || remaining < 1 || loading}
              onClick={bookTicket}
            >
              {loading ? 'Booking…' : remaining < 1 ? 'Sold out' : '🎟️ Get Free Ticket'}
            </button>
            {!user && (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: 12 }}>
                <a href="/login">Log in</a> to book tickets
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
