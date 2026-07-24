'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import UserCard from '@/components/friends/UserCard';
import ProfileDrawer from '@/components/friends/ProfileDrawer';
import InviteBanner from '@/components/friends/InviteBanner';

const TABS = ['Найзууд', 'Найз хайх', 'Хүсэлтүүд', 'Дагаж байгаа', 'Дагагчид', 'Блоклосон'];
const HISTORY_KEY = 'voca_friend_search_history';

const actionBtn = { background: 'var(--purple-light)', color: 'var(--purple)', border: 'none', borderRadius: 10, padding: '9px 16px', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' };
const ghostBtn  = { ...actionBtn, background: 'var(--bg-alt)', color: 'var(--muted)' };
const emptyMsg  = { color: 'var(--muted)', fontWeight: 600, textAlign: 'center', padding: 30 };

export default function FriendsPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [tab, setTab] = useState('Найзууд');
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [blocked, setBlocked] = useState([]);

  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyPremium, setOnlyPremium] = useState(false);

  const [drawerUserId, setDrawerUserId] = useState(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
      load();
    }
    try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')); } catch {}
  }, [authLoad, user]);

  function load() {
    setLoading(true);
    Promise.all([
      api.get('/api/friends'),
      api.get('/api/friends/requests'),
      api.get('/api/friends/following'),
      api.get('/api/friends/followers'),
      api.get('/api/friends/blocked'),
    ])
      .then(([f, r, fo, fw, b]) => {
        setFriends(f.data || []); setRequests(r.data || []);
        setFollowing(fo.data || []); setFollowers(fw.data || []); setBlocked(b.data || []);
        setLocked(false);
      })
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

  function commitSearch(query) {
    const v = query.trim();
    if (!v) return;
    const next = [v, ...history.filter(h => h !== v)].slice(0, 8);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
  }

  async function sendRequest(u) {
    try {
      await api.post('/api/friends/request', { toUserId: u.id });
      setResults(list => list.map(x => x.id === u.id ? { ...x, relationship: 'pending_sent' } : x));
    } catch (e) {
      alert(e.response?.data?.error || 'Хүсэлт илгээхэд алдаа гарлаа');
    }
  }

  async function respond(reqItem, action) {
    try {
      await api.patch(`/api/friends/request/${reqItem.requestId}`, { action });
      setRequests(list => list.filter(r => r.requestId !== reqItem.requestId));
      if (action === 'accept') load();
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
  }

  async function removeFriend(f) {
    if (!confirm(`${f.username}-г найзаас хасах уу?`)) return;
    try {
      await api.delete(`/api/friends/${f.id}`);
      setFriends(list => list.filter(x => x.id !== f.id));
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
  }

  async function follow(u) {
    try {
      await api.post('/api/friends/follow', { userId: u.id });
      setResults(list => list.map(x => x.id === u.id ? { ...x, following: true } : x));
      setFollowers(list => list.map(x => x.id === u.id ? { ...x, following: true } : x));
    } catch (e) { alert(e.response?.data?.error || 'Алдаа гарлаа'); }
  }
  async function unfollow(u) {
    try {
      await api.delete(`/api/friends/follow/${u.id}`);
      setFollowing(list => list.filter(x => x.id !== u.id));
      setResults(list => list.map(x => x.id === u.id ? { ...x, following: false } : x));
    } catch (e) { alert(e.response?.data?.error || 'Алдаа гарлаа'); }
  }

  async function blockUser(u) {
    if (!confirm(`${u.username}-г блоклох уу? Найз/дагалт хоёулаа цуцлагдана.`)) return;
    try {
      await api.post('/api/friends/block', { userId: u.id });
      load();
      setResults(list => list.filter(x => x.id !== u.id));
    } catch (e) { alert(e.response?.data?.error || 'Алдаа гарлаа'); }
  }
  async function unblock(u) {
    try {
      await api.delete(`/api/friends/block/${u.id}`);
      setBlocked(list => list.filter(x => x.id !== u.id));
    } catch (e) { alert(e.response?.data?.error || 'Алдаа гарлаа'); }
  }

  function openChat(friend) {
    router.push(`/chat/${'dm_' + [user.id, friend.id].sort().join('_')}`);
  }

  // Drawer доторх үйлдэл (найз нэмэх/дагах) хийгдсэний дараа зөвхөн list-үүдийг
  // биш, идэвхтэй хайлтын мөрийг ч дахин ачаалж жагсаалт/карт хоёулаа ижил
  // төлөвтэй байлгана.
  function refreshAll() {
    load();
    if (q.trim()) {
      api.get('/api/friends/search', { params: { q: q.trim() } }).then(r => setResults(r.data || [])).catch(() => {});
    }
  }

  function copyInvite() {
    const link = `${window.location.origin}/friends?ref=${user.id}`;
    navigator.clipboard?.writeText(link).then(() => alert('Урих холбоос хуулагдлаа! 📋'));
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

  const filteredResults = results.filter(u => (!onlyActive || u.activeToday) && (!onlyPremium || u.isPremium));

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="👥 Найзууд" subtitle="Найз нэмж, хамт суралцаж, чатлаарай!" streak={streak} />

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>
        <div>
          <Suspense fallback={null}>
            <InviteBanner myId={user.id} />
          </Suspense>

          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px 16px', borderRadius: 100, fontWeight: 800, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                border: tab === t ? 'none' : '1.5px solid var(--border)',
                background: tab === t ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#fff',
                color: tab === t ? '#fff' : 'var(--text-sub)',
              }}>
                {t}{t === 'Хүсэлтүүд' && requests.length > 0 ? ` (${requests.length})` : ''}
              </button>
            ))}
          </div>

          {tab === 'Найзууд' && (
            friends.length === 0 ? <div style={emptyMsg}>Найз алга байна. "Найз хайх" таб руу очиж нэмээрэй.</div> :
            friends.map(f => (
              <UserCard key={f.id} u={f} onOpen={u => setDrawerUserId(u.id)} rightSlot={<>
                <button style={actionBtn} onClick={() => openChat(f)}>💬 Чат</button>
                <button style={ghostBtn} onClick={() => removeFriend(f)}>✕</button>
              </>} />
            ))
          )}

          {tab === 'Найз хайх' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '10px 14px', marginBottom: 12 }}>
                <span style={{ color: 'var(--muted)' }}>🔍</span>
                <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commitSearch(q); }}
                  placeholder="Хэрэглэгчийн нэрээр хайх..."
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent' }} />
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--text-sub)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={onlyActive} onChange={e => setOnlyActive(e.target.checked)} /> Зөвхөн идэвхтэй
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--text-sub)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={onlyPremium} onChange={e => setOnlyPremium(e.target.checked)} /> Зөвхөн Premium
                </label>
              </div>

              {!q.trim() && history.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {history.map(h => (
                    <button key={h} onClick={() => setQ(h)} style={{ ...ghostBtn, fontSize: 11.5, padding: '6px 12px' }}>🕓 {h}</button>
                  ))}
                </div>
              )}

              {!q.trim() ? (
                <div style={emptyMsg}>Нэр бичиж хайгаарай.</div>
              ) : filteredResults.length === 0 ? (
                <div style={emptyMsg}>Хэрэглэгч олдсонгүй.</div>
              ) : filteredResults.map(u => (
                <UserCard key={u.id} u={u} onOpen={x => { setDrawerUserId(x.id); commitSearch(q); }} rightSlot={
                  u.relationship === 'friends' ? <span style={{ ...ghostBtn, cursor: 'default' }}>✓ Найз</span> :
                  u.relationship === 'pending_sent' ? <span style={{ ...ghostBtn, cursor: 'default' }}>⏳ Хүлээгдэж буй</span> :
                  <button style={actionBtn} onClick={() => sendRequest(u)}>+ Найз нэмэх</button>
                } />
              ))}
            </>
          )}

          {tab === 'Хүсэлтүүд' && (
            requests.length === 0 ? <div style={emptyMsg}>Хүлээгдэж буй хүсэлт алга.</div> :
            requests.map(r => (
              <UserCard key={r.requestId} u={r.from} onOpen={u => setDrawerUserId(u.id)} rightSlot={<>
                <button style={actionBtn} onClick={() => respond(r, 'accept')}>Зөвшөөрөх</button>
                <button style={ghostBtn} onClick={() => respond(r, 'reject')}>✕</button>
              </>} />
            ))
          )}

          {tab === 'Дагаж байгаа' && (
            following.length === 0 ? <div style={emptyMsg}>Хэнийг ч дагаагүй байна.</div> :
            following.map(u => (
              <UserCard key={u.id} u={u} onOpen={x => setDrawerUserId(x.id)} rightSlot={
                <button style={ghostBtn} onClick={() => unfollow(u)}>Дагахаа болих</button>
              } />
            ))
          )}

          {tab === 'Дагагчид' && (
            followers.length === 0 ? <div style={emptyMsg}>Дагагч алга байна.</div> :
            followers.map(u => (
              <UserCard key={u.id} u={u} onOpen={x => setDrawerUserId(x.id)} rightSlot={
                u.following ? <span style={{ ...ghostBtn, cursor: 'default' }}>✓ Дагаж байна</span> :
                <button style={actionBtn} onClick={() => follow(u)}>+ Дагах</button>
              } />
            ))
          )}

          {tab === 'Блоклосон' && (
            blocked.length === 0 ? <div style={emptyMsg}>Блоклосон хэрэглэгч алга.</div> :
            blocked.map(u => (
              <UserCard key={u.id} u={u} rightSlot={
                <button style={ghostBtn} onClick={() => unblock(u)}>Блокоос гаргах</button>
              } />
            ))
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>Найзуудаа урих</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>Найзуудаа урьж, хамтдаа сураарай!</p>
            <button className="btn btn-purple" onClick={copyInvite} style={{ width: '100%' }}>🔗 Урих холбоос хуулах</button>
          </div>
        </div>
      </div>

      {drawerUserId && (
        <ProfileDrawer userId={drawerUserId} onClose={() => setDrawerUserId(null)} onChanged={refreshAll} onBlock={blockUser} />
      )}
    </div>
  );
}
