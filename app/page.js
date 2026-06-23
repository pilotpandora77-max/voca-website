'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const HSK_LEVELS = [
  { level: 1, words: 150, color: '#58CC02', bg: '#EDFFD7', shadow: '#46A800' },
  { level: 2, words: 150, color: '#1CB0F6', bg: '#DFF4FF', shadow: '#0099D4' },
  { level: 3, words: 300, color: '#CE82FF', bg: '#F4F0FF', shadow: '#A560E8' },
  { level: 4, locked: true },
  { level: 5, locked: true },
  { level: 6, locked: true },
];

const QUALITY = [
  { q: 1, label: 'ДАХИН',   color: '#FF4B4B', bg: '#FFE0E0', border: '#FF4B4B' },
  { q: 3, label: 'ХЭЦҮҮ',   color: '#FF9600', bg: '#FFF0C0', border: '#FF9600' },
  { q: 5, label: 'АМАРХАН', color: '#58CC02', bg: '#EDFFD7', border: '#58CC02' },
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ fontSize: 40 }}>⏳</div>
    </div>
  );

  if (!user) return null;

  const progress = dueCards.length > 0 && current
    ? dueCards.findIndex(c => c.id === current.id) / dueCards.length
    : 1;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#FFF0C0', border: '2px solid #FF9600',
          borderRadius: 20, padding: '6px 14px',
        }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#FF9600' }}>{streak}</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>voca</h1>
      </div>

      {/* News / Leaderboard */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['news', 'rank'].map(t => (
            <button key={t} onClick={() => switchTab(t)} style={{
              padding: '7px 16px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer',
              background: tab === t ? 'var(--green-bg)' : 'var(--bg-alt)',
              border: `2px solid ${tab === t ? 'var(--green)' : 'var(--border)'}`,
              color: tab === t ? 'var(--green)' : 'var(--muted)',
            }}>
              {t === 'news' ? '📣 Мэдээ' : '🏆 Эрэмбэ'}
            </button>
          ))}
        </div>

        {tab === 'news' && (
          news.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontWeight: 600, padding: '8px 0' }}>Одоогоор мэдээ байхгүй</p>
          ) : (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {news.map(item => (
                <div key={item.id} style={{
                  minWidth: 200, maxWidth: 200, borderRadius: 16, border: `2px solid ${item.color}`,
                  display: 'flex', overflow: 'hidden', flexShrink: 0,
                }}>
                  <div style={{ width: 6, background: item.color }} />
                  <div style={{ padding: 12, flex: 1 }}>
                    <div style={{ fontSize: 20 }}>{item.emoji}</div>
                    <div style={{ fontWeight: 900, fontSize: 13, marginTop: 4 }}>{item.title}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'rank' && (
          leaderboard.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Өгөгдөл байхгүй</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden', border: '2px solid var(--border)' }}>
              {leaderboard.map((entry, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                const isMe  = entry.id === user.id;
                return (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: isMe ? 'var(--green-bg)' : 'transparent',
                  }}>
                    <span style={{ width: 28, fontWeight: 900, color: 'var(--muted)', textAlign: 'center' }}>
                      {medal || `${idx + 1}.`}
                    </span>
                    <span style={{ fontSize: 22 }}>{entry.avatarEmoji || entry.username?.[0]}</span>
                    <span style={{ fontWeight: 800, flex: 1, color: isMe ? 'var(--green)' : 'var(--text)' }}>
                      {isMe ? '👤 ' : ''}{entry.username}
                    </span>
                    <span style={{ fontWeight: 900, color: '#FF9600' }}>{entry.xp} XP</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>🔥 {entry.streak}</span>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Flashcard session */}
      <h2 style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
        {dueCards.length > 0 ? `📚 ${dueCards.length} карт давтах хэрэгтэй` : '📚 Давталт'}
      </h2>

      {current ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ height: 10, background: 'var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ height: '100%', background: 'var(--green)', borderRadius: 10,
              width: `${Math.max(progress * 100, 4)}%`, transition: 'width 0.3s' }} />
          </div>

          <div style={{
            background: 'var(--bg-alt)', borderRadius: 16, border: '2px solid var(--border)',
            padding: '40px 20px', textAlign: 'center', marginBottom: 20, minHeight: 160,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 80, fontWeight: 900, lineHeight: 1 }}>{current.front}</span>
            {current.hint && <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{current.hint}</span>}
          </div>

          {!showBack ? (
            <button className="btn btn-blue" onClick={() => setShowBack(true)} style={{ width: '100%' }}>
              ХАРИУЛТ ХАРАХ
            </button>
          ) : (
            <div>
              <div style={{
                background: 'var(--green-bg)', border: '2px solid var(--green)', borderRadius: 14,
                padding: 16, textAlign: 'center', marginBottom: 16,
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{current.back}</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textAlign: 'center', marginBottom: 10, letterSpacing: 0.8 }}>
                ХЭР САЙН САНАСАН БЭ?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {QUALITY.map(({ q, label, color, bg, border }) => (
                  <button key={q} onClick={() => review(q)} style={{
                    flex: 1, borderRadius: 14, border: `2.5px solid ${border}`,
                    background: bg, color, fontWeight: 900, fontSize: 13,
                    padding: 12, cursor: 'pointer', letterSpacing: 0.4,
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{
          marginBottom: 24, textAlign: 'center', padding: 40,
          background: 'var(--green-bg)', border: '2px solid var(--green)',
        }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontWeight: 900, fontSize: 22, color: 'var(--green)', marginBottom: 6 }}>Маш сайн!</h3>
          <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Өнөөдрийн давталт бүрэн дууслаа</p>
          <div style={{
            display: 'inline-block', marginTop: 16, background: '#FF9600', borderRadius: 20,
            padding: '8px 20px', borderBottom: '3px solid #CC7800',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>+10 XP</span>
          </div>
        </div>
      )}

      {/* HSK Levels */}
      <h2 style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>📖 HSK хичээл</h2>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {HSK_LEVELS.map(item => (
          item.locked ? (
            <div key={item.level} style={{
              minWidth: 120, borderRadius: 20, border: '2px solid var(--border)',
              background: 'var(--bg-alt)', padding: 16, textAlign: 'center', flexShrink: 0,
            }}>
              <div style={{ fontSize: 28 }}>🔒</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--muted)', marginTop: 6 }}>HSK {item.level}</div>
            </div>
          ) : (
            <Link key={item.level} href={`/grammar/hsk/${item.level}`} style={{
              minWidth: 120, borderRadius: 20, border: `2px solid ${item.color}`,
              background: item.bg, padding: 16, textAlign: 'center',
              textDecoration: 'none', flexShrink: 0, display: 'block',
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: item.color, letterSpacing: 1 }}>HSK</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: item.color, lineHeight: 1.1 }}>{item.level}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: item.shadow, marginBottom: 8 }}>{item.words} үг</div>
              <div style={{
                background: item.color, borderRadius: 10, padding: '8px 0',
                borderBottom: `3px solid ${item.shadow}`, color: '#fff', fontWeight: 900, fontSize: 12,
              }}>📚 Үгс үзэх</div>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
