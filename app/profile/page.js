'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const EMOJIS = ['🐼','🦊','🐨','🦁','🐯','🐸','🦄','🐙','🦋','🐬','🦅','🐺'];
const COLORS  = [
  { name: 'purple', hex: '#9B6DFF' },
  { name: 'blue',   hex: '#38BDF8' },
  { name: 'green',  hex: '#22C55E' },
  { name: 'gold',   hex: '#F59E0B' },
  { name: 'red',    hex: '#F87171' },
  { name: 'teal',   hex: '#00C6AE' },
];

export default function ProfilePage() {
  const { user, logout, loading: authLoad } = useAuth();
  const router = useRouter();
  const [stats, setStats]       = useState(null);
  const [emoji, setEmoji]       = useState('');
  const [color, setColor]       = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      setEmoji(user.avatarEmoji || '🐼');
      setColor(user.avatarColor || 'purple');
      setUsername(user.username || '');
      loadStats();
    }
  }, [authLoad, user]);

  async function loadStats() {
    setLoading(true);
    try {
      const [st, str] = await Promise.all([
        api.get('/api/stats'),
        api.get('/api/streak'),
      ]);
      setStats({ ...st.data, streak: str.data.streak });
    } catch {}
    setLoading(false);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/api/auth/profile', { username, avatarEmoji: emoji, avatarColor: color });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setSaving(false);
  }

  const clrHex = COLORS.find(c => c.name === color)?.hex || '#9B6DFF';

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ padding: '28px 28px 40px', maxWidth: 700, margin: '0 auto' }}>

      {/* Avatar hero */}
      <div style={{
        background: `linear-gradient(135deg, ${clrHex}18, ${clrHex}08)`,
        border: `1px solid ${clrHex}28`,
        borderRadius: 24, padding: '32px 24px',
        textAlign: 'center', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${clrHex}22, transparent)`,
          top: -60, left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 96, height: 96, borderRadius: '50%',
          background: `${clrHex}22`,
          border: `3px solid ${clrHex}55`,
          fontSize: 52, marginBottom: 16,
          boxShadow: `0 0 40px ${clrHex}33`,
          transition: 'all 0.3s', position: 'relative', zIndex: 1,
        }}>
          {emoji}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#EDE9FF', marginBottom: 4, position: 'relative', zIndex: 1 }}>
          {user?.username}
        </div>
        {user?.isAdmin && (
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: '#fff', borderRadius: 100, padding: '3px 14px',
            fontSize: 11, fontWeight: 900, letterSpacing: 0.8,
          }}>
            ADMIN
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Streak', value: stats.streak, icon: '🔥', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
            { label: 'XP оноо', value: stats.xp || 0, icon: '⭐', color: '#9B6DFF', bg: 'rgba(155,109,255,0.1)', border: 'rgba(155,109,255,0.2)' },
            { label: 'Үгийн сан', value: stats.wordCount || 0, icon: '📝', color: '#38BDF8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
            { label: 'Давтсан', value: stats.reviewCount || 0, icon: '🔄', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16,
              padding: '16px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.value}</div>
              <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      <div className="card" style={{ marginBottom: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 20, color: '#EDE9FF' }}>Профайл засах</h3>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
              Нэвтрэх нэр
            </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Avatar Emoji
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EMOJIS.map(e => (
                <button type="button" key={e} onClick={() => setEmoji(e)} style={{
                  fontSize: 24, borderRadius: 11, padding: '7px 10px', cursor: 'pointer',
                  border: `1.5px solid ${emoji === e ? `${clrHex}66` : 'rgba(255,255,255,0.07)'}`,
                  background: emoji === e ? `${clrHex}18` : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                  boxShadow: emoji === e ? `0 0 14px ${clrHex}33` : 'none',
                }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Avatar Өнгө
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              {COLORS.map(c => (
                <button type="button" key={c.name} onClick={() => setColor(c.name)} style={{
                  width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                  background: c.hex,
                  border: color === c.name ? '3px solid rgba(255,255,255,0.85)' : '2px solid transparent',
                  outline: color === c.name ? `2px solid ${c.hex}` : 'none',
                  outlineOffset: 2,
                  transition: 'all 0.15s',
                  boxShadow: color === c.name ? `0 0 16px ${c.hex}66` : 'none',
                }} />
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-purple" disabled={saving} style={{ fontSize: 14, padding: '13px 22px' }}>
            {saving ? 'Хадгалж байна...' : saved ? '✓ Хадгалагдлаа!' : 'Хадгалах'}
          </button>
        </form>
      </div>

      <button onClick={logout} className="btn btn-red" style={{ width: '100%', padding: '13px 22px', fontSize: 14 }}>
        Гарах
      </button>
    </div>
  );
}
