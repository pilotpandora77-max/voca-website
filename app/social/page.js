'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/* ── Static data ── */
const CHANNELS = [
  { id: 'general',  label: 'general',          desc: 'Хятад хэл сурагчдын нийтлэлийн суваг', unread: 3 },
  { id: 'study',    label: 'суралцах-хэсэг',   desc: 'Хичээл болон даалгавар хуваалцах',     unread: 0 },
  { id: 'vocab',    label: 'үг-санал-болгох',  desc: 'Санал хүсэлт',                          unread: 1 },
  { id: 'grammar',  label: 'дүрэм-асуулт',     desc: 'Тусламж, дүрэм',                        unread: 0 },
  { id: 'culture',  label: 'хятад-соёл',       desc: 'Хятад соёл, зан заншил',               unread: 0 },
];

const MEMBERS_ONLINE = [
  { name: 'Болд',    color: '#7C3AED', initials: 'Б', sub: 'Flashcard давтаж байна', status: 'online' },
  { name: 'Сарнай',  color: '#EC4899', initials: 'С', sub: 'Толь бичиг ашиглаж байна', status: 'online' },
  { name: 'Ганбаяр', color: '#F59E0B', initials: 'Г', sub: 'Тест хийж байна', status: 'busy' },
  { name: 'Мөнхзул', color: '#10B981', initials: 'М', sub: 'Ханз бичиж байна', status: 'online' },
];
const MEMBERS_OFFLINE = [
  { name: 'Дорж',   color: '#9CA3AF', initials: 'Д', sub: 'Reel үзэж байна' },
  { name: 'Оюунаа', color: '#9CA3AF', initials: 'О', sub: '5 минутын өмнө' },
];
const TOP = [
  { rank: '🥇', name: 'Сарнай',  color: '#EC4899', initials: 'С', xp: 1240 },
  { rank: '🥈', name: 'Ганбаяр', color: '#F59E0B', initials: 'Г', xp: 1105 },
  { rank: '🥉', name: 'Мөнхзул', color: '#10B981', initials: 'М', xp: 980 },
];

const EMOJIS = ['😂','😊','😍','❤️','🎯','🔥','✨','👍','🥰','😅','🙏','👏'];
const AUTO_REPLIES = [
  '很好！ Маш сайн!', '谢谢你！ Баярлалаа!', 'Үргэлжлүүлж суралцъя 📚',
  '你说得对！ Зөв хэлж байна!', 'HSK 2 руу бэлдэх цаг боллоо 🎯', '加油！ Чармайгаарай!',
];

const INITIAL = {
  general: [
    { id: 1, user: 'Болд',    color: '#7C3AED', initials: 'Б', badge: { t: '🔥 Streak 15', c: 'streak' }, time: '10:23', text: '你好 хэрхэн гарна вэ? Цэнхэр байгаа л даа', reactions: [{ e: '😂', n: 3 }, { e: '👍', n: 2, mine: true }, { e: '😊', n: 1 }] },
    { id: 2, user: 'Сарнай',  color: '#EC4899', initials: 'С', badge: { t: '⭐ 1240 XP', c: 'xp' }, time: '10:24', text: 'nǐ hǎo гэж унших, 2-р өнгөний аялга! Ийм байна: nǐ', reactions: [{ e: '🙏', n: 5 }, { e: '😊', n: 2 }] },
    { id: 3, user: 'Ганбаяр', color: '#F59E0B', initials: 'Г', badge: { t: '👑 Admin', c: 'admin' }, time: '10:26', text: 'Манай бүлэгт нэгдэх үү? Өдөр бүр дасгал хийдэг 🎯', embed: { title: 'HSK 1 бүлэг', meta: '15 гишүүн · Өдөр бүр 19:00', action: 'Нэгдэх' }, reactions: [{ e: '🎯', n: 4, mine: true }, { e: '👍', n: 2 }] },
    { id: 4, user: 'Мөнхзул', color: '#10B981', initials: 'М', badge: { t: '🏆 980 XP', c: 'xp' }, time: '10:28', text: '学 тэмдэгтийн зурааслалыг дараах байдлаар хийнэ:', reactions: [{ e: '❤️', n: 7 }, { e: '👏', n: 4 }] },
    { id: 5, user: 'Болд',    color: '#7C3AED', initials: 'Б', badge: { t: '🔥 Streak 15', c: 'streak' }, time: '10:30', text: 'Баярлалаа хүн бүр! 谢谢大家 🙏', reactions: [{ e: '🥰', n: 6 }, { e: '😊', n: 2 }] },
  ],
  study: [
    { id: 11, user: 'Мөнхзул', color: '#10B981', initials: 'М', time: '09:10', text: 'Өнөөдөр HSK 1 үгсээ давтлаа! Хэн нэгдэх вэ? 📚', reactions: [{ e: '🔥', n: 4 }] },
  ],
  vocab: [
    { id: 21, user: 'Сарнай', color: '#EC4899', initials: 'С', time: '08:40', text: '加油 (jiāyóu) — "хүчээ ав" гэсэн их хэрэгтэй үг 💪', reactions: [{ e: '👍', n: 6 }] },
  ],
  grammar: [
    { id: 31, user: 'Ганбаяр', color: '#F59E0B', initials: 'Г', time: '11:05', text: '了 (le) хэзээ хэрэглэдэг вэ? Тайлбарлаж өгөх үү? 🤔', reactions: [{ e: '🙏', n: 2 }] },
  ],
  culture: [
    { id: 41, user: 'Оюунаа', color: '#8B5CF6', initials: 'О', time: '12:20', text: 'Хятадын цагаан сар (春节) удахгүй! 🧧🐉', reactions: [{ e: '🎉', n: 8 }] },
  ],
};

const badgeStyle = {
  xp:     { background: '#FEF3C7', color: '#92400E' },
  admin:  { background: '#EDE9FE', color: '#5B21B6' },
  streak: { background: '#FFF7ED', color: '#C2410C' },
  me:     { background: '#EDE9FE', color: '#5B21B6' },
};

export default function SocialPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  const [channel, setChannel] = useState('general');
  const [visited, setVisited] = useState(new Set(['general']));
  const [allMsgs, setAllMsgs] = useState(INITIAL);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState('');
  const [emojiOpen, setEmoji] = useState(false);
  const [toast, setToast]     = useState('');
  const [streak, setStreak]   = useState(false);
  const [dm, setDm]           = useState(null);   // { name, color, initials }
  const [dmMsgs, setDmMsgs]   = useState([]);
  const [dmInput, setDmInput] = useState('');
  const [msgCount, setMsgCount] = useState(342);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const dmBottomRef = useRef(null);
  const typingTimer = useRef(null);
  const toastTimer  = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    try {
      const s = localStorage.getItem('voca_social_v2');
      if (s) setAllMsgs(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  const msgs = allMsgs[channel] || [];
  const ch = CHANNELS.find(c => c.id === channel);

  useEffect(() => { try { localStorage.setItem('voca_social_v2', JSON.stringify(allMsgs)); } catch {} }, [allMsgs]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length, channel]);
  useEffect(() => { dmBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [dmMsgs]);

  const me = { name: user?.username || 'Та', color: '#6D28D9', initials: (user?.username?.[0] || 'Т').toUpperCase() };

  function showToast(t) {
    setToast(t); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    const msg = { id: Date.now(), user: me.name, color: me.color, initials: me.initials, badge: { t: '👑 Та', c: 'me' }, time: 'одоо', text, reactions: [], mine: true };
    setAllMsgs(p => ({ ...p, [channel]: [...(p[channel] || []), msg] }));
    setInput(''); setEmoji(false);
    setMsgCount(c => c + 1);
    setStreak(true); setTimeout(() => setStreak(false), 2800);
    simulateReply();
  }

  function simulateReply() {
    const pool = MEMBERS_ONLINE;
    const m = pool[Math.floor(Math.random() * pool.length)];
    setTyping(`${m.name} бичиж байна...`);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setTyping('');
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const msg = { id: Date.now() + 1, user: m.name, color: m.color, initials: m.initials, time: 'одоо', text: reply, reactions: [{ e, n: 1 }] };
      setAllMsgs(p => ({ ...p, [channel]: [...(p[channel] || []), msg] }));
      setMsgCount(c => c + 1);
    }, 1800);
  }

  function toggleReaction(msgId, idx) {
    setAllMsgs(p => ({
      ...p,
      [channel]: (p[channel] || []).map(m => {
        if (m.id !== msgId) return m;
        const reactions = m.reactions.map((r, i) => i === idx ? { ...r, mine: !r.mine, n: r.mine ? r.n - 1 : r.n + 1 } : r);
        return { ...m, reactions };
      }),
    }));
  }

  function addReaction(msgId) {
    const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setAllMsgs(p => ({
      ...p,
      [channel]: (p[channel] || []).map(m => m.id === msgId ? { ...m, reactions: [...m.reactions, { e, n: 1, mine: true }] } : m),
    }));
  }

  function openDM(m) {
    setDm(m);
    setDmMsgs([
      { mine: false, text: 'Сайн байна уу! 你好', time: '10:15' },
      { mine: true,  text: 'Сайн! Хятад хэлний хичээл хэрхэн явж байна?', time: '10:16' },
      { mine: false, text: 'Сайн! HSK 1 дуусаж байна 😊', time: '10:17' },
    ]);
  }
  function sendDM() {
    const text = dmInput.trim();
    if (!text || !dm) return;
    setDmMsgs(d => [...d, { mine: true, text, time: 'одоо' }]);
    setDmInput('');
    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setDmMsgs(d => [...d, { mine: false, text: reply, time: 'одоо' }]);
    }, 1000);
  }

  if (authLoad) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'inherit', background: '#F5F3FF' }}>
      <style>{`
        .sc-srv { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; cursor:pointer; transition:border-radius .2s, background .2s; }
        .sc-srv:hover, .sc-srv.active { border-radius:14px; }
        .sc-ch { display:flex; align-items:center; gap:8px; padding:7px 12px 7px 14px; cursor:pointer; border-radius:6px; margin:1px 8px; color:#A78BFA; font-size:14px; transition:.1s; }
        .sc-ch:hover { background:#312E81; color:#fff; }
        .sc-ch.active { background:#4C1D95; color:#fff; }
        .sc-vc { display:flex; align-items:center; gap:8px; padding:6px 12px 6px 14px; cursor:pointer; border-radius:6px; margin:1px 8px; color:#8B85C1; font-size:13px; transition:.1s; }
        .sc-vc:hover { background:#312E81; color:#fff; }
        .sc-msg { padding:6px 16px; display:flex; gap:12px; border-radius:4px; transition:background .1s; position:relative; }
        .sc-msg:hover { background:#F9F8FF; }
        .sc-msg:hover .sc-actions { opacity:1; }
        .sc-actions { position:absolute; top:-6px; right:12px; background:#fff; border:1px solid #E5E7EB; border-radius:8px; display:flex; gap:2px; padding:3px; opacity:0; transition:opacity .1s; box-shadow:0 2px 8px rgba(0,0,0,.08); }
        .sc-act { width:28px; height:28px; border-radius:6px; background:none; border:none; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; }
        .sc-act:hover { background:#EDE9FE; }
        .sc-react { display:inline-flex; align-items:center; gap:4px; background:#EDE9FE; border:1px solid #DDD6FE; border-radius:99px; padding:2px 8px; font-size:13px; cursor:pointer; transition:.1s; user-select:none; }
        .sc-react:hover { background:#DDD6FE; }
        .sc-react.mine { background:#DDD6FE; border-color:#7C3AED; }
        .sc-mem { display:flex; align-items:center; gap:10px; padding:5px 12px; border-radius:6px; margin:1px 6px; cursor:pointer; transition:.1s; }
        .sc-mem:hover { background:#EDEBFF; }
        .sc-hbtn { width:32px; height:32px; border-radius:8px; background:none; border:none; color:#6B7280; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; }
        .sc-hbtn:hover { background:#F3F4F6; }
        .sc-dot { width:9px; height:9px; border-radius:50%; position:absolute; bottom:0; right:0; border:2px solid #F8F7FF; }
        @keyframes sc-bounce { 0%,80%,100%{transform:translateY(0);opacity:.5} 40%{transform:translateY(-4px);opacity:1} }
        .sc-tdot { width:5px; height:5px; border-radius:50%; background:#A78BFA; display:block; animation:sc-bounce 1.2s infinite; }
        @media (max-width:980px){ .sc-srv-bar, .sc-right { display:none !important; } }
      `}</style>

      {/* Server sidebar */}
      <div className="sc-srv-bar" style={{ width: 72, background: '#1E1B4B', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 8, flexShrink: 0 }}>
        <div className="sc-srv active" style={{ background: '#7C3AED', fontSize: 20 }} title="VOCA Community">V</div>
        <div style={{ width: 32, height: 2, background: '#312E81', borderRadius: 1 }} />
        <div className="sc-srv" style={{ background: '#1D9E75', fontSize: 13 }} onClick={() => showToast('HSK сурах бүлэг')} title="HSK">HSK</div>
        <div className="sc-srv" style={{ background: '#E85D24', fontSize: 18, borderRadius: 14 }} onClick={() => showToast('Дуут суваг')} title="Дуу">🔊</div>
        <div style={{ width: 32, height: 2, background: '#312E81', borderRadius: 1 }} />
        <div className="sc-srv" style={{ background: '#312E81', color: '#10B981', fontSize: 24 }} onClick={() => showToast('Сервер нэмэх удахгүй')} title="Нэмэх">+</div>
      </div>

      {/* Channel panel */}
      <div style={{ width: 232, background: '#2E2A72', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: 16, borderBottom: '1px solid #1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>VOCA Community</h2>
            <div style={{ fontSize: 11, color: '#10B981', fontWeight: 500 }}>● 128 идэвхтэй</div>
          </div>
          <span style={{ color: '#A78BFA' }}>⌄</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8B85C1', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 16px 4px', display: 'flex', justifyContent: 'space-between' }}>
            ХЭЛНИЙ СУВГУУД <span style={{ cursor: 'pointer' }} onClick={() => showToast('Суваг нэмэх удахгүй')}>+</span>
          </div>
          {CHANNELS.map(c => (
            <div key={c.id} className={`sc-ch ${channel === c.id ? 'active' : ''}`}
              onClick={() => { setChannel(c.id); setVisited(v => new Set(v).add(c.id)); }}>
              <span style={{ fontSize: 16, opacity: 0.7 }}>#</span>
              <span style={{ flex: 1 }}>{c.label}</span>
              {c.unread > 0 && !visited.has(c.id) && (
                <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{c.unread}</span>
              )}
            </div>
          ))}

          <div style={{ fontSize: 10, fontWeight: 700, color: '#8B85C1', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 16px 4px' }}>ДУУТ СУВГУУД</div>
          <div className="sc-vc" onClick={() => showToast('Дуут суваг нэгдлээ 🎤')}><span>🔊</span><span>Яриа дасгал 1</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, margin: '2px 0 2px 36px' }}>
            {['Ганбаяр', 'Мөнхзул'].map(n => (
              <div key={n} style={{ fontSize: 12, color: '#8B85C1', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />{n}
              </div>
            ))}
          </div>
          <div className="sc-vc" onClick={() => showToast('Дуут суваг нэгдлээ 🎤')}><span>🔊</span><span>Яриа дасгал 2</span></div>
        </div>

        {/* User panel */}
        <div style={{ padding: '10px 12px', background: '#1E1B4B', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: me.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{me.initials}</div>
            <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid #1E1B4B' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me.name}</div>
            <div style={{ fontSize: 11, color: '#8B85C1' }}>● Онлайн</div>
          </div>
          <button className="sc-act" style={{ color: '#8B85C1' }} onClick={() => showToast('Тохиргоо удахгүй')}>⚙️</button>
        </div>
      </div>

      {/* Main chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0 }}>
        <div style={{ height: 52, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 20, color: '#A78BFA' }}>#</span>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E1B4B' }}>{ch?.label}</h3>
          <span style={{ fontSize: 13, color: '#9CA3AF', borderLeft: '1px solid #E5E7EB', paddingLeft: 12, marginLeft: 4 }}>{ch?.desc}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button className="sc-hbtn" onClick={() => showToast('Хайлт удахгүй')}>🔍</button>
            <button className="sc-hbtn" onClick={() => showToast('Мэдэгдэл тохируулагдлаа')}>🔔</button>
            <button className="sc-hbtn" onClick={() => showToast('Гишүүдийн жагсаалт')}>👥</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 8px' }}>
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', borderRadius: 12, padding: '20px 24px', color: '#fff' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>👋 #{ch?.label} дотор тавтай морил!</h2>
              <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>Энэ бол VOCA нийгэмлэгийн суваг. Хятад хэлний асуулт, дасгал, санаа бодлоо хуваалцаарай.</p>
            </div>
          </div>

          {msgs.map(m => (
            <div key={m.id} className="sc-msg">
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2 }}>{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E1B4B', cursor: m.mine ? 'default' : 'pointer' }}
                    onClick={() => !m.mine && openDM({ name: m.user, color: m.color, initials: m.initials })}>{m.user}</span>
                  {m.badge && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99, ...badgeStyle[m.badge.c] }}>{m.badge.t}</span>}
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#374151', wordBreak: 'break-word' }}>{m.text}</div>
                {m.embed && (
                  <div style={{ marginTop: 8, background: '#F8F7FF', border: '1px solid #E5E7EB', borderLeft: '3px solid #7C3AED', borderRadius: '0 8px 8px 0', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, maxWidth: 380 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B', marginBottom: 3 }}>{m.embed.title}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{m.embed.meta}</div>
                    </div>
                    <button onClick={() => showToast('HSK бүлэгт нэгдлээ! +50 XP')} style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{m.embed.action}</button>
                  </div>
                )}
                {m.reactions.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {m.reactions.map((r, i) => (
                      <div key={i} className={`sc-react ${r.mine ? 'mine' : ''}`} onClick={() => toggleReaction(m.id, i)}>
                        {r.e} <span style={{ fontSize: 12, color: '#5B21B6', fontWeight: 500 }}>{r.n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="sc-actions">
                <button className="sc-act" onClick={() => addReaction(m.id)} title="Реакц">😊</button>
                <button className="sc-act" onClick={() => { setInput(`@${m.user} `); inputRef.current?.focus(); }} title="Хариу">↩️</button>
                <button className="sc-act" onClick={() => showToast('Мессеж хадгалагдлаа')} title="Хадгалах">🔖</button>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Typing */}
        <div style={{ padding: '4px 16px 6px', fontSize: 12, color: '#6B7280', minHeight: 22, display: 'flex', alignItems: 'center', gap: 6, visibility: typing ? 'visible' : 'hidden' }}>
          <span style={{ display: 'flex', gap: 3 }}><span className="sc-tdot" /><span className="sc-tdot" style={{ animationDelay: '.2s' }} /><span className="sc-tdot" style={{ animationDelay: '.4s' }} /></span>
          {typing}
        </div>

        {/* Input */}
        <div style={{ padding: '0 16px 16px', flexShrink: 0, position: 'relative' }}>
          {emojiOpen && (
            <div style={{ position: 'absolute', bottom: 64, left: 16, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 4, width: 230, boxShadow: '0 4px 20px rgba(0,0,0,.12)', zIndex: 50 }}>
              {EMOJIS.map(e => (
                <span key={e} onClick={() => { setInput(v => v + e); inputRef.current?.focus(); setEmoji(false); }}
                  style={{ fontSize: 22, cursor: 'pointer', padding: 4, borderRadius: 6 }}>{e}</span>
              ))}
            </div>
          )}
          <div style={{ background: '#F3F4F6', borderRadius: 12, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px' }}>
            <button onClick={() => setEmoji(o => !o)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'none', border: 'none', color: '#7C3AED', fontSize: 20, cursor: 'pointer', flexShrink: 0 }}>😊</button>
            <textarea ref={inputRef} rows={1} value={input} placeholder={`#${ch?.label} дотор мессеж бичих...`}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: '#1E1B4B', resize: 'none', maxHeight: 120, lineHeight: 1.5 }} />
            <button onClick={() => showToast('Файл хавсаргах удахгүй')} style={{ width: 30, height: 30, borderRadius: '50%', background: 'none', border: 'none', color: '#9CA3AF', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>📎</button>
            <button onClick={send} style={{ width: 32, height: 32, borderRadius: '50%', background: '#7C3AED', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>➤</button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="sc-right" style={{ width: 240, background: '#F8F7FF', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #E5E7EB' }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Идэвхтэй одоо <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>128</span>
          </h4>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', padding: '10px 16px 4px' }}>Онлайн — {MEMBERS_ONLINE.length}</div>
          {MEMBERS_ONLINE.map(m => (
            <div key={m.name} className="sc-mem" onClick={() => openDM(m)}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{m.initials}</div>
                <span className="sc-dot" style={{ background: m.status === 'busy' ? '#F59E0B' : '#10B981' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1E1B4B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.sub}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', padding: '10px 16px 4px' }}>Оффлайн — 124</div>
          {MEMBERS_OFFLINE.map(m => (
            <div key={m.name} className="sc-mem">
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{m.initials}</div>
                <span className="sc-dot" style={{ background: '#9CA3AF' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: 8 }}>📊 Өнөөдрийн идэвх</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
            {[[msgCount, 'Мессеж'], [128, 'Идэвхтэй'], [12, 'Шинэ']].map(([n, l], i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#7C3AED' }}>{n}</div>
                <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: 6 }}>🏆 Топ гишүүд</div>
          {TOP.map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{t.rank}</span>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{t.initials}</div>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: '#1E1B4B' }}>{t.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED' }}>{t.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* DM Panel */}
      {dm && (
        <div onClick={e => { if (e.target === e.currentTarget) setDm(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: 460, maxWidth: '92vw', maxHeight: 560, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: dm.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{dm.initials}</div>
              <h3 style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#1E1B4B' }}>{dm.name}</h3>
              <button className="sc-hbtn" onClick={() => setDm(null)}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dmMsgs.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, flexDirection: d.mine ? 'row-reverse' : 'row' }}>
                  {!d.mine && <div style={{ width: 28, height: 28, borderRadius: '50%', background: dm.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{dm.initials}</div>}
                  <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: 16, fontSize: 13, lineHeight: 1.5,
                    background: d.mine ? '#7C3AED' : '#F3F4F6', color: d.mine ? '#fff' : '#1E1B4B',
                    borderBottomRightRadius: d.mine ? 4 : 16, borderBottomLeftRadius: d.mine ? 16 : 4 }}>{d.text}</div>
                </div>
              ))}
              <div ref={dmBottomRef} />
            </div>
            <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
              <input value={dmInput} onChange={e => setDmInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendDM(); }}
                placeholder="Мессеж бичих..." style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 12px', fontFamily: 'inherit', fontSize: 13, outline: 'none' }} />
              <button onClick={sendDM} style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Илгээх</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 80}px)`, opacity: toast ? 1 : 0, background: '#1E1B4B', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, transition: 'all .3s cubic-bezier(.34,1.56,.64,1)', zIndex: 999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>{toast}</div>

      {/* Streak popup */}
      <div style={{ position: 'fixed', top: 20, right: 20, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.12)', transform: `translateX(${streak ? 0 : 140}%)`, transition: 'transform .4s cubic-bezier(.34,1.56,.64,1)', zIndex: 999 }}>
        <div style={{ fontSize: 28 }}>🔥</div>
        <div>
          <strong style={{ fontSize: 14, display: 'block', color: '#1E1B4B' }}>+10 XP олсон!</strong>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Мессеж илгээсний шагнал</span>
        </div>
      </div>
    </div>
  );
}
