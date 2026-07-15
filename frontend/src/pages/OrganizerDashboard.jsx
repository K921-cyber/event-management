import { useEffect, useState } from 'react';
import client from '../api/client';
import CreateEventForm from '../components/CreateEventForm';
import AnalyticsPanel from '../components/AnalyticsPanel';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const loadEvents = async () => {
    try {
      const { data } = await client.get('/events/mine/list');
      setEvents(data);
      if (data.length && !selectedEventId) setSelectedEventId(data[0]._id);
    } catch (e) {
      console.error('Failed to load events', e);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const publishEvent = async (id) => {
    try {
      await client.put(`/events/${id}`, { status: 'live' });
      loadEvents();
    } catch (e) {
      console.error('Failed to publish event', e);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await client.delete(`/events/${id}`);
      setSelectedEventId('');
      loadEvents();
    } catch (e) {
      console.error('Failed to delete event', e);
    }
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <p className="eyebrow">Organizer dashboard</p>
          <h1 style={{ margin: 0 }}>Your events</h1>
        </div>
        <button
          className={`btn ${showCreate ? 'btn-ghost' : 'btn-primary'}`}
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Close form' : '+ New event'}
        </button>
      </div>

      {showCreate && (
        <div style={{
          marginBottom: 28,
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <CreateEventForm
            onCreated={(ev) => {
              setShowCreate(false);
              loadEvents();
              setSelectedEventId(ev._id);
            }}
          />
        </div>
      )}

      {events.length === 0 && !showCreate && (
        <div className="empty-state">
          You haven't created any events yet.{' '}
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            Create your first event
          </button>
        </div>
      )}

      {events.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <label style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-ink-soft)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: 8,
          }}>
            Select an event
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ maxWidth: 360, flex: 1 }}
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({ev.status})
                </option>
              ))}
            </select>
            {selectedEvent?.status === 'draft' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => publishEvent(selectedEventId)}
              >
                Publish event
              </button>
            )}
            {selectedEvent && (
              <button
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--color-error)', borderColor: 'rgba(239,68,68,0.3)' }}
                onClick={() => deleteEvent(selectedEventId)}
              >
                Delete
              </button>
            )}
          </div>

          {selectedEvent?.status === 'draft' && (
            <div style={{
              marginTop: 14,
              padding: '12px 16px',
              background: 'var(--color-warning-bg)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--color-warning)',
              border: '1px solid rgba(245,158,11,0.15)',
            }}>
              ⚠️ This event is a draft and not visible to attendees yet. Click "Publish event" to make it live.
            </div>
          )}
        </div>
      )}

      {selectedEventId && (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <AnalyticsPanel eventId={selectedEventId} />
        </div>
      )}
    </div>
  );
}
