'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const TABS = ['Бүх чат', 'Найзууд', 'Бүлгүүд'];

function previewOf(m) {
  if (!m) return 'Мессеж алга';
  if (m.type === 'text') return m.text;
  if (m.type === 'image') return '📷 Зураг';
  if (m.type === 'video') return '🎥 Видео';
  if (m.type === 'file') return '📎 ' + (m.mediaName || 'Файл');
  if (m.type === 'word') return '📖 Үг хуваалцлаа';
  if (m.type === 'deck') return '📚 Үгийн багц хуваалцлаа';
  if (m.type === 'duel') return '⚔️ Дуэлд урьлаа';
  if (m.type === 'location') return '📍 Байршил';
  return '';
}
function timeOf(iso) {
  if (!iso) return '';
  const d = new Date(iso), now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Өчигдөр';
  return d.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
}

export default function ChatInboxPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [tab, setTab] = useState('Бүх чат');
  const [q, setQ] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
      load();
    }
  }, [authLoad, user]);

  async function load() {
    setLoading(true);
    try {
      const [friendsRes, groupsRes] = await Promise.all([
        api.get('/api/friends').catch(() => ({ data: [] })),
        api.get('/api/groups').catch(() => ({ data: [] })),
      ]);
      const dmEntries = (friendsRes.data || []).map(f => ({
        kind: 'dm', roomId: 'dm_' + [user.id, f.id].sort().join('_'),
        title: f.username, avatarEmoji: f.avatarEmoji, otherId: f.id,
      }));
      const groupEntries = (groupsRes.data || []).map(g => ({
        kind: 'group', roomId: 'group_' + g.id, title: g.name, memberCount: (g.members || []).length,
      }));
      const all = [...dmEntries, ...groupEntries];
      const dmIds = dmEntries.map(c => c.otherId);
      const presence = dmIds.length
        ? await api.get(`/api/chat/presence?ids=${dmIds.join(',')}`).then(r => r.data).catch(() => ({}))
        : {};
      const withMsgs = await Promise.all(all.map(async c => {
        try {
          const { data } = await api.get(`/api/chat/${c.roomId}`);
          const last = data[data.length - 1];
          const unread = c.kind === 'dm' ? data.filter(m => m.userId !== user.id && !(m.readBy || []).includes(user.id)).length : 0;
          return { ...c, last, unread, lastText: previewOf(last), online: c.kind === 'dm' ? !!presence[c.otherId] : false };
        } catch { return { ...c, last: null, unread: 0, lastText: '' }; }
      }));
      withMsgs.sort((a, b) => new Date(b.last?.createdAt || 0) - new Date(a.last?.createdAt || 0));
      setConversations(withMsgs);
    } catch {}
    setLoading(false);
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );
  if (!user) return null;

  const filtered = conversations
    .filter(c => tab === 'Бүх чат' || (tab === 'Найзууд' && c.kind === 'dm') || (tab === 'Бүлгүүд' && c.kind === 'group'))
    .filter(c => !q.trim() || c.title.toLowerCase().includes(q.toLowerCase()) || (c.lastText || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="💬 Хувийн чат" subtitle="Найзууд, бүлгүүдтэйгээ харилцаж, хамт суралцаарай!" streak={streak} />

      <div style={{ padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '10px 14px', marginBottom: 14, maxWidth: 520 }}>
          <span style={{ color: 'var(--muted)' }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Хайх (хэрэглэгч, мессэж)"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent' }} />
          <button onClick={() => router.push('/friends')} title="Шинэ чат" style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--purple)',
          }}>✏️</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '9px 16px', borderRadius: 100, fontWeight: 800, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
              border: tab === t ? 'none' : '1.5px solid var(--border)',
              background: tab === t ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#fff',
              color: tab === t ? '#fff' : 'var(--text-sub)',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ maxWidth: 560 }}>
          {filtered.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'center', padding: 30 }}>Чат алга байна.</div>
          ) : filtered.map(c => (
            <div key={c.roomId} onClick={() => router.push(`/chat/${c.roomId}`)} style={{
              display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16,
              border: '1.5px solid var(--border)', padding: '12px 16px', marginBottom: 10, cursor: 'pointer',
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%', background: 'var(--purple-light)',
                  border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {c.kind === 'group' ? '👥' : (c.avatarEmoji || c.title?.[0]?.toUpperCase())}
                </div>
                {c.kind === 'dm' && c.online && (
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>{timeOf(c.last?.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-sub)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastText}</span>
                  {c.unread > 0 && (
                    <span style={{ background: 'var(--purple)', color: '#fff', borderRadius: 100, minWidth: 18, height: 18, fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
