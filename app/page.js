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
  { icon: '🎮', label: 'Тоглоом', sub: 'Суралцаж тоглоё', href: '/games', color: '#10B981', bg: '#ECFDF5' },
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

        {/* ── Row 1: Hero level card (left) + 3 stat cards (right) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: 16, marginBottom: 16 }}>

          {/* ── Hero Level card ── */}
          <div style={{
            gridColumn: '1', gridRow: '1 / 3',
            background: 'radial-gradient(120% 130% at 75% 20%, #6D28D9 0%, #4C1D95 55%, #2E1065 100%)',
            borderRadius: 22, padding: '32px 34px', position: 'relative', overflow: 'hidden',
            minHeight: 280, boxShadow: '0 16px 40px rgba(76,29,149,0.32)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            {/* Star field */}
            <div className="hero-stars" />
            {/* Planets */}
            <div style={{ position: 'absolute', top: 24, right: 30, width: 64, height: 64, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #A78BFA, #6D28D9)', boxShadow: '0 0 28px rgba(167,139,250,0.5)', opacity: 0.85 }} />
            <div style={{ position: 'absolute', top: 38, right: 16, width: 92, height: 22, borderRadius: '50%', border: '3px solid rgba(196,181,253,0.4)', transform: 'rotate(-20deg)' }} />
            <div style={{ position: 'absolute', bottom: 30, right: 44, width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FCD34D, #F59E0B)', boxShadow: '0 0 18px rgba(252,211,77,0.5)', opacity: 0.8 }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
                Таны түвшин
              </div>
              <div style={{ fontSize: 92, fontWeight: 900, color: '#fff', marginBottom: 22, lineHeight: 0.95, letterSpacing: '-2px', textShadow: '0 6px 30px rgba(0,0,0,0.3)' }}>
                Level {lvl.level}
              </div>
              <div style={{ marginBottom: 10, maxWidth: '78%' }}>
                <div style={{ height: 13, background: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#FBBF24,#FCD34D)', borderRadius: 10, width: `${progress}%`, transition: 'width 0.6s', boxShadow: '0 0 14px rgba(251,191,36,0.6)' }} />
                </div>
              </div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 24 }}>
                {lvl.current} / {lvl.needed} XP
              </div>
              <Link href="/profile" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
                background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.3)',
                color: '#fff', borderRadius: 12, padding: '12px 22px', fontWeight: 800, fontSize: 14,
                backdropFilter: 'blur(6px)', transition: 'all 0.16s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.26)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; }}
              >
                Түвшин харах →
              </Link>
            </div>
          </div>

          {/* ── Сурсан үг ── */}
          <Link href="/vocab" className="stat-card" style={{ gridColumn: '2', gridRow: '1' }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(145deg,#EDE9FF,#DDD6FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📚</div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{stats?.wordCount || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginTop: 4 }}>СУРСАН ҮГ</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 800, marginTop: 'auto', paddingTop: 12 }}>
              Өнөөдөр +{Math.min(stats?.wordCount || 0, 9) || 0} →
            </div>
          </Link>

          {/* ── Даалгавар гүйцэтгэсэн ── */}
          <Link href="/vocab/practice" className="stat-card" style={{ gridColumn: '3', gridRow: '1' }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(145deg,#D1FAE5,#A7F3D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✅</div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{stats?.reviewCount || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginTop: 4 }}>ДААЛГАВАР ГҮЙЦЭТГЭСЭН</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 800, marginTop: 'auto', paddingTop: 12 }}>
              Өнөөдөр давт →
            </div>
          </Link>

          {/* ── Давтах карт (wide, row 2) ── */}
          <Link href="/vocab/practice" className="stat-card" style={{
            gridColumn: '2 / 4', gridRow: '2', flexDirection: 'row', alignItems: 'center', gap: 18,
            background: 'linear-gradient(120deg,#FFF7ED,#FFFBEB)',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(145deg,#FEF3C7,#FDE68A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🔥</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{dueCards.length}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>ДАВТАХ КАРТ</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 800, marginTop: 6 }}>Өнөөдөр давт →</div>
            </div>
            <div style={{ fontSize: 40, opacity: 0.9, flexShrink: 0 }}>🃏</div>
          </Link>
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
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              borderRadius: 20, padding: '20px 22px', position: 'relative', overflow: 'hidden',
            }}>
              {/* Mascot on right with speech bubble */}
              <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
                <Mascot size={100} showSpeech style={{ display: 'block' }} />
              </div>
              {/* World map faint bg */}
              <div style={{ position: 'absolute', right: 90, top: '50%', transform: 'translateY(-50%)', fontSize: 80, opacity: 0.06, userSelect: 'none' }}>🌏</div>

              <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>✨ ӨНӨӨДРИЙН ҮГ</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 3, lineHeight: 1 }}>{WORD_OF_DAY.zh}</div>
                <div style={{ fontSize: 15, color: '#C4B5FD', fontWeight: 700, marginBottom: 3 }}>{WORD_OF_DAY.pinyin}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 14 }}>{WORD_OF_DAY.mn}</div>
                <button onClick={addWordToVocab} style={{
                  background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)',
                  color: '#fff', borderRadius: 10, padding: '8px 14px',
                  fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  📌 Үгийг хадгалах
                </button>
              </div>
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

        {/* ── Bottom banner ── */}
        <div style={{
          marginTop: 16, borderRadius: 20, padding: '24px 32px',
          background: 'linear-gradient(135deg, #EDE9FF 0%, #F5F0FF 100%)',
          border: '1.5px solid var(--purple-mid)',
          display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative illustrations */}
          <div style={{ fontSize: 64, flexShrink: 0, filter: 'drop-shadow(0 4px 8px rgba(124,58,237,0.2))' }}>📚</div>
          <div style={{ fontSize: 48, flexShrink: 0, filter: 'drop-shadow(0 4px 8px rgba(124,58,237,0.15))' }}>🚀</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--purple)', marginBottom: 4 }}>
              Өөрийгөө хөгжүүлэх аялалдаа
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 500, marginBottom: 12 }}>
              Voca-тай хамт өдөр бүр бага багаар ахиц гарга!
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['⚡', 'Тогтмол бай'], ['⭐', 'Өдөр бүр сур'], ['🎯', 'Зорилгодоо хүр']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-sub)' }}>
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-purple" onClick={() => router.push('/vocab/practice')} style={{ flexShrink: 0, padding: '12px 24px', fontSize: 14 }}>
            Эхлэх →
          </button>
        </div>

      </div>
    </div>
  );
}
