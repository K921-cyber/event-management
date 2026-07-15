import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/bookings/mine').then(({ data }) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <div className="container">
      <p className="eyebrow">Your tickets</p>
      <h1>My Tickets</h1>

      {bookings.length === 0 && (
        <div className="empty-state">
          You haven't booked any events yet.{' '}
          <Link to="/">Browse events →</Link>
        </div>
      )}

      <div className="grid grid-2">
        {bookings.map((b) => {
          const isPast = b.event?.startDate && new Date(b.event.startDate) < new Date();

          return (
            <div className="ticket-card" key={b._id}>
              <div className="ticket-header">
                <h3>{b.event?.title || 'Unknown Event'}</h3>
                <div className="ticket-meta">
                  {b.event?.startDate && (
                    <span>
                      {new Date(b.event.startDate).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                      {' · '}
                      {new Date(b.event.startDate).toLocaleTimeString(undefined, {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  )}
                  {b.event?.venue?.name && <span> · {b.event.venue.name}</span>}
                </div>
              </div>

              <div className="ticket-body">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {b.tierName} × {b.quantity}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                    ${b.totalAmount.toFixed(2)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  width: '100%',
                  fontSize: '0.82rem',
                }}>
                  {b.checkedIn ? (
                    <span className="ticket-status" style={{
                      background: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                    }}>
                      ✅ Checked in
                    </span>
                  ) : isPast ? (
                    <span className="ticket-status" style={{
                      background: 'rgba(107, 101, 128, 0.1)',
                      color: 'var(--color-ink-soft)',
                    }}>
                      Event ended
                    </span>
                  ) : (
                    <span className="ticket-status" style={{
                      background: 'rgba(45, 212, 160, 0.1)',
                      color: 'var(--color-success)',
                    }}>
                      ● Active
                    </span>
                  )}
                  <span className="ticket-status" style={{
                    background: 'rgba(27, 21, 64, 0.06)',
                    color: 'var(--color-ink-soft)',
                  }}>
                    {b.paymentStatus}
                  </span>
                </div>

                {b.paymentStatus === 'paid' && b.qrCodeDataUrl ? (
                  <div className="qr-box" style={{ margin: '12px 0 0', width: '100%' }}>
                    <img src={b.qrCodeDataUrl} alt="Ticket QR code" />
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-ink-muted)',
                      margin: 0,
                      textAlign: 'center',
                    }}>
                      Show this QR code at the venue entrance
                    </p>
                  </div>
                ) : b.paymentStatus === 'pending' ? (
                  <p className="error-text" style={{ marginTop: 12, width: '100%' }}>
                    Payment pending — refresh once payment completes.
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
