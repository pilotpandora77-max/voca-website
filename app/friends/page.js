'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const TABS = ['Найзууд', 'Хүсэлтүүд', 'Хайх'];

function Avatar({ u, size = 42 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42,
    }}>
      {u.avatarEmoji || u.username?.[0]?.toUpperCase()}
    </div>
  );
}

export default function FriendsPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [tab, setTab] = useState('Найзууд');
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [sent, setSent] = useState({});

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
      load();
    }
  }, [authLoad, user]);

  function load() {
    setLoading(true);
    Promise.all([api.get('/api/friends'), api.get('/api/friends/requests')])
      .then(([f, r]) => { setFriends(f.data || []); setRequests(r.data || []); setLocked(false); })
      .catch(e => { if (e.response?.status === 403) setLocked(true); })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      api.get('/api/friends/search', { params: { q: q.trim() } }).then(r => setResults(r.data || [])).catch(() => {});
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  async function sendRequest(u) {
    if (sent[u.id]) return;
    try {
      await api.post('/api/friends/request', { toUserId: u.id });
      setSent(v => ({ ...v, [u.id]: true }));
    } catch (e) {
      alert(e.response?.data?.error || 'Хүсэлт илгээхэд алдаа гарлаа');
    }
  }

  async function respond(reqItem, action) {
    try {
      await api.patch(`/api/friends/request/${reqItem.requestId}`, { action });
      setRequests(list => list.filter(r => r.requestId !== reqItem.requestId));
      if (action === 'accept') {
        const { data } = await api.get('/api/friends');
        setFriends(data || []);
      }
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
  }

  function openChat(friend) {
    const roomId = 'dm_' + [user.id, friend.id].sort().join('_');
    router.push(`/chat/${roomId}`);
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );
  if (!user) return null;

  if (locked) return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="👥 Найзууд" subtitle="Найз нэмж, хамт суралцаж, чатлаарай!" streak={streak} />
      <div style={{ margin: '0 28px', padding: '40px 24px', textAlign: 'center', borderRadius: 20, background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)' }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>🔒</div>
        <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)', marginBottom: 6 }}>Найзууд боломж Premium багцад нээлттэй</div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 18 }}>Найз нэмж, чатлахын тулд Premium багц авна уу.</div>
        <button className="btn btn-purple" onClick={() => router.push('/pricing')}>✨ Багц авах</button>
      </div>
    </div>
  );

  const rowStyle = { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, border: '1.5px solid var(--border)', padding: '12px 16px', marginBottom: 10 };
  const btnStyle = { background: 'var(--purple-light)', color: 'var(--purple)', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' };

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="👥 Найзууд" subtitle="Найз нэмж, хамт суралцаж, чатлаарай!" streak={streak} />

      <div style={{ padding: '0 28px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '9px 16px', borderRadius: 100, fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              border: tab === t ? 'none' : '1.5px solid var(--border)',
              background: tab === t ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#fff',
              color: tab === t ? '#fff' : 'var(--text-sub)',
            }}>
              {t}{t === 'Хүсэлтүүд' && requests.length > 0 ? ` (${requests.length})` : ''}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 520 }}>
          {tab === 'Найзууд' && (
            friends.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'center', padding: 30 }}>Найз алга байна. "Хайх" таб руу очиж нэмээрэй.</div>
            ) : friends.map(f => (
              <div key={f.id} style={rowStyle}>
                <Avatar u={f} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)' }}>{f.username}</div>
                  {f.activeToday && <div style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 600 }}>🟢 Өнөөдөр идэвхтэй</div>}
                </div>
                <button style={btnStyle} onClick={() => openChat(f)}>💬 Чат</button>
              </div>
            ))
          )}

          {tab === 'Хүсэлтүүд' && (
            requests.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'center', padding: 30 }}>Хүлээгдэж буй хүсэлт алга.</div>
            ) : requests.map(r => (
              <div key={r.requestId} style={rowStyle}>
                <Avatar u={r.from} />
                <div style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 14.5, color: 'var(--text)' }}>{r.from.username}</div>
                <button style={btnStyle} onClick={() => respond(r, 'accept')}>Зөвшөөрөх</button>
                <button style={{ ...btnStyle, background: 'var(--bg-alt)', color: 'var(--muted)' }} onClick={() => respond(r, 'reject')}>✕</button>
              </div>
            ))
          )}

          {tab === 'Хайх' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '10px 14px', marginBottom: 14 }}>
                <span style={{ color: 'var(--muted)' }}>🔍</span>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Хэрэглэгчийн нэрээр хайх..."
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent' }} />
              </div>
              {!q.trim() ? (
                <div style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'center', padding: 30 }}>Нэр бичиж хайгаарай.</div>
              ) : results.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'center', padding: 30 }}>Хэрэглэгч олдсонгүй.</div>
              ) : results.map(u => (
                <div key={u.id} style={rowStyle}>
                  <Avatar u={u} />
                  <div style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 14.5, color: 'var(--text)' }}>{u.username}</div>
                  <button style={{ ...btnStyle, ...(sent[u.id] ? { background: 'var(--green-bg)', color: 'var(--green)' } : {}) }} disabled={sent[u.id]} onClick={() => sendRequest(u)}>
                    {sent[u.id] ? 'Илгээсэн ✓' : '+ Нэмэх'}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
