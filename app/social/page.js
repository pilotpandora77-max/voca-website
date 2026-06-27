'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const TABS = ['Бүгд', 'Найзууд', 'Группууд', 'Админаас', 'Хадгалсан'];

const FRIENDS = [
  { name: 'Энхтүшин', emoji: '🧑', color: '#7C3AED', status: 'online' },
  { name: 'Мөнхзул', emoji: '👩', color: '#EC4899', status: 'online' },
  { name: 'Бат-Эрдэнэ', emoji: '🧔', color: '#10B981', status: 'online' },
  { name: 'Номин', emoji: '👧', color: '#F59E0B', status: 'away' },
  { name: 'Номин-Эрдэнэ', emoji: '🙎', color: '#3B82F6', status: 'offline' },
];

const DMS = [
  { name: 'Энхтүшин', emoji: '🧑', color: '#7C3AED', last: "Present Perfect-н дасгал хийлээ...", time: '11:20', unread: 2 },
  { name: 'Мөнхзул', emoji: '👩', color: '#EC4899', last: 'IELTS материал явуулж өгөөч', time: '10:48', unread: 1 },
  { name: 'English Speaking Club', emoji: '🗣️', color: '#6D28D9', last: 'Багш: Маргааш 20:00 цагаас...', time: '09:15', unread: 5 },
  { name: 'Бат-Эрдэнэ', emoji: '🧔', color: '#10B981', last: 'За ойлголоо, баярлалаа!', time: 'Өчигдөр', unread: 0 },
];

const RULES = [
  { icon: '💬', t: 'Нийгмийн чатлах дүрэм' },
  { icon: '📝', t: 'Пост оруулах дүрэм' },
  { icon: '👥', t: 'Группын дүрэм' },
  { icon: '⚠️', t: 'Алдаа мэдээлэх заавар' },
];

const SEED = [
  { id: 1, user: 'Энхтүшин', emoji: '🧑', color: '#7C3AED', level: 'A2', time: '2 цагийн өмнө', kind: 'grammar',
    text: 'Өнөөдөр Present Perfect Tense-ийн тухай маш сайн хичээл үзлээ! Маш их зүйл сурлаа. Хуваалцсанд баярлалаа багш аа! 🙌',
    tags: ['#EnglishGrammar', '#PresentPerfect', '#StudyTogether'], likes: 24, comments: 5, group: 'friends', lessonId: 'present-perfect' },
  { id: 2, user: 'Мөнхзул', emoji: '👩', color: '#EC4899', level: 'B1', time: '5 цагийн өмнө', kind: 'question',
    text: 'Канад явах гэж байгаа найзуудаа! IELTS өгөхдөө хамгийн их анхаарах зүйлс юу вэ? Туршлагаа хуваалцаач 🙏',
    tags: [], likes: 15, comments: 12, group: 'friends' },
  { id: 3, user: 'Админ', emoji: 'V', color: '#7C3AED', level: 'Admin', time: '1 өдрийн өмнө', kind: 'admin', admin: true,
    text: 'ШИНЭЧЛЭЛ: Дуудлага дасгал шинэчлэгдлээ!\n\nДуудлага дасгалын сан 500+ шинэ үгээр нэмэгдлээ. Та бүхнийг шинэ дуудлагын дасгалаа туршиж үзэхийг урьж байна! 🚀',
    tags: [], likes: 36, comments: 3, group: 'admin', media: ['AI Дуудлага дасгал', 'Шинэ үгс', 'Дуудлага шалгалт'] },
  { id: 4, user: 'Бат-Эрдэнэ', emoji: '🧔', color: '#10B981', level: 'A2', time: '1 өдрийн өмнө', kind: 'vocabulary',
    text: 'Өнөөдрийн шинэ үг: 加油 (jiāyóu) — "хүчээ ав / урагшаа!". Маш их хэрэглэгддэг үг шүү! 💪',
    tags: ['#Vocabulary', '#Chinese'], likes: 28, comments: 7, group: 'all', vocab: { word: '加油', reading: 'jiāyóu', mn: 'хүчээ ав' } },
];

const KIND_META = {
  vocabulary: { label: '📖 Үг', c: '#7C3AED' },
  grammar: { label: '📚 Дүрэм', c: '#3B82F6' },
  question: { label: '❓ Асуулт', c: '#F59E0B' },
  poll: { label: '📊 Санал асуулга', c: '#10B981' },
  admin: { label: '📢 Зар', c: '#EF4444' },
  normal: { label: '', c: '' },
};

export default function SocialPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [stats, setStats]   = useState(null);
  const [tab, setTab]       = useState('Бүгд');
  const [posts, setPosts]   = useState(SEED);
  const [input, setInput]   = useState('');
  const [liked, setLiked]   = useState({});
  const [saved, setSaved]   = useState({});
  const [toast, setToast]   = useState('');
  const composerRef = useRef(null);
  const toastT = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
      api.get('/api/stats').then(r => setStats(r.data)).catch(() => {});
    }
    try {
      const sp = JSON.parse(localStorage.getItem('voca_social_posts') || '[]');
      if (sp.length) setPosts(p => [...sp, ...p]);
      setLiked(JSON.parse(localStorage.getItem('voca_social_liked') || '{}'));
      setSaved(JSON.parse(localStorage.getItem('voca_social_saved') || '{}'));
    } catch {}
  }, [authLoad, user]);

  if (authLoad) return null;

  function showToast(t) { setToast(t); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2400); }

  function addPost(extra) {
    const text = (extra.text ?? input).trim();
    if (!text && !extra.poll && !extra.img && !extra.video && !extra.link) return;
    const post = { id: Date.now(), user: user?.username || 'Та', emoji: user?.avatarEmoji || '😊', color: '#6D28D9', level: stats ? lvlLabel(stats.xp) : 'A1', time: 'одоо', kind: 'normal', text, tags: [], likes: 0, comments: 0, group: 'mine', mine: true, ...extra };
    setPosts(p => [post, ...p]);
    // Media (зураг/видео) постыг localStorage-д хадгалахгүй (хэмжээ хэтрэхээс сэргийлж)
    if (!extra.img && !extra.video) {
      try { const sp = JSON.parse(localStorage.getItem('voca_social_posts') || '[]'); localStorage.setItem('voca_social_posts', JSON.stringify([post, ...sp])); } catch {}
    }
    setInput('');
    showToast('Пост нийтлэгдлээ! 🎉');
  }
  function publish() { addPost({}); }

  function attach(type) {
    if (type === 'poll') {
      const q = prompt('Санал асуултын асуулт:'); if (!q) return;
      const a = prompt('1-р хариулт:'); if (!a) return;
      const b = prompt('2-р хариулт:'); if (!b) return;
      addPost({ text: q, kind: 'poll', poll: { options: [{ t: a, v: 0 }, { t: b, v: 0 }], voted: null } });
    } else if (type === 'img') {
      imageInputRef.current?.click();
    } else if (type === 'video') {
      videoInputRef.current?.click();
    } else if (type === 'link') {
      const url = prompt('Холбоос (URL):'); if (!url) return;
      addPost({ text: input.trim() || 'Холбоос хуваалцлаа 🔗', link: url, linkLabel: '🔗 Холбоос нээх' });
    }
  }
  function onPickImage(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Зураг 5MB-аас бага байх ёстой'); return; }
    const reader = new FileReader();
    reader.onload = () => addPost({ text: input.trim(), img: reader.result });
    reader.readAsDataURL(file);
  }
  function onPickVideo(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { showToast('Видео 25MB-аас бага байх ёстой'); return; }
    const reader = new FileReader();
    reader.onload = () => addPost({ text: input.trim(), video: reader.result });
    reader.readAsDataURL(file);
  }
  function votePoll(id, oi) {
    setPosts(ps => ps.map(p => {
      if (p.id !== id || !p.poll || p.poll.voted !== null) return p;
      const options = p.poll.options.map((o, i) => i === oi ? { ...o, v: o.v + 1 } : o);
      return { ...p, poll: { ...p.poll, options, voted: oi } };
    }));
  }

  function toggleLike(id) {
    setLiked(prev => { const n = { ...prev, [id]: !prev[id] }; localStorage.setItem('voca_social_liked', JSON.stringify(n)); return n; });
  }
  function toggleSave(id) {
    setSaved(prev => { const n = { ...prev, [id]: !prev[id] }; localStorage.setItem('voca_social_saved', JSON.stringify(n)); return n; });
    showToast(saved[id] ? 'Хадгалснаас хаслаа' : 'Хадгаллаа 🔖');
  }
  async function saveVocab(v) {
    try { await api.post('/api/words', { front: v.word, back: v.mn, hint: v.reading, word: v.word, meaning: v.mn, reading: v.reading, lang: 'zh' }); showToast('Үгийн санд нэмэгдлээ! 📚'); }
    catch { showToast('Үгийн санд нэмэгдлээ! 📚'); }
  }

  const filtered = posts.filter(p => {
    if (tab === 'Бүгд') return true;
    if (tab === 'Найзууд') return p.group === 'friends' || p.mine;
    if (tab === 'Группууд') return p.group === 'group';
    if (tab === 'Админаас') return p.admin;
    if (tab === 'Хадгалсан') return saved[p.id];
    return true;
  });

  const xp = stats?.xp || 0;

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Нийгэм" subtitle="Бидний нийгэмлэгт тавтай морил! Хамтдаа суралцаж, хөгжицгээе." streak={streak}
        actions={<button onClick={() => composerRef.current?.focus()} className="btn btn-purple" style={{ padding: '9px 16px', fontSize: 13 }}>✏️ Пост бичих</button>} />

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20, alignItems: 'start' }}>
        {/* ── Main ── */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 26, borderBottom: '1.5px solid var(--border)', marginBottom: 18, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', color: tab === t ? 'var(--purple)' : 'var(--muted)', borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5 }}>{t}</button>
            ))}
          </div>

          {/* Composer */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{user?.avatarEmoji || user?.username?.[0]?.toUpperCase()}</div>
              <input ref={composerRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') publish(); }} placeholder="Юу шинэ байна?" style={{ flex: 1, background: 'var(--bg-alt)', borderRadius: 14 }} />
              <input ref={imageInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: 'none' }} />
              <input ref={videoInputRef} type="file" accept="video/*" onChange={onPickVideo} style={{ display: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {[['🖼️', 'Зураг', 'img'], ['🎬', 'Видео', 'video']].map(([ic, l, t]) => (
                <button key={l} onClick={() => attach(t)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-alt)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5, color: 'var(--text-sub)' }}>{ic} {l}</button>
              ))}
              <button onClick={publish} disabled={!input.trim()} className="btn btn-purple" style={{ marginLeft: 'auto', padding: '9px 22px' }}>Оруулах</button>
            </div>
          </div>

          {/* Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 36, color: 'var(--muted)' }}>Энд пост алга байна.</div>}
            {filtered.map(p => {
              const km = KIND_META[p.kind] || KIND_META.normal;
              const likeCount = p.likes + (liked[p.id] ? 1 : 0);
              return (
                <div key={p.id} className="card" style={p.admin ? { border: '1.5px solid var(--purple-mid)', background: 'linear-gradient(135deg, var(--purple-soft), #fff)' } : {}}>
                  {/* head */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: p.admin ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : `${p.color}22`, border: `2px solid ${p.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color: p.admin ? '#fff' : undefined, fontWeight: 900, flexShrink: 0 }}>{p.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)' }}>{p.user}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: p.admin ? '#fff' : 'var(--green-dark)', background: p.admin ? 'var(--purple)' : 'var(--green-light)', borderRadius: 6, padding: '1px 7px' }}>{p.level}</span>
                        {km.label && <span style={{ fontSize: 10.5, fontWeight: 700, color: km.c, background: `${km.c}14`, borderRadius: 6, padding: '1px 7px' }}>{km.label}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.time}</div>
                    </div>
                    <button onClick={() => showToast('Цэс удахгүй нэмэгдэнэ')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>⋯</button>
                  </div>

                  {/* text */}
                  <div style={{ fontSize: 14.5, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: p.tags?.length || p.media || p.vocab ? 12 : 14 }}>{p.text}</div>

                  {/* media cards */}
                  {p.media && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${p.media.length}, 1fr)`, gap: 10, marginBottom: 12 }}>
                      {p.media.map((m, i) => (
                        <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
                          <div style={{ height: 90, background: 'linear-gradient(135deg, var(--purple-light), var(--purple-soft))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>{['🎙️','📝','🏆'][i] || '📚'}</div>
                          <div style={{ padding: '8px 10px', fontSize: 11.5, fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>{m}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* vocab card */}
                  {p.vocab && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 12, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{p.vocab.word}</div>
                        <div style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700 }}>{p.vocab.reading} · {p.vocab.mn}</div>
                      </div>
                      <button onClick={() => saveVocab(p.vocab)} className="btn btn-purple" style={{ marginLeft: 'auto', padding: '8px 14px', fontSize: 12 }}>📚 Үгийн санд хадгалах</button>
                    </div>
                  )}

                  {/* image */}
                  {p.img && (
                    <img src={p.img} alt="" style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                  )}
                  {/* video */}
                  {p.video && (
                    <video src={p.video} controls style={{ width: '100%', maxHeight: 420, borderRadius: 12, marginBottom: 12, background: '#000' }} />
                  )}
                  {/* link */}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 12, marginBottom: 12, textDecoration: 'none', border: '1.5px solid var(--border)' }}>
                      <span style={{ fontWeight: 800, color: 'var(--purple)', fontSize: 13 }}>{p.linkLabel || '🔗 Холбоос'}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.link}</span>
                    </a>
                  )}
                  {/* poll */}
                  {p.poll && (
                    <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(() => { const total = p.poll.options.reduce((a, o) => a + o.v, 0); return p.poll.options.map((o, oi) => {
                        const pct = total ? Math.round((o.v / total) * 100) : 0;
                        const voted = p.poll.voted !== null;
                        return (
                          <button key={oi} onClick={() => votePoll(p.id, oi)} disabled={voted} style={{ position: 'relative', textAlign: 'left', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${p.poll.voted === oi ? 'var(--purple)' : 'var(--border)'}`, background: 'var(--bg-alt)', cursor: voted ? 'default' : 'pointer', fontFamily: 'inherit', overflow: 'hidden' }}>
                            {voted && <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: 'var(--purple-light)', zIndex: 0 }} />}
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', zIndex: 1 }}>
                              <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>{o.t}</span>
                              {voted && <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--purple)' }}>{pct}%</span>}
                            </div>
                          </button>
                        );
                      }); })()}
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{p.poll.options.reduce((a, o) => a + o.v, 0)} санал</div>
                    </div>
                  )}
                  {/* tags */}
                  {p.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {p.tags.map(t => <span key={t} style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)' }}>{t}</span>)}
                    </div>
                  )}

                  {/* learning integration */}
                  {p.kind === 'grammar' && p.lessonId && (
                    <Link href={`/grammar-lessons/${p.lessonId}`} className="btn btn-light" style={{ textDecoration: 'none', fontSize: 12.5, padding: '8px 16px', marginBottom: 12, display: 'inline-flex' }}>🎯 Энэ дүрмийн дасгал хийх</Link>
                  )}

                  {/* actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => toggleLike(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, color: liked[p.id] ? 'var(--red)' : 'var(--text-sub)' }}>{liked[p.id] ? '❤️' : '🤍'} {likeCount}</button>
                    <button onClick={() => showToast('Сэтгэгдэл удахгүй нэмэгдэнэ')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, color: 'var(--text-sub)' }}>💬 {p.comments}</button>
                    <button onClick={() => showToast('Хуваалцлаа!')} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, color: 'var(--text-sub)', marginLeft: 'auto' }}>↗ Хувалцах</button>
                    <button onClick={() => toggleSave(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: saved[p.id] ? 'var(--purple)' : 'var(--muted)' }}>{saved[p.id] ? '🔖' : '🏷️'}</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={() => showToast('Бүх пост ачаалагдсан')} className="btn btn-ghost" style={{ padding: '10px 24px' }}>Илүү олон пост харах ▾</button>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Updates (admin) */}
          <div className="card" style={{ border: '1.5px solid var(--purple-mid)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--purple)' }}>📢 Шинэчлэл</h3>
            </div>
            {[
              { t: 'Дуудлага дасгал 500+ үгээр шинэчлэгдлээ', d: 'Өнөөдөр' },
              { t: 'Англи дүрмийн хичээл A1–C1 нэмэгдлээ', d: '2 өдрийн өмнө' },
              { t: 'Тоглоомын шинэ горим: Санах ой', d: '3 өдрийн өмнө' },
            ].map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--purple)', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600, lineHeight: 1.4 }}>{u.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{u.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Rules (moved up) */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)' }}>Дүрэм, журам</h3>
              <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, cursor: 'pointer' }} onClick={() => showToast('Бүх дүрэм')}>Бүгдийг харах</span>
            </div>
            {RULES.map(r => (
              <div key={r.t} onClick={() => showToast(r.t)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>{r.t}</span>
                <span style={{ color: 'var(--muted)' }}>›</span>
              </div>
            ))}
          </div>

          {/* Friends */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)' }}>Найзууд</h3>
              <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, cursor: 'pointer' }} onClick={() => showToast('Найзуудын жагсаалт')}>Бүгдийг харах</span>
            </div>
            {FRIENDS.map(f => (
              <div key={f.name} onClick={() => showToast(`${f.name}-тэй чатлах`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${f.color}22`, border: `2px solid ${f.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{f.emoji}</div>
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: f.status === 'online' ? '#10B981' : f.status === 'away' ? '#F59E0B' : '#9CA3AF', border: '2px solid #fff' }} />
                </div>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{f.name}</span>
              </div>
            ))}
          </div>

          {/* DMs */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)' }}>Шууд зурвасууд</h3>
              <button onClick={() => showToast('Шинэ зурвас')} style={{ background: 'var(--purple-light)', border: 'none', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', color: 'var(--purple)', fontSize: 16, fontWeight: 900 }}>+</button>
            </div>
            {DMS.map(d => (
              <div key={d.name} onClick={() => showToast(`${d.name}-тэй чат`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${d.color}22`, border: `2px solid ${d.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{d.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{d.name}</span><span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.time}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.last}</div>
                </div>
                {d.unread > 0 && <span style={{ background: 'var(--purple)', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 99, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{d.unread}</span>}
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: 8 }}><span style={{ fontSize: 12.5, color: 'var(--purple)', fontWeight: 700, cursor: 'pointer' }} onClick={() => showToast('Бүх зурвас')}>Бүгдийг харах</span></div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 80}px)`, opacity: toast ? 1 : 0, background: '#1E1B4B', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, transition: 'all .3s cubic-bezier(.34,1.56,.64,1)', zIndex: 999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>{toast}</div>
    </div>
  );
}

function lvlLabel(xp = 0) {
  if (xp >= 3000) return 'C1'; if (xp >= 1500) return 'B2'; if (xp >= 600) return 'B1'; if (xp >= 200) return 'A2'; return 'A1';
}
