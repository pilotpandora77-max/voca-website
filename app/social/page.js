'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { useLang } from '@/lib/LangContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const TABS = ['Бүгд', 'Найзууд', 'Миний', 'Хадгалсан'];

// XP реакцууд — пост эзэн reaction тус бүрд +5 XP авна
const REACTIONS = [
  { e: '❤️', label: 'XP' },
  { e: '🔥', label: 'Useful' },
  { e: '📖', label: 'Learned' },
  { e: '👏', label: 'Nice' },
  { e: '🧠', label: 'Smart' },
];

const RULES = [
  { icon: '💬', t: 'Нийгмийн чатлах дүрэм' },
  { icon: '📝', t: 'Пост оруулах дүрэм' },
  { icon: '👥', t: 'Группын дүрэм' },
  { icon: '⚠️', t: 'Алдаа мэдээлэх заавар' },
];

function relTime(iso) {
  if (!iso) return 'одоо';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'одоо';
  if (d < 3600) return `${Math.floor(d / 60)} минутын өмнө`;
  if (d < 86400) return `${Math.floor(d / 3600)} цагийн өмнө`;
  return `${Math.floor(d / 86400)} өдрийн өмнө`;
}
function imgUrl(p) { return p?.startsWith('http') || p?.startsWith('data:') ? p : API_BASE + p; }

export default function SocialPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const [streak, setStreak] = useState(0);
  const [tab, setTab]       = useState('Бүгд');
  const [posts, setPosts]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [input, setInput]   = useState('');
  const [pendingImg, setPendingImg] = useState(null); // base64 preview before posting
  const [saved, setSaved]   = useState({});
  const [toast, setToast]   = useState('');
  const [openComments, setOpenComments] = useState(null); // post id
  const [comments, setComments] = useState({}); // postId -> []
  const [commentText, setCommentText] = useState('');
  // Community v2
  const [trending, setTrending]   = useState([]);
  const [online, setOnline]       = useState({ count: 0, users: [] });
  const [active, setActive]       = useState([]);        // топ 3 (7 хоногийн XP)
  const [challenge, setChallenge] = useState(null);
  const [chInput, setChInput]     = useState('');
  const [events, setEvents]       = useState([]);
  const [notifs, setNotifs]       = useState({ items: [], unread: 0 });
  const [showNotifs, setShowNotifs] = useState(false);
  const [profileCard, setProfileCard] = useState(null);  // profile modal data
  const [searchQ, setSearchQ]     = useState('');
  const [searchRes, setSearchRes] = useState(null);
  const composerRef = useRef(null);
  const imageInputRef = useRef(null);
  const toastT = useRef(null);
  const searchT = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      load();
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
      api.get('/api/social/trending').then(r => setTrending(r.data || [])).catch(() => {});
      api.get('/api/social/online').then(r => setOnline(r.data || { count: 0, users: [] })).catch(() => {});
      api.get('/api/stats/leaderboard/weekly').then(r => setActive((r.data?.rankings || []).slice(0, 3))).catch(() => {});
      api.get('/api/social/events').then(r => setEvents(r.data || [])).catch(() => {});
      api.get('/api/social/notifications').then(r => setNotifs(r.data || { items: [], unread: 0 })).catch(() => {});
    }
    try { setSaved(JSON.parse(localStorage.getItem('voca_social_saved') || '{}')); } catch {}
  }, [authLoad, user]);

  // Challenge — сурч буй хэлээр (lang localStorage-оос async ирдэг тул тусад нь)
  useEffect(() => {
    if (!authLoad && user) {
      api.get(`/api/social/challenge?course=${lang === 'en' ? 'en' : 'zh'}`)
        .then(r => setChallenge(r.data)).catch(() => {});
    }
  }, [authLoad, user, lang]);

  async function load() {
    setLoad(true);
    try { const { data } = await api.get('/api/posts'); setPosts(Array.isArray(data) ? data : []); }
    catch { setPosts([]); }
    setLoad(false);
  }

  if (authLoad) return null;

  function showToast(t) { setToast(t); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2600); }

  async function publish() {
    const text = input.trim();
    if (!text && !pendingImg) return;
    const body = { text, images: pendingImg ? [pendingImg] : [] };
    setInput(''); setPendingImg('');
    try {
      const { data } = await api.post('/api/posts', body);
      setPosts(p => [data, ...p]);
      showToast(data.earnedXp ? `Пост нийтлэгдлээ! +${data.earnedXp} XP 🎉` : 'Пост нийтлэгдлээ! 🎉');
    } catch (e) {
      if (e.response?.status === 403) showToast('Зөвхөн Premium гишүүд пост нийтэлж болно 👑');
      else showToast(e.response?.data?.error || 'Алдаа гарлаа');
    }
  }

  function onPickImage(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { showToast('Зураг 4MB-аас бага байх ёстой'); return; }
    const reader = new FileReader();
    reader.onload = () => { setPendingImg(reader.result); composerRef.current?.focus(); };
    reader.readAsDataURL(file);
  }

  async function react(id, emoji) {
    // optimistic toggle (нэг хэрэглэгч нэг reaction)
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p;
      const r = { ...(p.reactions || {}) };
      const had = (r[emoji] || []).includes(user.id);
      for (const e of Object.keys(r)) {
        r[e] = r[e].filter(x => x !== user.id);
        if (!r[e].length) delete r[e];
      }
      if (!had) r[emoji] = [...(r[emoji] || []), user.id];
      return { ...p, reactions: r };
    }));
    try {
      const { data } = await api.post(`/api/posts/${id}/react`, { emoji });
      setPosts(ps => ps.map(p => p.id === id ? { ...p, reactions: data.reactions } : p));
    } catch {}
  }

  function toggleSave(id) {
    setSaved(prev => { const n = { ...prev, [id]: !prev[id] }; localStorage.setItem('voca_social_saved', JSON.stringify(n)); return n; });
    showToast(saved[id] ? 'Хадгалснаас хаслаа' : 'Хадгаллаа 🔖');
  }
  async function openCmt(id) {
    if (openComments === id) { setOpenComments(null); return; }
    setOpenComments(id); setCommentText('');
    if (!comments[id]) {
      try { const { data } = await api.get(`/api/posts/${id}/comments`); setComments(c => ({ ...c, [id]: data })); }
      catch { setComments(c => ({ ...c, [id]: [] })); }
    }
  }
  async function sendComment(id) {
    const text = commentText.trim(); if (!text) return;
    setCommentText('');
    try {
      const { data } = await api.post(`/api/posts/${id}/comments`, { text });
      setComments(c => ({ ...c, [id]: [...(c[id] || []), data] }));
      setPosts(ps => ps.map(p => p.id === id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
      if (data.earnedXp) showToast(`Сэтгэгдэл +${data.earnedXp} XP ✨`);
    } catch (e) { showToast(e.response?.data?.error || 'Сэтгэгдэл нэмэхэд алдаа'); }
  }

  async function submitChallenge() {
    const text = chInput.trim(); if (!text || !challenge) return;
    try {
      const { data } = await api.post('/api/social/challenge/submit', { text, course: challenge.course });
      setChInput('');
      if (data.wonXp) showToast(`🏆 Өнөөдрийн ялагч! +${data.xp + data.wonXp} XP`);
      else showToast(`Челленж: ${data.used.length} үг +${data.xp} XP 🎯`);
      const r = await api.get(`/api/social/challenge?course=${challenge.course}`);
      setChallenge(r.data);
    } catch (e) { showToast(e.response?.data?.error || 'Алдаа гарлаа'); }
  }

  async function openNotifs() {
    const next = !showNotifs;
    setShowNotifs(next);
    if (next && notifs.unread > 0) {
      try { await api.post('/api/social/notifications/read'); } catch {}
      setNotifs(n => ({ ...n, unread: 0, items: n.items.map(x => ({ ...x, read: true })) }));
    }
  }

  async function openProfile(userId) {
    try { const { data } = await api.get(`/api/social/profile/${userId}`); setProfileCard(data); }
    catch { showToast('Профайл ачаалахад алдаа'); }
  }

  function onSearch(q) {
    setSearchQ(q);
    clearTimeout(searchT.current);
    if (q.trim().length < 2) { setSearchRes(null); return; }
    searchT.current = setTimeout(async () => {
      try { const { data } = await api.get(`/api/social/search?q=${encodeURIComponent(q.trim())}`); setSearchRes(data); }
      catch { setSearchRes(null); }
    }, 350);
  }

  async function joinEvent(id) {
    try {
      const { data } = await api.post(`/api/social/events/${id}/join`);
      setEvents(evs => evs.map(e => e.id === id ? { ...e, joined: data.joined, attendeeCount: data.attendeeCount } : e));
      showToast(data.joined ? 'Арга хэмжээнд бүртгүүллээ 🎉' : 'Бүртгэлээс гарлаа');
    } catch {}
  }

  const filtered = posts.filter(p => {
    if (tab === 'Миний') return p.userId === user.id;
    if (tab === 'Хадгалсан') return saved[p.id];
    return true; // Бүгд, Найзууд (найзаар шүүх backend талд хийгдээгүй тул бүгд)
  });

  const challengeDone = challenge && (challenge.myUsedWords?.length || 0) >= (challenge.words?.length || 5);

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Нийгэм" subtitle="Бидний нийгэмлэгт тавтай морил! Хамтдаа суралцаж, хөгжицгөөе." streak={streak}
        actions={
          <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
            <button onClick={openNotifs} style={{ position: 'relative', padding: '9px 12px', fontSize: 16, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-alt)', cursor: 'pointer' }}>
              🔔
              {notifs.unread > 0 && <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, background: '#EF4444', color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{notifs.unread}</span>}
            </button>
            <button onClick={() => composerRef.current?.focus()} className="btn btn-purple" style={{ padding: '9px 16px', fontSize: 13 }}>✏️ Пост бичих</button>
            {showNotifs && (
              <div className="card" style={{ position: 'absolute', top: 46, right: 0, width: 340, maxHeight: 420, overflowY: 'auto', zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
                <h3 style={{ fontWeight: 900, fontSize: 14, marginBottom: 10 }}>🔔 Мэдэгдэл</h3>
                {notifs.items.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>Мэдэгдэл алга.</div>}
                {notifs.items.map(n => (
                  <div key={n.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                    {n.text}
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{relTime(n.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        } />

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20, alignItems: 'start' }}>
        {/* ── Main feed ── */}
        <div>
          <div style={{ display: 'flex', gap: 26, borderBottom: '1.5px solid var(--border)', marginBottom: 18, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', color: tab === t ? 'var(--purple)' : 'var(--muted)', borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5 }}>{t}</button>
            ))}
          </div>

          {/* Composer */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: pendingImg ? 12 : 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{user?.avatarEmoji || user?.username?.[0]?.toUpperCase()}</div>
              <input ref={composerRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') publish(); }} placeholder="Юу шинэ байна? (#hashtag ашиглаж болно)" style={{ flex: 1, background: 'var(--bg-alt)', borderRadius: 14 }} />
              <input ref={imageInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: 'none' }} />
            </div>
            {pendingImg && (
              <div style={{ position: 'relative', marginBottom: 12, maxWidth: 240 }}>
                <img src={pendingImg} alt="" style={{ width: '100%', borderRadius: 10 }} />
                <button onClick={() => setPendingImg('')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer' }}>✕</button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => imageInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-alt)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5, color: 'var(--text-sub)' }}>🖼️ Зураг</button>
              <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>Пост +10 XP</span>
              <button onClick={publish} disabled={!input.trim() && !pendingImg} className="btn btn-purple" style={{ marginLeft: 'auto', padding: '9px 22px' }}>Оруулах</button>
            </div>
          </div>

          {/* Feed */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>{tab === 'Хадгалсан' ? 'Хадгалсан пост алга.' : 'Одоогоор пост алга байна. Эхний пост бичээрэй!'}</div>}
              {filtered.map(p => {
                const reactions = p.reactions || {};
                const badge = p.posterAdmin ? { t: 'Admin', c: '#EF4444' } : p.posterPremium ? { t: 'Pro', c: '#7C3AED' } : null;
                return (
                  <div key={p.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div onClick={() => openProfile(p.userId)} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--purple-light)', border: '2px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0, cursor: 'pointer' }}>{p.avatarEmoji || p.username?.[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span onClick={() => openProfile(p.userId)} style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)', cursor: 'pointer' }}>{p.username}</span>
                          {badge && <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: badge.c, borderRadius: 6, padding: '1px 7px' }}>{badge.t}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{relTime(p.createdAt)}</div>
                      </div>
                      {p.userId === user.id && <button onClick={() => deletePost(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16 }}>🗑️</button>}
                    </div>
                    {p.text && <div style={{ fontSize: 14.5, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: p.images?.length ? 12 : 14 }}>{p.text}</div>}
                    {(p.images || []).map((im, i) => (
                      <img key={i} src={imgUrl(im)} alt="" style={{ width: '100%', maxHeight: 440, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 12, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                      {REACTIONS.map(r => {
                        const uids = reactions[r.e] || [];
                        const mine = uids.includes(user.id);
                        return (
                          <button key={r.e} onClick={() => react(p.id, r.e)} title={`${r.label} — пост эзэнд +5 XP`}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5,
                              border: mine ? '1.5px solid var(--purple)' : '1.5px solid var(--border)',
                              background: mine ? 'var(--purple-light)' : 'var(--bg-alt)',
                              color: mine ? 'var(--purple)' : 'var(--text-sub)' }}>
                            {r.e}{uids.length > 0 && ` ${uids.length}`}
                          </button>
                        );
                      })}
                      <button onClick={() => openCmt(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, color: 'var(--text-sub)', marginLeft: 4 }}>💬 {p.commentCount || 0}</button>
                      <button onClick={() => toggleSave(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: saved[p.id] ? 'var(--purple)' : 'var(--muted)', marginLeft: 'auto' }}>{saved[p.id] ? '🔖' : '🏷️'}</button>
                    </div>

                    {/* Comments */}
                    {openComments === p.id && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        {(comments[p.id] || []).map(c => (
                          <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{c.avatarEmoji || c.username?.[0]?.toUpperCase()}</div>
                            <div style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '8px 12px', flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--text)' }}>{c.username}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{c.text}</div>
                            </div>
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendComment(p.id); }} placeholder="Сэтгэгдэл бичих... (+3 XP)" style={{ flex: 1, background: 'var(--bg-alt)' }} />
                          <button onClick={() => sendComment(p.id)} className="btn btn-purple" style={{ padding: '8px 16px' }}>Илгээх</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search */}
          <div className="card" style={{ position: 'relative' }}>
            <input value={searchQ} onChange={e => onSearch(e.target.value)} placeholder="🔍 Хайх (хэрэглэгч, бүлэг, пост...)" style={{ width: '100%', background: 'var(--bg-alt)' }} />
            {searchRes && (
              <div style={{ marginTop: 10, maxHeight: 320, overflowY: 'auto' }}>
                {searchRes.users.length === 0 && searchRes.groups.length === 0 && searchRes.posts.length === 0 && searchRes.hashtags.length === 0 &&
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '6px 0' }}>Илэрц олдсонгүй.</div>}
                {searchRes.users.map(u => (
                  <div key={u.id} onClick={() => openProfile(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    <span>{u.avatarEmoji || '👤'}</span>{u.username}
                  </div>
                ))}
                {searchRes.hashtags.map(h => (
                  <div key={h.tag} style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--purple)' }}>{h.tag} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>({h.count})</span></div>
                ))}
                {searchRes.groups.map(g => (
                  <div key={g.id} style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>👥 {g.name}</span>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}> — {g.members} гишүүн</span>
                  </div>
                ))}
                {searchRes.posts.map(p => (
                  <div key={p.id} style={{ padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-sub)' }}>📝 {p.text}</div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Challenge */}
          {challenge && challenge.words?.length > 0 && (
            <div className="card" style={{ border: '1.5px solid var(--purple-mid)', background: 'linear-gradient(135deg, var(--purple-light), transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--purple)' }}>🎯 Өдрийн Challenge</h3>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple)', background: 'var(--purple-light)', borderRadius: 100, padding: '2px 9px' }}>{challenge.participants} оролцогч</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-sub)', marginBottom: 10 }}>Доорх 5 үгийг өгүүлбэрт ашиглаарай — үг тус бүр +10 XP, эхэлж бүгдийг ашигласан хүн <b>+{challenge.winXp} XP</b>!</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {challenge.words.map(w => {
                  const used = challenge.myUsedWords?.includes(w.word);
                  return (
                    <span key={w.word} title={`${w.mn}${w.extra ? ` · ${w.extra}` : ''}`}
                      style={{ padding: '4px 10px', borderRadius: 100, fontSize: 13, fontWeight: 800,
                        background: used ? 'var(--purple)' : 'var(--bg-alt)',
                        color: used ? '#fff' : 'var(--text)',
                        border: '1.5px solid ' + (used ? 'var(--purple)' : 'var(--border)'),
                        textDecoration: used ? 'line-through' : 'none' }}>
                      {used ? '✓ ' : ''}{w.word}
                    </span>
                  );
                })}
              </div>
              {challenge.winner && (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 8 }}>🏆 Өнөөдрийн ялагч: <span style={{ color: 'var(--purple)' }}>{challenge.winner.username}</span></div>
              )}
              {challengeDone ? (
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple)', textAlign: 'center', padding: '6px 0' }}>✅ Бүх үгийг ашигласан! {challenge.myXp ? `+${challenge.myXp} XP` : ''}</div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={chInput} onChange={e => setChInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submitChallenge(); }} placeholder="Өгүүлбэрээ бичээрэй..." style={{ flex: 1, background: 'var(--bg)', fontSize: 12.5 }} />
                  <button onClick={submitChallenge} className="btn btn-purple" style={{ padding: '7px 13px', fontSize: 12.5 }}>➤</button>
                </div>
              )}
            </div>
          )}

          {/* Online + Active users */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)' }}>{online.count} онлайн</h3>
              <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)' }}>Идэвхтэй ⚡</span>
            </div>
            {active.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Энэ 7 хоногт идэвх алга.</div>}
            {active.map((u, i) => (
              <div key={u.id} onClick={() => openProfile(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < active.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                <span style={{ fontWeight: 900, fontSize: 13, color: i === 0 ? '#F59E0B' : 'var(--muted)', width: 16 }}>{i + 1}</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{u.avatarEmoji || u.username?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{u.username}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple)' }}>{u.weeklyXp} XP 🔥</span>
              </div>
            ))}
          </div>

          {/* Trending */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Халуун сэдвүүд 🔥</h3>
            {trending.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Постдоо #hashtag ашиглавал энд гарна.</div>}
            {trending.map((t, i) => (
              <div key={t.tag} style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: i < trending.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: 'var(--purple)' }}>{t.tag}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{t.count}</span>
              </div>
            ))}
          </div>

          {/* Events */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>📅 Арга хэмжээ</h3>
            {events.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Удахгүй болох арга хэмжээ алга.</div>}
            {events.slice(0, 4).map(ev => (
              <div key={ev.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{ev.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', margin: '3px 0 7px' }}>
                  {new Date(ev.startsAt).toLocaleString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {ev.attendeeCount} оролцогч
                </div>
                <button onClick={() => joinEvent(ev.id)} className={ev.joined ? '' : 'btn btn-purple'}
                  style={{ padding: '5px 14px', fontSize: 12, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                    ...(ev.joined ? { border: '1.5px solid var(--purple)', background: 'var(--purple-light)', color: 'var(--purple)' } : {}) }}>
                  {ev.joined ? '✓ Бүртгүүлсэн' : 'Нэгдэх'}
                </button>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Дүрэм, журам</h3>
            {RULES.map(r => (
              <div key={r.t} onClick={() => showToast(r.t)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>{r.t}</span>
                <span style={{ color: 'var(--muted)' }}>›</span>
              </div>
            ))}
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>🛡️ Нийтлэл, сэтгэгдлийг AI автоматаар шалгадаг.</p>
          </div>
        </div>
      </div>

      {/* Profile card modal */}
      {profileCard && (
        <div onClick={() => setProfileCard(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: 380, maxWidth: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--purple-light)', border: '3px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, margin: '0 auto 10px' }}>{profileCard.avatarEmoji || profileCard.username?.[0]?.toUpperCase()}</div>
              <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)' }}>{profileCard.username} {profileCard.isPremium && '👑'}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Нийт #{profileCard.rank}-р байр</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
              {[['⚡', profileCard.xp, 'XP'], ['🔥', profileCard.streak, 'Цуваа'], ['📖', profileCard.wordCount, 'Үг'], ['📝', profileCard.postCount, 'Пост']].map(([e, v, l]) => (
                <div key={l} style={{ textAlign: 'center', background: 'var(--bg-alt)', borderRadius: 12, padding: '10px 4px' }}>
                  <div style={{ fontSize: 16 }}>{e}</div>
                  <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 700 }}>{l}</div>
                </div>
              ))}
            </div>
            {profileCard.badges?.length > 0 && (
              <>
                <h4 style={{ fontWeight: 900, fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>🏅 Badges</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {profileCard.badges.map(b => (
                    <span key={b.id} title={b.desc} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 100, background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)', fontSize: 12, fontWeight: 800, color: 'var(--purple-dark)' }}>{b.emoji} {b.name}</span>
                  ))}
                </div>
              </>
            )}
            <button onClick={() => setProfileCard(null)} className="btn btn-purple" style={{ width: '100%', marginTop: 10 }}>Хаах</button>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 80}px)`, opacity: toast ? 1 : 0, background: '#1E1B4B', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, transition: 'all .3s cubic-bezier(.34,1.56,.64,1)', zIndex: 999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>{toast}</div>
    </div>
  );

  async function deletePost(id) {
    if (!confirm('Энэ постыг устгах уу?')) return;
    setPosts(ps => ps.filter(p => p.id !== id));
    try { await api.delete(`/api/posts/${id}`); } catch {}
  }
}
