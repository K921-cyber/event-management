import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
        maxWidth: 400,
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
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Welcome back</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-ink-soft)' }}>
            Log in to EventFlow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem' }}>
          No account? <Link to="/register">Sign up →</Link>
        </p>

        <div style={{
          marginTop: 24,
          padding: 16,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          fontSize: '0.82rem',
        }}>
          <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-primary)' }}>
            🎭 Demo accounts
          </p>
          <p style={{ margin: 0, lineHeight: 1.8, fontSize: '0.8rem' }}>
            <strong>Organizer:</strong> rahul@example.com / password123<br />
            <strong>Attendee:</strong> priya@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
