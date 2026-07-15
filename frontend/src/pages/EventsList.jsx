import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const categoryGradients = {
  Music: 'gradient-music',
  Technology: 'gradient-tech',
  Food: 'gradient-food',
  Entertainment: 'gradient-entertainment',
  Sports: 'gradient-sports',
  Education: 'gradient-education',
};

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await client.get('/events', { params: q ? { search: q } : {} });
      setEvents(data);
    } catch (e) {
      console.error('Failed to fetch events', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  return (
    <>
      <div className="hero-section">
        <h1>Discover amazing events</h1>
        <p>Free tickets to the best music, tech, food, and entertainment events near you</p>
        <form
          onSubmit={(e) => { e.preventDefault(); fetchEvents(search); }}
          className="search-bar"
        >
          <span className="search-icon">🔍</span>
          <input
            className="input"
            placeholder="Search events, categories, cities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
      </div>

      <div className="container" style={{ paddingTop: 0 }}>
        {loading && (
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="empty-state">
            No live events right now. Check back soon!
          </div>
        )}

        <div className="grid grid-3">
          {events.map((ev) => {
            const minPrice = Math.min(...ev.ticketTiers.map((t) => t.price));
            const gradientClass = categoryGradients[ev.category] || 'gradient-default';
            const isSoldOut = ev.status === 'sold_out';

            return (
              <Link to={`/events/${ev._id}`} key={ev._id} className="event-card">
                <div className={`card-img ${gradientClass}`}>
                  <div className="card-bg" />
                  <span className={`badge-status badge-${ev.status}`}>
                    {ev.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    <span>📅 {new Date(ev.startDate).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}</span>
                    <span>📍 {ev.venue?.city}</span>
                  </div>
                  <h3>{ev.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ev.description}
                  </p>
                  <div className="card-price">
                    {isSoldOut ? (
                      <span style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>Sold out</span>
                    ) : minPrice === 0 ? (
                      'Free'
                    ) : (
                      `From $${minPrice.toFixed(2)}`
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
