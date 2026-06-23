'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Mascot from '@/components/Mascot';

const WORD_OF_DAY = { zh: '你好', pinyin: 'nǐ hǎo', mn: 'Сайн уу / Тавтай морил' };

const DAILY_GOALS = [
  { icon: '🔥', title: 'Өдрийн чек-ин', desc: 'Өнөөдөр апп-д нэвтэрч ор.', xp: 10, key: 'checkin', total: 1 },
  { icon: '🃏', title: '5 карт давтах', desc: '5 давтах карт гүйцэтгэ.', xp: 20, key: 'reviews', total: 5 },
  { icon: '✏️', title: 'Шинэ үг нэмэх', desc: 'Шинэ 1 үг нэм.', xp: 15, key: 'words', total: 1 },
];

const QUICK_ACTIONS = [
  { icon: '🃏', label: 'Давтах', sub: 'Карт давтах', href: '/vocab/practice', color: '#7C3AED', bg: '#EDE9FF' },
  { icon: '🎮', label: 'Тоглоом', sub: 'Суралцаж тоглоё', href: '/reel', color: '#10B981', bg: '#ECFDF5' },
  { icon: '🎓', label: 'Хичээл', sub: 'Сэдвээр суралцах', href: '/grammar', color: '#3B82F6', bg: '#EFF6FF' },
  { icon: '📖', label: 'Толь', sub: 'Хайх & олох', href: '/dictionary', color: '#F59E0B', bg: '#FEF3C7' },
];

function getLevel(xp = 0) {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  const lvlXp = thresholds[Math.min(level - 1, thresholds.length - 1)];
  const nextXp = thresholds[Math.min(level, thresholds.length - 1)] || lvlXp + 200;
  return { level, current: xp - lvlXp, needed: nextXp - lvlXp };
}

export default function HomePage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  const [streak, setStreak]       = useState(0);
  const [dueCards, setDue]        = useState([]);
  const [current, setCurrent]     = useState(null);
  const [showBack, setShowBack]   = useState(false);
  const [stats, setStats]         = useState(null);
  const [news, setNews]           = useState([]);
  const [leaderboard, setLB]      = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user]);

  async function load() {
    setLoading(true);
    try {
      const [s, cards, st, lb] = await Promise.all([
        api.get('/api/streak'),
        api.get('/api/cards/due'),
        api.get('/api/stats').catch(() => ({ data: {} })),
        api.get('/api/stats/leaderboard').catch(() => ({ data: [] })),
      ]);
      setStreak(s.data.streak || 0);
      setDue(cards.data);
      setCurrent(cards.data[0] || null);
      setStats(st.data);
      setLB(lb.data.slice(0, 5));
    } catch {}
    setLoading(false);
  }

  async function addWordToVocab() {
    try {
      await api.post('/api/words', { front: WORD_OF_DAY.zh, back: WORD_OF_DAY.mn, hint: WORD_OF_DAY.pinyin });
      alert('Үгийн санд нэмэгдлэ! ✅');
    } catch {}
  }

  async function review(quality) {
    if (!current) return;
    try {
      await api.patch(`/api/cards/${current.id}/review`, { quality });
      try { await api.post('/api/streak/checkin'); } catch {}
      const rest = dueCards.filter(c => c.id !== current.id);
      setDue(rest); setCurrent(rest[0] || null); setShowBack(false);
    } catch {}
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return null;

  const lvl = getLevel(stats?.xp || 0);
  const progress = Math.min((lvl.current / lvl.needed) * 100, 100);

  const goalProgress = {
    checkin: 1,
    reviews: Math.min(stats?.reviewCount || 0, 5),
    words: Math.min(stats?.wordCount || 0, 1),
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      <PageHeader
        title={`Сайн уу, ${user.username} 👋`}
        subtitle="Өнөөдөр шинэ үгс сурч, өөрийгөө хөгжүүлэ!"
        streak={streak}
      />

      <div style={{ padding: '0 28px' }}>

        {/* ── Row 1: Level card + Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Level card */}
          <div style={{
            gridColumn: '1', gridRow: '1 / 3',
            background: 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
            borderRadius: 20, padding: 22, position: 'relative', overflow: 'hidden',
            minHeight: 200,
          }}>
            <div style={{ position: 'absolute', bottom: -6, right: -4, opacity: 0.12, userSelect: 'none' }}>
              <Mascot size={170} />
            </div>
            <Mascot size={110} style={{
              position: 'absolute', bottom: -4, right: 6,
              filter: 'drop-shadow(0 6px 18px rgba(76,29,149,0.45))',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.75)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                Таны түвшин
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', marginBottom: 14 }}>
                Level {lvl.level}
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#fff', borderRadius: 8, width: `${progress}%`, transition: 'width 0.6s' }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                {lvl.current} / {lvl.needed} XP
              </div>
            </div>
          </div>

          {/* Сурсан үг */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>📚</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{stats?.wordCount || 0}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>сурсан үг</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/vocab" style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--purple-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--purple)', fontWeight: 900, fontSize: 16, textDecoration: 'none',
              }}>→</Link>
            </div>
          </div>

          {/* Давтах карт */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>✅</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{dueCards.length}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>давтах карт</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/vocab/practice" style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--green-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--green)', fontWeight: 900, fontSize: 16, textDecoration: 'none',
              }}>→</Link>
            </div>
          </div>

          {/* XP stat */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>⭐</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{stats?.xp || 0}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>нийт XP</div>
            </div>
            <Link href="/social" style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>
              Өнөөдөр давт →
            </Link>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.href} href={a.href} style={{
              textDecoration: 'none', background: '#fff', border: '1.5px solid var(--border)',
              borderRadius: 16, padding: '16px 14px', textAlign: 'center',
              transition: 'all 0.15s', display: 'block',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = a.color + '66'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${a.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: a.bg, margin: '0 auto 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {a.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{a.sub}</div>
            </Link>
          ))}
        </div>

        {/* ── Row 3: Daily Goals + Right Panel ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

          {/* Daily Goals */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>🎯 Өдрийн зорилт</h2>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>
                {Object.values(goalProgress).filter((v, i) => v >= DAILY_GOALS[i]?.total).length}/{DAILY_GOALS.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DAILY_GOALS.map(g => {
                const done = goalProgress[g.key];
                const pct  = Math.min((done / g.total) * 100, 100);
                const isDone = done >= g.total;
                return (
                  <div key={g.key} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px',
                    background: isDone ? 'var(--green-light)' : 'var(--bg-alt)',
                    borderRadius: 14, border: `1.5px solid ${isDone ? '#10B98133' : 'var(--border)'}`,
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: isDone ? 'var(--green-bg)' : '#fff',
                      border: `1.5px solid ${isDone ? '#10B98144' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>
                      {g.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{g.title}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 800, color: isDone ? 'var(--green)' : 'var(--purple)',
                          background: isDone ? 'var(--green-bg)' : 'var(--purple-light)',
                          padding: '2px 8px', borderRadius: 100,
                        }}>+{g.xp} XP</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>{g.desc}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: isDone ? 'var(--green)' : 'var(--purple)', borderRadius: 4, width: `${pct}%`, transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>{done}/{g.total}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Word of day + Leaderboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Word of day */}
            <div style={{
              background: 'linear-gradient(145deg, #7C3AED, #6D28D9)',
              borderRadius: 20, padding: 22, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', fontSize: 80, opacity: 0.15, userSelect: 'none' }}>你好!</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>✨ ӨНӨӨДРИЙН ҮГ</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: '#fff', marginBottom: 4, lineHeight: 1 }}>{WORD_OF_DAY.zh}</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 4 }}>{WORD_OF_DAY.pinyin}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>{WORD_OF_DAY.mn}</div>
              <button onClick={addWordToVocab} style={{
                background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)',
                color: '#fff', borderRadius: 10, padding: '8px 16px',
                fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                📌 Үгийг хадгалах
              </button>
            </div>

            {/* Leaderboard */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>🏆 Эрэмбэ</h3>
                <Link href="/social" style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>
                  Бүгд харах →
                </Link>
              </div>
              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Өгөгдөл байхгүй</p>
              ) : leaderboard.map((entry, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                const isMe = entry.id === user.id;
                return (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                    borderRadius: 12, marginBottom: 4,
                    background: isMe ? 'var(--purple-light)' : 'transparent',
                  }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{medal || `${idx + 1}`}</span>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', fontSize: 15,
                      background: isMe ? 'var(--purple)' : 'var(--bg-alt)',
                      border: `1.5px solid ${isMe ? 'var(--purple)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isMe ? '#fff' : 'var(--text)',
                    }}>
                      {entry.avatarEmoji || entry.username?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 700, flex: 1, fontSize: 13, color: isMe ? 'var(--purple)' : 'var(--text)' }}>
                      {entry.username}{isMe ? ' (та)' : ''}
                    </span>
                    <span style={{ fontWeight: 900, color: isMe ? 'var(--purple)' : 'var(--text-sub)', fontSize: 13 }}>
                      {entry.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
