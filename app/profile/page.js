'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const EMOJIS = ['🐼','🦊','🐨','🦁','🐯','🐸','🦄','🐙','🦋','🐬','🦅','🐺'];
const COLORS  = [
  { name: 'green',  hex: '#58CC02' },
  { name: 'blue',   hex: '#1CB0F6' },
  { name: 'purple', hex: '#CE82FF' },
  { name: 'gold',   hex: '#FF9600' },
  { name: 'red',    hex: '#FF4B4B' },
  { name: 'teal',   hex: '#00C6AE' },
];

export default function ProfilePage() {
  const { user, logout, loading: authLoad } = useAuth();
  const router = useRouter();
  const [stats, setStats]         = useState(null);
  const [emoji, setEmoji]         = useState('');
  const [color, setColor]         = useState('');
  const [username, setUsername]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      setEmoji(user.avatarEmoji || '🐼');
      setColor(user.avatarColor || 'green');
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
      alert('Профайл шинэчлэгдлэ! ✅');
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setSaving(false);
  }

  const clrHex = COLORS.find(c => c.name === color)?.hex || '#58CC02';

  if (authLoad || loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ fontSize: 40 }}>⏳</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>👤 Профайл</h1>

      {/* Avatar preview */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 88, height: 88, borderRadius: '50%',
          background: clrHex + '22', border: `3px solid ${clrHex}`,
          fontSize: 44,
        }}>
          {emoji}
        </div>
        <div style={{ fontWeight: 900, fontSize: 18, marginTop: 8 }}>{user?.username}</div>
        {user?.isAdmin && (
          <span style={{
            background: '#FF9600', color: '#fff', borderRadius: 20,
            padding: '3px 12px', fontSize: 12, fontWeight: 900,
          }}>ADMIN</span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Streak', value: `🔥 ${stats.streak}`, sub: 'өдөр' },
            { label: 'XP', value: `⭐ ${stats.xp || 0}`, sub: 'оноо' },
            { label: 'Үгс', value: `📝 ${stats.wordCount || 0}`, sub: 'нийт' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Мэдээлэл засах</h3>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>НЭВТРЭХ НЭР</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              required style={{ marginTop: 6 }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>EMOJI</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {EMOJIS.map(e => (
                <button type="button" key={e} onClick={() => setEmoji(e)}
                  style={{
                    fontSize: 22, borderRadius: 10, padding: '6px 10px', cursor: 'pointer',
                    border: `2px solid ${emoji === e ? 'var(--blue)' : 'var(--border)'}`,
                    background: emoji === e ? 'var(--blue-light)' : 'var(--bg-alt)',
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>ӨНГӨ</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {COLORS.map(c => (
                <button type="button" key={c.name} onClick={() => setColor(c.name)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                    background: c.hex, border: color === c.name ? '3px solid #333' : '2px solid transparent',
                  }} />
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-green" disabled={saving}>
            {saving ? 'Хадгалж байна...' : 'ХАДГАЛАХ'}
          </button>
        </form>
      </div>

      <button onClick={logout} className="btn btn-red" style={{ width: '100%', fontSize: 15 }}>
        Гарах
      </button>
    </div>
  );
}
