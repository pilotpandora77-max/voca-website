'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { useLang } from '@/lib/LangContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const TABS = ['Бүгд', 'Дагаж буй', 'Шилдэг', 'Зөвлөгөө', 'Асуулт', 'Хуваалцсан'];

// XP реакцууд — пост эзэн reaction тус бүрд +5 XP авна
const REACTIONS = [
  { e: '❤️', label: 'XP' },
  { e: '🔥', label: 'Useful' },
  { e: '📖', label: 'Learned' },
  { e: '👏', label: 'Nice' },
  { e: '🧠', label: 'Smart' },
];

// Composer категори — Зөвлөгөө/Асуулт таб-ыг шүүхэд ашиглана
const CATEGORIES = [
  { id: 'general', emoji: '💬', label: 'Ярилцлага' },
  { id: 'question', emoji: '❓', label: 'Асуулт' },
  { id: 'advice', emoji: '💡', label: 'Зөвлөгөө' },
];

const RULES = [
  { icon: '💬', t: 'Нийгмийн чатлах дүрэм' },
  { icon: '📝', t: 'Пост оруулах дүрэм' },
  { icon: '👥', t: 'Группын дүрэм' },
  { icon: '⚠️', t: 'Алдаа мэдээлэх заавар' },
];

// XP → Level (backend social.js-тэй ижил босго)
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
function levelFromXp(xp = 0) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) { if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1; else break; }
  return level;
}
function levelProgress(xp = 0) {
  const level = levelFromXp(xp);
  const cur = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? (cur + 2500);
  return { level, cur, next, pct: Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100)) };
}
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365];
function daysToNextReward(streak = 0) {
  const next = STREAK_MILESTONES.find(m => m > streak);
  return next ? next - streak : 0;
}
const WEEKDAY_MN = ['Д', 'М', 'Л', 'П', 'Б', 'Б', 'Н'];

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
  const [stats, setStats]   = useState(null);   // /api/stats — streak, xp, weekActivity
  const [tab, setTab]       = useState('Бүгд');
  const [posts, setPosts]   = useState([]);
  const [friendIds, setFriendIds] = useState(new Set());
  const [loading, setLoad]  = useState(true);
  const [input, setInput]   = useState('');
  const [category, setCategory] = useState('general');
  const [postMode, setPostMode] = useState('text'); // text | poll | word
  const [pendingImg, setPendingImg] = useState(null);
  const [pollQ, setPollQ]   = useState('');
  const [pollOpts, setPollOpts] = useState(['', '']);
  const [wfTitle, setWfTitle] = useState('');
  const [wfWords, setWfWords] = useState([{ word: '', meaning: '', extra: '' }]);
  const [openFolders, setOpenFolders] = useState({}); // postId -> bool (expand word list)
  const [myFolders, setMyFolders] = useState([]); // caller's own vocab folders, for the word-post picker
  const [pickedFolder, setPickedFolder] = useState(null); // name of the folder currently filled into wfTitle/wfWords
  const [saved, setSaved]   = useState({});
  const [toast, setToast]   = useState('');
  const [openComments, setOpenComments] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  // Community v2
  const [trending, setTrending]   = useState([]);
  const [online, setOnline]       = useState({ count: 0, users: [] });
  const [active, setActive]       = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [chInput, setChInput]     = useState('');
  const [newGroups, setNewGroups] = useState([]);
  const [notifs, setNotifs]       = useState({ items: [], unread: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [profileCard, setProfileCard] = useState(null);
  const [searchQ, setSearchQ]     = useState('');
  const [searchRes, setSearchRes] = useState(null);
  const composerRef = useRef(null);
  const imageInputRef = useRef(null);
  const toastT = useRef(null);
  const searchT = useRef(null);
  const groupSearchRef = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      load();
      api.get('/api/stats').then(r => setStats(r.data)).catch(() => {});
      api.get('/api/friends').then(r => setFriendIds(new Set((r.data || []).map(f => f.id)))).catch(() => {});
      api.get('/api/social/trending').then(r => setTrending(r.data || [])).catch(() => {});
      api.get('/api/social/online').then(r => setOnline(r.data || { count: 0, users: [] })).catch(() => {});
      api.get('/api/stats/leaderboard/weekly').then(r => setActive((r.data?.rankings || []).slice(0, 3))).catch(() => {});
      api.get('/api/groups/public').then(r => setNewGroups((r.data || []).slice(0, 3))).catch(() => {});
      api.get('/api/social/notifications').then(r => setNotifs(r.data || { items: [], unread: 0 })).catch(() => {});
      api.get('/api/news').then(r => setAnnouncements(r.data || [])).catch(() => {});
      loadMyFolders();
    }
    try { setSaved(JSON.parse(localStorage.getItem('voca_social_saved') || '{}')); } catch {}
  }, [authLoad, user]);

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

  // Миний "Үгсийн сан"-ны бүлгүүд — Үг хуваалцах composer-ийн сонголтод зориулав.
  const DEFAULT_GROUP = 'Ерөнхий';
  async function loadMyFolders() {
    try {
      const [{ data: wds }, { data: meta }] = await Promise.all([
        api.get('/api/words'), api.get('/api/folders'),
      ]);
      const metaByName = {}; (meta || []).forEach(f => { metaByName[f.name] = f; });
      const byName = {};
      (wds || []).forEach(w => { const g = w.group || DEFAULT_GROUP; if (g !== DEFAULT_GROUP) (byName[g] = byName[g] || []).push(w); });
      const folders = Object.entries(byName).map(([name, ws]) => ({ name, words: ws }));
      setMyFolders(folders);
    } catch { setMyFolders([]); }
  }

  function pickFolder(f) {
    if (pickedFolder === f.name) { setPickedFolder(null); setWfTitle(''); setWfWords([{ word: '', meaning: '', extra: '' }]); return; }
    setPickedFolder(f.name);
    setWfTitle(f.name);
    setWfWords(f.words.map(w => ({ word: w.front || w.word || '', meaning: w.back || w.meaning || '', extra: w.hint || w.reading || w.pos || '' })));
  }

  if (authLoad) return null;

  function showToast(t) { setToast(t); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2600); }

  function resetComposer() {
    setInput(''); setPendingImg(null); setCategory('general'); setPostMode('text');
    setPollQ(''); setPollOpts(['', '']); setWfTitle(''); setWfWords([{ word: '', meaning: '', extra: '' }]); setPickedFolder(null);
  }

  async function publish() {
    let body;
    if (postMode === 'poll') {
      const opts = pollOpts.map(o => o.trim()).filter(Boolean);
      if (!pollQ.trim() || opts.length < 2) { showToast('Асуулт болон 2+ сонголт бичнэ үү'); return; }
      body = { category: 'poll', poll: { question: pollQ.trim(), options: opts } };
    } else if (postMode === 'word') {
      const words = wfWords.map(w => ({ word: w.word.trim(), meaning: w.meaning.trim(), extra: w.extra.trim() })).filter(w => w.word);
      if (!wfTitle.trim() || !words.length) { showToast('Багцын нэр болон дор хаяж нэг үг бичнэ үү'); return; }
      body = { text: input.trim(), category: 'word', wordFolder: { title: wfTitle.trim(), words } };
    } else {
      const text = input.trim();
      if (!text && !pendingImg) return;
      body = { text, images: pendingImg ? [pendingImg] : [], category };
    }
    try {
      const { data } = await api.post('/api/posts', body);
      setPosts(p => [data, ...p]);
      resetComposer();
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
    reader.onload = () => { setPostMode('text'); setPendingImg(reader.result); composerRef.current?.focus(); };
    reader.readAsDataURL(file);
  }

  async function react(id, emoji) {
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p;
      const r = { ...(p.reactions || {}) };
      const had = (r[emoji] || []).includes(user.id);
      for (const e of Object.keys(r)) { r[e] = r[e].filter(x => x !== user.id); if (!r[e].length) delete r[e]; }
      if (!had) r[emoji] = [...(r[emoji] || []), user.id];
      return { ...p, reactions: r };
    }));
    try {
      const { data } = await api.post(`/api/posts/${id}/react`, { emoji });
      setPosts(ps => ps.map(p => p.id === id ? { ...p, reactions: data.reactions } : p));
    } catch {}
  }

  async function vote(post, optionIndex) {
    setPosts(ps => ps.map(p => {
      if (p.id !== post.id || !p.poll) return p;
      const options = p.poll.options.map((o, i) => {
        const had = o.votes.includes(user.id);
        if (i === optionIndex && !had) return { ...o, votes: [...o.votes, user.id] };
        return { ...o, votes: o.votes.filter(x => x !== user.id) };
      });
      return { ...p, poll: { ...p.poll, options } };
    }));
    try {
      const { data } = await api.post(`/api/posts/${post.id}/poll/vote`, { optionIndex });
      setPosts(ps => ps.map(p => p.id === post.id ? { ...p, poll: data.poll } : p));
    } catch {}
  }

  async function share(post) {
    setPosts(ps => ps.map(p => {
      if (p.id !== post.id) return p;
      const shares = p.shares || [];
      const has = shares.includes(user.id);
      return { ...p, shares: has ? shares.filter(x => x !== user.id) : [...shares, user.id] };
    }));
    try {
      await navigator.clipboard?.writeText(`${window.location.origin}/social#${post.id}`);
      showToast('Холбоос хуулагдлаа 🔗');
    } catch {}
    try { await api.post(`/api/posts/${post.id}/share`); } catch {}
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

  async function joinGroup(id) {
    try {
      await api.post(`/api/groups/${id}/join`);
      setNewGroups(gs => gs.filter(g => g.id !== id));
      showToast('Группд нэгдлээ 🎉');
    } catch (e) { showToast(e.response?.data?.error || 'Алдаа гарлаа'); }
  }

  const filtered = posts
    .filter(p => {
      if (tab === 'Дагаж буй') return friendIds.has(p.userId);
      if (tab === 'Зөвлөгөө') return p.category === 'advice';
      if (tab === 'Асуулт') return p.category === 'question';
      if (tab === 'Хуваалцсан') return saved[p.id];
      return true;
    })
    .sort((a, b) => {
      if (tab !== 'Шилдэг') return 0;
      const score = p => Object.values(p.reactions || {}).reduce((s, arr) => s + arr.length, 0);
      return score(b) - score(a);
    });

  const challengeDone = challenge && (challenge.myUsedWords?.length || 0) >= (challenge.words?.length || 5);
  const myLevel = stats ? levelProgress(stats.xp) : null;
  const nextReward = stats ? daysToNextReward(stats.streak) : 0;

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Нийгэм" subtitle="Бидний нийгэмлэгт тавтай морил! Хамтдаа суралцаж, хөгжицгөөе." streak={stats?.streak || 0}
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

      {/* Админ мэдэгдэл — сүүлийн 1 хоногийнх л энд харагдана, хуучин нь /social/announcements хуудсанд */}
      {announcements.length > 0 && (() => {
        const recent = announcements.filter(n => Date.now() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000);
        return (
          <div style={{ margin: '0 28px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>📢 Админ мэдэгдэл</h3>
              <button onClick={() => router.push('/social/announcements')} style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>
                Бүх мэдэгдэл →
              </button>
            </div>
            {recent.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Сүүлийн 1 хоногт шинэ мэдэгдэл алга.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map(n => (
                <div key={n.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', borderLeft: `4px solid ${n.color || '#1CB0F6'}` }}>
                  <span style={{ fontSize: 22 }}>{n.emoji || '📢'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{relTime(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Banner */}
      <div style={{ margin: '0 28px 20px', borderRadius: 22, padding: '30px 32px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #2B1156, #4C1D95 55%, #6D28D9)' }}>
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 72, opacity: 0.9 }}>🐼🌍</div>
        <div style={{ maxWidth: 480, position: 'relative' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 8 }}>Шинэ ертөнцийг үгээр нээцгээе 🌍</h2>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 16 }}>Өдөр бүр шинэ үг, шинэ мэдлэг, шинэ найзууд. Чи ганцаараа биш. Бид хамтдаа!</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => composerRef.current?.focus()} className="btn" style={{ background: '#fff', color: '#4C1D95', padding: '10px 18px', fontWeight: 800, fontSize: 13 }}>+ Нийтлэл үүсгэх</button>
            <button onClick={() => { groupSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); groupSearchRef.current?.focus(); }} className="btn" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', padding: '10px 18px', fontWeight: 800, fontSize: 13 }}>+ Бүлэг хайх</button>
          </div>
        </div>
      </div>

      <div className="responsive-sidebar" style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '250px minmax(0,1fr) 320px', gap: 20, alignItems: 'start' }}>
        {/* ── Left sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', lineHeight: 1 }}>{stats?.streak || 0} өдрийн цуваа</div>
              </div>
            </div>
            {nextReward > 0 && <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>Дараагийн шагнал: {nextReward} өдөр</div>}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {(stats?.weekActivity || []).map((d, i) => (
                <div key={d.date} title={d.date} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: d.studied ? 'var(--purple)' : 'var(--bg-alt)', border: '1.5px solid ' + (d.studied ? 'var(--purple)' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                    {d.studied ? '✓' : ''}
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)', fontWeight: 700, marginTop: 3 }}>{WEEKDAY_MN[i % 7]}</div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/vocab/practice')} className="btn btn-purple" style={{ width: '100%', padding: '9px 0', fontSize: 13 }}>Давтах</button>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{user?.avatarEmoji || user?.username?.[0]?.toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>Level {myLevel?.level ?? 1}</div>
              </div>
            </div>
            {myLevel && (
              <>
                <div style={{ height: 7, borderRadius: 4, background: 'var(--bg-alt)', overflow: 'hidden', marginBottom: 5 }}>
                  <div style={{ height: '100%', width: `${myLevel.pct}%`, background: 'linear-gradient(90deg, var(--purple), #A78BFA)', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textAlign: 'right' }}>{stats.xp} / {myLevel.next} XP</div>
              </>
            )}
          </div>
        </div>

        {/* ── Main feed ── */}
        <div>
          <div style={{ display: 'flex', gap: 22, borderBottom: '1.5px solid var(--border)', marginBottom: 18, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap', color: tab === t ? 'var(--purple)' : 'var(--muted)', borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5 }}>{t}</button>
            ))}
          </div>

          {/* Composer */}
          <div className="card" style={{ marginBottom: 16 }}>
            {postMode === 'poll' ? (
              <div style={{ marginBottom: 12 }}>
                <input value={pollQ} onChange={e => setPollQ(e.target.value)} placeholder="Санал асуулгын асуулт..." style={{ width: '100%', background: 'var(--bg-alt)', marginBottom: 8, fontWeight: 700 }} />
                {pollOpts.map((o, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <input value={o} onChange={e => setPollOpts(ps => ps.map((x, j) => j === i ? e.target.value : x))} placeholder={`Сонголт ${i + 1}`} style={{ flex: 1, background: 'var(--bg-alt)', fontSize: 13.5 }} />
                    {pollOpts.length > 2 && <button onClick={() => setPollOpts(ps => ps.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>}
                  </div>
                ))}
                {pollOpts.length < 4 && <button onClick={() => setPollOpts(ps => [...ps, ''])} style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: '4px 0' }}>+ Сонголт нэмэх</button>}
              </div>
            ) : postMode === 'word' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Хэдэн үг хэлэх үү? (заавал биш)" style={{ background: 'var(--bg-alt)' }} />
                {myFolders.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    {myFolders.map(f => (
                      <button key={f.name} onClick={() => pickFolder(f)} style={{
                        flexShrink: 0, padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                        border: pickedFolder === f.name ? '1.5px solid var(--purple)' : '1.5px solid var(--border)',
                        background: pickedFolder === f.name ? 'var(--purple-light)' : 'var(--bg-alt)',
                        color: pickedFolder === f.name ? 'var(--purple)' : 'var(--text-sub)',
                      }}>{pickedFolder === f.name ? '✓ ' : '📁 '}{f.name} ({f.words.length})</button>
                    ))}
                  </div>
                )}
                <input value={wfTitle} onChange={e => { setWfTitle(e.target.value); setPickedFolder(null); }} placeholder="Багцын нэр (жш: Онгоцны буудал)" style={{ background: 'var(--bg-alt)', fontWeight: 700 }} />
                {wfWords.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'var(--bg-alt)', borderRadius: 10, padding: '8px 10px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input value={w.word} onChange={e => setWfWords(ws => ws.map((x, j) => j === i ? { ...x, word: e.target.value } : x))} placeholder="Үг (жш: 你好 / hello)" style={{ background: '#fff', fontWeight: 700, fontSize: 13.5 }} />
                      <input value={w.meaning} onChange={e => setWfWords(ws => ws.map((x, j) => j === i ? { ...x, meaning: e.target.value } : x))} placeholder="Утга (жш: сайн байна уу)" style={{ background: '#fff', fontSize: 13 }} />
                      <input value={w.extra} onChange={e => setWfWords(ws => ws.map((x, j) => j === i ? { ...x, extra: e.target.value } : x))} placeholder="Дуудлага/тайлбар (заавал биш)" style={{ background: '#fff', fontSize: 13 }} />
                    </div>
                    {wfWords.length > 1 && <button onClick={() => setWfWords(ws => ws.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 15 }}>✕</button>}
                  </div>
                ))}
                {wfWords.length < 30 && <button onClick={() => setWfWords(ws => [...ws, { word: '', meaning: '', extra: '' }])} style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: '4px 0', alignSelf: 'flex-start' }}>+ Үг нэмэх</button>}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{user?.avatarEmoji || user?.username?.[0]?.toUpperCase()}</div>
                <input ref={composerRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') publish(); }} placeholder="Юу шинэ байна? (#hashtag ашиглаж болно)" style={{ flex: 1, background: 'var(--bg-alt)', borderRadius: 14 }} />
              </div>
            )}
            {pendingImg && (
              <div style={{ position: 'relative', marginBottom: 12, maxWidth: 240 }}>
                <img src={pendingImg} alt="" style={{ width: '100%', borderRadius: 10 }} />
                <button onClick={() => setPendingImg('')} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer' }}>✕</button>
              </div>
            )}

            {postMode === 'text' && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding: '5px 11px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    border: category === c.id ? '1.5px solid var(--purple)' : '1.5px solid var(--border)',
                    background: category === c.id ? 'var(--purple-light)' : 'var(--bg-alt)',
                    color: category === c.id ? 'var(--purple)' : 'var(--text-sub)' }}>{c.emoji} {c.label}</button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: 'none' }} />
              <button onClick={() => imageInputRef.current?.click()} style={composerToolBtn(postMode === 'text' && !!pendingImg)}>🖼️ Зураг</button>
              <button onClick={() => showToast('Reel нийтлэх тун удахгүй нэмэгдэнэ 🎬')} style={composerToolBtn(false)}>🎬 Reel</button>
              <button onClick={() => setPostMode(m => m === 'poll' ? 'text' : 'poll')} style={composerToolBtn(postMode === 'poll')}>📊 Санал асуулга</button>
              <button onClick={() => setPostMode(m => m === 'word' ? 'text' : 'word')} style={composerToolBtn(postMode === 'word')}>📖 Үг хуваалцах</button>
              <span style={{ flex: 1 }} />
              <button onClick={publish} className="btn btn-purple" style={{ padding: '9px 22px' }}>Нийтлэх</button>
            </div>
          </div>

          {/* Feed */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                {tab === 'Хуваалцсан' ? 'Хадгалсан пост алга.' : tab === 'Дагаж буй' ? 'Найзуудынхаа пост үзэхийн тулд эхлээд найз нэмнэ үү.' : 'Одоогоор пост алга байна. Эхний пост бичээрэй!'}
              </div>}
              {filtered.map(p => {
                const reactions = p.reactions || {};
                const shares = p.shares || [];
                const badge = p.posterAdmin ? { t: 'Admin', c: '#EF4444' } : p.posterPremium ? { t: 'Pro', c: '#7C3AED' } : null;
                const catInfo = CATEGORIES.find(c => c.id === p.category);
                return (
                  <div key={p.id} id={p.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div onClick={() => openProfile(p.userId)} style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--purple-light)', border: '2px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0, cursor: 'pointer' }}>{p.avatarEmoji || p.username?.[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span onClick={() => openProfile(p.userId)} style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)', cursor: 'pointer' }}>{p.username}</span>
                          {p.authorLevel != null && <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--purple)', background: 'var(--purple-light)', borderRadius: 6, padding: '1px 7px' }}>⭐ Level {p.authorLevel}</span>}
                          {badge && <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: badge.c, borderRadius: 6, padding: '1px 7px' }}>{badge.t}</span>}
                          {catInfo && <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-sub)' }}>{catInfo.emoji} {catInfo.label}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{relTime(p.createdAt)}</div>
                      </div>
                      {p.userId === user.id && <button onClick={() => deletePost(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16 }}>🗑️</button>}
                    </div>

                    {p.text && <div style={{ fontSize: 14.5, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: p.images?.length ? 12 : 14 }}>{p.text}</div>}
                    {(p.images || []).map((im, i) => (
                      <img key={i} src={imgUrl(im)} alt="" style={{ width: '100%', maxHeight: 440, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
                    ))}

                    {/* Word card — legacy single-word posts */}
                    {p.wordCard && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg, var(--purple-light), transparent)', border: '1.5px solid var(--purple-mid)', borderRadius: 14, padding: '14px 18px', marginBottom: 12 }}>
                        <span style={{ fontSize: 26 }}>📖</span>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 19, color: 'var(--text)' }}>{p.wordCard.word}</div>
                          {p.wordCard.extra && <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{p.wordCard.extra}</div>}
                          {p.wordCard.meaning && <div style={{ fontSize: 13.5, color: 'var(--text-sub)', fontWeight: 600, marginTop: 2 }}>{p.wordCard.meaning}</div>}
                        </div>
                      </div>
                    )}

                    {/* Word folder — a titled collection of words */}
                    {p.wordFolder && (() => {
                      const isOpen = !!openFolders[p.id];
                      const shown  = isOpen ? p.wordFolder.words : p.wordFolder.words.slice(0, 3);
                      const rest   = p.wordFolder.words.length - shown.length;
                      return (
                        <div style={{ background: 'linear-gradient(135deg, var(--purple-light), transparent)', border: '1.5px solid var(--purple-mid)', borderRadius: 14, padding: '14px 18px', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ fontSize: 22 }}>📁</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 900, fontSize: 15.5, color: 'var(--text)' }}>{p.wordFolder.title}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>{p.wordFolder.words.length} үг</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {shown.map((w, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, background: '#fff', borderRadius: 10, padding: '8px 12px' }}>
                                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{w.word}</span>
                                {w.extra && <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{w.extra}</span>}
                                {w.meaning && <span style={{ fontSize: 12.5, color: 'var(--text-sub)', fontWeight: 600, marginLeft: 'auto' }}>{w.meaning}</span>}
                              </div>
                            ))}
                          </div>
                          {rest > 0 && (
                            <button onClick={() => setOpenFolders(o => ({ ...o, [p.id]: true }))} style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: '8px 0 0' }}>+{rest} илүү үг харах</button>
                          )}
                          {isOpen && p.wordFolder.words.length > 3 && (
                            <button onClick={() => setOpenFolders(o => ({ ...o, [p.id]: false }))} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: '8px 0 0' }}>Хураах</button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Poll */}
                    {p.poll && (() => {
                      const totalVotes = p.poll.options.reduce((s, o) => s + o.votes.length, 0);
                      const myVoteIdx = p.poll.options.findIndex(o => o.votes.includes(user.id));
                      return (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)', marginBottom: 10 }}>📊 {p.poll.question}</div>
                          {p.poll.options.map((o, i) => {
                            const pct = totalVotes ? Math.round((o.votes.length / totalVotes) * 100) : 0;
                            const mine = i === myVoteIdx;
                            return (
                              <button key={i} onClick={() => vote(p, i)} style={{ display: 'block', width: '100%', textAlign: 'left', position: 'relative', borderRadius: 10, border: '1.5px solid ' + (mine ? 'var(--purple)' : 'var(--border)'), background: 'var(--bg-alt)', overflow: 'hidden', marginBottom: 6, cursor: 'pointer', padding: '9px 12px' }}>
                                <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: 'var(--purple-light)', transition: 'width .3s' }} />
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                                  <span>{mine ? '✓ ' : ''}{o.text}</span>
                                  <span style={{ color: 'var(--muted)' }}>{pct}%</span>
                                </div>
                              </button>
                            );
                          })}
                          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{totalVotes} санал өгсөн</div>
                        </div>
                      );
                    })()}

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
                      <button onClick={() => share(p)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, color: shares.includes(user.id) ? 'var(--purple)' : 'var(--text-sub)' }}>↗ {shares.length}</button>
                      <button onClick={() => toggleSave(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: saved[p.id] ? 'var(--purple)' : 'var(--muted)', marginLeft: 'auto' }}>{saved[p.id] ? '🔖' : '🏷️'}</button>
                    </div>

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
          <div className="card" style={{ position: 'relative' }}>
            <input ref={groupSearchRef} value={searchQ} onChange={e => onSearch(e.target.value)} placeholder="🔍 Хайх (хэрэглэгч, бүлэг, пост...)" style={{ width: '100%', background: 'var(--bg-alt)' }} />
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

          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Шинэ бүлгүүд 👥</h3>
            {newGroups.length === 0 && <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Нэгдэх шинэ групп алга.</div>}
            {newGroups.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>👥</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{g.members.length} гишүүн</div>
                </div>
                <button onClick={() => joinGroup(g.id)} className="btn btn-purple" style={{ padding: '5px 12px', fontSize: 11.5, flexShrink: 0 }}>Нэгдэх</button>
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
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Level {levelFromXp(profileCard.xp)} · Нийт #{profileCard.rank}-р байр</div>
            </div>
            <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
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

function composerToolBtn(active) {
  return {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5,
    border: active ? '1.5px solid var(--purple)' : '1.5px solid var(--border)',
    background: active ? 'var(--purple-light)' : 'var(--bg-alt)',
    color: active ? 'var(--purple)' : 'var(--text-sub)',
  };
}
