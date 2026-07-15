import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--color-bg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--gradient-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(255,92,74,0.3)',
          }}>🎪</div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Get started</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-ink-soft)' }}>
            Create your EventFlow account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
          <div className="field">
            <label>Full name</label>
            <input className="input" required value={form.name}
              placeholder="Your full name"
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email}
              placeholder="you@example.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required minLength={6} value={form.password}
              placeholder="At least 6 characters"
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="field">
            <label>I am signing up as</label>
            <div style={{
              display: 'flex',
              gap: 10,
            }}>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'attendee' })}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: form.role === 'attendee' ? '2px solid var(--color-accent)' : '1.5px solid var(--color-border)',
                  background: form.role === 'attendee' ? 'var(--color-accent-glow)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>👤</div>
                <div style={{ fontWeight: form.role === 'attendee' ? 700 : 500 }}>Attendee</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-soft)', marginTop: 2 }}>Book tickets</div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'organizer' })}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: form.role === 'organizer' ? '2px solid var(--color-accent)' : '1.5px solid var(--color-border)',
                  background: form.role === 'organizer' ? 'var(--color-accent-glow)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>🎪</div>
                <div style={{ fontWeight: form.role === 'organizer' ? 700 : 500 }}>Organizer</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-soft)', marginTop: 2 }}>Host events</div>
              </button>
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Log in →</Link>
        </p>
      </div>
    </div>
  );
}
