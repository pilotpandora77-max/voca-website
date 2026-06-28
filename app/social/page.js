'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const TABS = ['Бүгд', 'Найзууд', 'Миний', 'Хадгалсан'];

const RULES = [
  { icon: '💬', t: 'Нийгмийн чатлах дүрэм' },
  { icon: '📝', t: 'Пост оруулах дүрэм' },
  { icon: '👥', t: 'Группын дүрэм' },
  { icon: '⚠️', t: 'Алдаа мэдээлэх заавар' },
];
const UPDATES = [
  { t: 'Нийгэм хэсэг backend-тэй холбогдлоо', d: 'Өнөөдөр' },
  { t: 'Англи дүрмийн хичээл A1–C1 нэмэгдлээ', d: '2 өдрийн өмнө' },
  { t: 'IELTS бэлтгэлийн хичээл нэмэгдлээ', d: '3 өдрийн өмнө' },
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
  const composerRef = useRef(null);
  const imageInputRef = useRef(null);
  const toastT = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) { load(); api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {}); }
    try { setSaved(JSON.parse(localStorage.getItem('voca_social_saved') || '{}')); } catch {}
  }, [authLoad, user]);

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
      showToast('Пост нийтлэгдлээ! 🎉');
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

  async function toggleLike(id) {
    // optimistic
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p;
      const likes = p.likes || [];
      const has = likes.includes(user.id);
      return { ...p, likes: has ? likes.filter(x => x !== user.id) : [...likes, user.id] };
    }));
    try { await api.post(`/api/posts/${id}/like`); } catch {}
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
    } catch { showToast('Сэтгэгдэл нэмэхэд алдаа'); }
  }

  const filtered = posts.filter(p => {
    if (tab === 'Миний') return p.userId === user.id;
    if (tab === 'Хадгалсан') return saved[p.id];
    return true; // Бүгд, Найзууд (найзаар шүүх backend талд хийгдээгүй тул бүгд)
  });

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Нийгэм" subtitle="Бидний нийгэмлэгт тавтай морил! Хамтдаа суралцаж, хөгжицгөөе." streak={streak}
        actions={<button onClick={() => composerRef.current?.focus()} className="btn btn-purple" style={{ padding: '9px 16px', fontSize: 13 }}>✏️ Пост бичих</button>} />

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
              <input ref={composerRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') publish(); }} placeholder="Юу шинэ байна?" style={{ flex: 1, background: 'var(--bg-alt)', borderRadius: 14 }} />
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
                const likes = p.likes || [];
                const liked = likes.includes(user.id);
                const badge = p.posterAdmin ? { t: 'Admin', c: '#EF4444' } : p.posterPremium ? { t: 'Pro', c: '#7C3AED' } : null;
                return (
                  <div key={p.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--purple-light)', border: '2px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{p.avatarEmoji || p.username?.[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)' }}>{p.username}</span>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <button onClick={() => toggleLike(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, color: liked ? 'var(--red)' : 'var(--text-sub)' }}>{liked ? '❤️' : '🤍'} {likes.length}</button>
                      <button onClick={() => openCmt(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, color: 'var(--text-sub)' }}>💬 {p.commentCount || 0}</button>
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
                          <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendComment(p.id); }} placeholder="Сэтгэгдэл бичих..." style={{ flex: 1, background: 'var(--bg-alt)' }} />
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
          <div className="card" style={{ border: '1.5px solid var(--purple-mid)' }}>
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--purple)', marginBottom: 12 }}>📢 Шинэчлэл</h3>
            {UPDATES.map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < UPDATES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--purple)', marginTop: 6, flexShrink: 0 }} />
                <div><div style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600, lineHeight: 1.4 }}>{u.t}</div><div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{u.d}</div></div>
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
          </div>
          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--purple-light), var(--purple-soft))', border: '1.5px solid var(--purple-mid)' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>👑</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--purple-dark)', marginBottom: 6 }}>Premium болж пост нийтэл</div>
            <p style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 12 }}>Зөвхөн Premium гишүүд нийгэмд пост, бүлэг үүсгэх боломжтой.</p>
            <button onClick={() => router.push('/pricing')} className="btn btn-purple" style={{ width: '100%' }}>Багц авах</button>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 80}px)`, opacity: toast ? 1 : 0, background: '#1E1B4B', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, transition: 'all .3s cubic-bezier(.34,1.56,.64,1)', zIndex: 999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>{toast}</div>
    </div>
  );

  async function deletePost(id) {
    if (!confirm('Энэ постыг устгах уу?')) return;
    setPosts(ps => ps.filter(p => p.id !== id));
    try { await api.delete(`/api/posts/${id}`); } catch {}
  }
}
