import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from 'recharts';
import client from '../api/client';

const BAR_COLORS = ['#FF5C4A', '#1B1540', '#2DD4A0', '#F59E0B', '#667eea'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      boxShadow: 'var(--shadow)',
      fontSize: '0.85rem',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--color-ink)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: 0 }}>
          {p.name}: {p.name === 'revenue' ? `$${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPanel({ eventId }) {
  const [summary, setSummary] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [byTier, setByTier] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    Promise.all([
      client.get(`/analytics/event/${eventId}/summary`),
      client.get(`/analytics/event/${eventId}/sales-over-time`),
      client.get(`/analytics/event/${eventId}/revenue-by-tier`),
    ]).then(([s, sa, t]) => {
      setSummary(s.data);
      setSalesOverTime(sa.data);
      setByTier(t.data);
    }).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return <div className="loading-dots"><span></span><span></span><span></span></div>;
  }

  if (!summary) return null;

  const soldPercentage = summary.capacity > 0
    ? Math.round((summary.ticketsSold / summary.capacity) * 100)
    : 0;

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="stat">
          <span className="label">Tickets sold</span>
          <span className="value">{summary.ticketsSold} / {summary.capacity}</span>
          <div style={{
            marginTop: 8,
            height: 6,
            borderRadius: 3,
            background: 'var(--color-border)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${soldPercentage}%`,
              height: '100%',
              background: 'var(--gradient-accent)',
              borderRadius: 3,
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>

        <div className="stat">
          <span className="label">Total revenue</span>
          <span className="value" style={{ color: 'var(--color-accent)' }}>
            ${summary.totalRevenue.toFixed(2)}
          </span>
        </div>

        <div className="stat">
          <span className="label">Checked in</span>
          <span className="value" style={{ color: 'var(--color-success)' }}>
            {summary.checkedIn}
          </span>
          <span style={{ color: 'var(--color-ink-soft)', fontSize: '0.82rem', marginTop: 4 }}>
            {summary.ticketsSold > 0
              ? `${Math.round((summary.checkedIn / summary.ticketsSold) * 100)}% attendance rate`
              : 'No check-ins yet'}
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-2">
        <div className="card">
          <h4>Sales over time</h4>
          {salesOverTime.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-soft)', fontSize: '0.85rem' }}>
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={salesOverTime} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }}
                  tickFormatter={(d) => {
                    const parts = d.split('-');
                    return parts.length >= 2 ? `${parts[1]}/${parts[2]}` : d;
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="revenue"
                  stroke="#FF5C4A" strokeWidth={2.5}
                  dot={{ fill: '#FF5C4A', r: 3 }}
                  activeDot={{ r: 5, fill: '#FF5C4A' }}
                  name="revenue"
                />
                <Line
                  type="monotone" dataKey="ticketsSold"
                  stroke="#2DD4A0" strokeWidth={2}
                  dot={{ fill: '#2DD4A0', r: 3 }}
                  activeDot={{ r: 5, fill: '#2DD4A0' }}
                  name="tickets"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h4>Revenue by ticket tier</h4>
          {byTier.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-soft)', fontSize: '0.85rem' }}>
              No tier data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byTier} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="tierName"
                  tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} name="revenue">
                  {byTier.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
