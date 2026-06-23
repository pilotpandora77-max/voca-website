'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const HSK_LEVELS = [
  { level: 1, words: 150, gradient: 'linear-gradient(135deg, #22C55E, #16A34A)', glow: 'rgba(34,197,94,0.35)', label: 'Эхлэгч' },
  { level: 2, words: 150, gradient: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', glow: 'rgba(56,189,248,0.35)', label: 'Суурь' },
  { level: 3, words: 300, gradient: 'linear-gradient(135deg, #9B6DFF, #7B4FE0)', glow: 'rgba(155,109,255,0.35)', label: 'Дунд' },
  { level: 4, locked: true, label: 'Дунд+' },
  { level: 5, locked: true, label: 'Ахисан' },
  { level: 6, locked: true, label: 'Мэргэжлийн' },
];

const QUALITY = [
  { q: 1, label: 'Дахин', icon: '↩', color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  { q: 3, label: 'Хэцүү', icon: '😅', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  { q: 5, label: 'Амархан', icon: '⚡', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
];

export default function HomePage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  const [streak, setStreak]     = useState(0);
  const [dueCards, setDue]      = useState([]);
  const [current, setCurrent]   = useState(null);
  const [showBack, setShowBack] = useState(false);
  const [news, setNews]         = useState([]);
  const [leaderboard, setLB]    = useState([]);
  const [tab, setTab]           = useState('news');
  const [loading, setLoading]   = useState(true);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user]);

  async function load() {
    setLoading(true);
    try {
      const [s, cards, n] = await Promise.all([
        api.get('/api/streak'), api.get('/api/cards/due'), api.get('/api/news'),
      ]);
      setStreak(s.data.streak || 0);
      setDue(cards.data);
      setCurrent(cards.data[0] || null);
      setNews(n.data);
    } catch {}
    setLoading(false);
  }

  async function loadLB() {
    try {
      const { data } = await api.get('/api/stats/leaderboard');
      setLB(data);
    } catch {}
  }

  function switchTab(t) {
    setTab(t);
    if (t === 'rank' && leaderboard.length === 0) loadLB();
  }

  function revealBack() {
    setFlipping(true);
    setTimeout(() => { setShowBack(true); setFlipping(false); }, 150);
  }

  async function review(quality) {
    if (!current) return;
    try {
      await api.patch(`/api/cards/${current.id}/review`, { quality });
      try { await api.post('/api/streak/checkin'); } catch {}
      const rest = dueCards.filter(c => c.id !== current.id);
      setDue(rest);
      setCurrent(rest[0] || null);
      setShowBack(false);
    } catch {}
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return null;

  const doneCount = Math.max(0, (dueCards.findIndex(c => c?.id === current?.id)));
  const totalDue  = dueCards.length;
  const progress  = totalDue > 0 ? doneCount / totalDue : 1;

  return (
    <div style={{ padding: '28px 28px 40px', maxWidth: 860, margin: '0 auto' }} className="anim-up">

      {/* ── Top Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.5 }}>
            Сайн байна уу, {user.username} 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 3, fontWeight: 500 }}>
            Өнөөдөр ч хичээллэцгээе
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.28)',
          borderRadius: 100, padding: '8px 16px',
          animation: 'streak-pulse 2s ease infinite',
        }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>{streak}</span>
          <span style={{ fontSize: 12, color: 'rgba(245,158,11,0.7)', fontWeight: 600 }}>өдөр</span>
        </div>
      </div>

      {/* ── Two column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>

        {/* Left — Flashcard */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#EDE9FF' }}>
              📚 Өнөөдрийн давталт
            </h2>
            {totalDue > 0 && (
              <span style={{
                background: 'rgba(155,109,255,0.15)', border: '1px solid rgba(155,109,255,0.3)',
                color: '#C4AAFF', borderRadius: 100, padding: '3px 12px',
                fontSize: 12, fontWeight: 800,
              }}>
                {doneCount}/{totalDue} карт
              </span>
            )}
          </div>

          {current ? (
            <div className="card" style={{ border: '1px solid rgba(155,109,255,0.2)' }}>
              {/* Progress bar */}
              <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden', marginBottom: 22 }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #9B6DFF, #FF6B9D)',
                  borderRadius: 10,
                  width: `${Math.max(progress * 100, 4)}%`,
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 8px rgba(155,109,255,0.5)',
                }} />
              </div>

              {/* Card face */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(155,109,255,0.08), rgba(255,107,157,0.05))',
                borderRadius: 16,
                border: '1px solid rgba(155,109,255,0.15)',
                padding: '36px 20px',
                textAlign: 'center',
                marginBottom: 18,
                minHeight: 170,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'opacity 0.15s',
                opacity: flipping ? 0 : 1,
              }}>
                <span style={{
                  fontSize: 84, fontWeight: 900, lineHeight: 1,
                  background: 'linear-gradient(135deg, #EDE9FF, #C4AAFF)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {current.front}
                </span>
                {current.hint && (
                  <span style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 600 }}>
                    {current.hint}
                  </span>
                )}
              </div>

              {!showBack ? (
                <button className="btn btn-purple" onClick={revealBack} style={{ width: '100%', padding: '13px 22px', fontSize: 14 }}>
                  Хариулт харах
                </button>
              ) : (
                <div className="anim-scale">
                  <div style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.28)',
                    borderRadius: 14, padding: '14px 20px',
                    textAlign: 'center', marginBottom: 14,
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#22C55E' }}>
                      {current.back}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textAlign: 'center', marginBottom: 10, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    Хэр сайн санасан бэ?
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {QUALITY.map(({ q, label, icon, color, bg, border }) => (
                      <button key={q} onClick={() => review(q)} style={{
                        flex: 1, borderRadius: 12, border: `1.5px solid ${border}`,
                        background: bg, color, fontWeight: 800, fontSize: 13,
                        padding: '12px 8px', cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                      >
                        <span style={{ fontSize: 16, display: 'block', marginBottom: 2 }}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{
              textAlign: 'center', padding: '44px 24px',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.04))',
              border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <div style={{ fontSize: 56, marginBottom: 12, animation: 'float 3s ease infinite' }}>🎉</div>
              <h3 style={{ fontWeight: 900, fontSize: 20, color: '#22C55E', marginBottom: 6 }}>Маш сайн!</h3>
              <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14, marginBottom: 20 }}>
                Өнөөдрийн давталт бүрэн дууслаа
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 100, padding: '8px 18px',
              }}>
                <span>⭐</span>
                <span style={{ color: '#F59E0B', fontWeight: 900 }}>+10 XP</span>
              </div>
            </div>
          )}
        </div>

        {/* Right — News / Leaderboard */}
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[['news', '📣', 'Мэдээ'], ['rank', '🏆', 'Эрэмбэ']].map(([t, icon, label]) => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: '8px 10px', borderRadius: 11, fontWeight: 700, fontSize: 12.5,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                background: tab === t ? 'rgba(155,109,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${tab === t ? 'rgba(155,109,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: tab === t ? '#C4AAFF' : 'var(--muted)',
              }}>
                {icon} {label}
              </button>
            ))}
          </div>

          <div className="card" style={{ minHeight: 280, padding: 0, overflow: 'hidden' }}>
            {tab === 'news' && (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {news.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>
                    Одоогоор мэдээ байхгүй
                  </div>
                ) : news.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', gap: 12, padding: '12px',
                    background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{
                      width: 4, borderRadius: 4, flexShrink: 0,
                      background: item.color || '#9B6DFF',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{item.emoji}</div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#EDE9FF', marginBottom: 3 }}>{item.title}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'rank' && (
              <div>
                {leaderboard.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>
                    Өгөгдөл байхгүй
                  </div>
                ) : leaderboard.map((entry, idx) => {
                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                  const isMe  = entry.id === user.id;
                  return (
                    <div key={entry.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isMe ? 'rgba(155,109,255,0.08)' : 'transparent',
                    }}>
                      <span style={{ width: 22, fontSize: 14, fontWeight: 800, color: 'var(--muted)', textAlign: 'center' }}>
                        {medal || `${idx + 1}`}
                      </span>
                      <span style={{ fontSize: 20 }}>{entry.avatarEmoji || entry.username?.[0]}</span>
                      <span style={{ fontWeight: 700, flex: 1, fontSize: 13, color: isMe ? '#C4AAFF' : '#EDE9FF' }}>
                        {entry.username}
                      </span>
                      <span style={{ fontWeight: 900, color: '#F59E0B', fontSize: 13 }}>{entry.xp} XP</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HSK Levels ── */}
      <h2 style={{ fontSize: 15, fontWeight: 800, color: '#EDE9FF', marginBottom: 14 }}>
        📖 HSK Хичээл
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {HSK_LEVELS.map(item =>
          item.locked ? (
            <div key={item.level} style={{
              borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)', padding: '18px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>🔒</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>HSK {item.level}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, opacity: 0.6 }}>{item.label}</div>
            </div>
          ) : (
            <Link key={item.level} href={`/grammar/hsk/${item.level}`} style={{
              borderRadius: 18, padding: '18px 14px', textAlign: 'center',
              textDecoration: 'none', display: 'block',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              transition: 'all 0.18s',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = item.glow ? `0 8px 28px ${item.glow}` : ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: 1,
                background: item.gradient, WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                marginBottom: 2,
              }}>HSK</div>
              <div style={{
                fontSize: 42, fontWeight: 900, lineHeight: 1.1,
                background: item.gradient, WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {item.level}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>
                {item.words} үг
              </div>
              <div style={{
                borderRadius: 8, padding: '7px 0', fontSize: 11, fontWeight: 800,
                background: item.gradient, color: '#fff',
              }}>
                Үзэх
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
