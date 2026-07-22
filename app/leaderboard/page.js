'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const TABS = ['Нийт эрэмбэ', 'Энэ сарын', 'Энэ долоо хоног', 'Өдрийн лидер', 'Найзууд'];

const LEAGUES = [
  { name: 'Rookie', icon: '🛡️', color: '#9CA3AF' },
  { name: 'Bronze', icon: '🥉', color: '#D97706' },
  { name: 'Silver', icon: '🥈', color: '#94A3B8' },
  { name: 'Gold', icon: '🏅', color: '#F59E0B' },
  { name: 'Platinum', icon: '💠', color: '#22D3EE' },
  { name: 'Diamond', icon: '💎', color: '#60A5FA' },
  { name: 'Master', icon: '👑', color: '#A855F7' },
];

function levelOf(xp = 0) {
  const t = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
  let l = 1; for (let i = 1; i < t.length; i++) { if (xp >= t[i]) l = i + 1; else break; } return l;
}
function leagueOf(xp = 0) {
  if (xp >= 8000) return 6; if (xp >= 5000) return 5; if (xp >= 3000) return 4;
  if (xp >= 1500) return 3; if (xp >= 600) return 2; if (xp >= 200) return 1; return 0;
}

// Demo fallback when backend leaderboard is empty
const DEMO = [
  { id: 'd1', username: 'temuujin', xp: 8560, avatarEmoji: '🦊', streak: 24 },
  { id: 'd2', username: 'Erdene',   xp: 7240, avatarEmoji: '🐯', streak: 19 },
  { id: 'd3', username: 'Suki',     xp: 6850, avatarEmoji: '🌸', streak: 21 },
  { id: 'd4', username: 'Boldoo',   xp: 5320, avatarEmoji: '🦁', streak: 18 },
  { id: 'd5', username: 'Nomin',    xp: 4980, avatarEmoji: '⭐', streak: 15 },
  { id: 'd6', username: 'Bat',      xp: 3980, avatarEmoji: '🐼', streak: 12 },
  { id: 'd7', username: 'Kimji',    xp: 3450, avatarEmoji: '🦋', streak: 10 },
  { id: 'd8', username: 'Yuna',     xp: 3210, avatarEmoji: '🐬', streak: 8 },
];

function Sparkline({ seed = 1, color = '#a855f7' }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const v = 20 - (Math.sin(i * 1.3 + seed) * 7 + (i * 1.1) + (seed % 5));
    return [i * 7, Math.max(2, Math.min(28, v))];
  });
  return (
    <svg width="74" height="30" style={{ display: 'block' }}>
      <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LeaderboardPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [rows, setRows]     = useState([]);
  const [streak, setStreak] = useState(0);
  const [tab, setTab]       = useState(TABS[0]);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user]);

  async function load() {
    setLoad(true);
    try {
      const [lb, s] = await Promise.all([
        api.get('/api/stats/leaderboard').catch(() => ({ data: [] })),
        api.get('/api/streak').catch(() => ({ data: {} })),
      ]);
      let data = lb.data || [];
      if (data.length < 3) data = DEMO;
      setRows(data);
      setStreak(s.data.streak || 0);
    } catch { setRows(DEMO); }
    setLoad(false);
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );
  if (!user) return null;

  const sorted = [...rows].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3, 10);
  const myIdx = sorted.findIndex(r => r.id === user.id);
  const myRank = myIdx >= 0 ? myIdx + 1 : sorted.length + 1;
  const myXp = myIdx >= 0 ? sorted[myIdx].xp : 0;
  const myLeague = leagueOf(myXp);

  // podium order: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = [128, 168, 110];
  const medals = ['🥈', '👑', '🥉'];
  const ranks = [2, 1, 3];

  return (
    <div style={{ paddingBottom: 40 }}>
      <style>{`
        @keyframes lb-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes lb-crown { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
        @keyframes lb-glow { 0%,100% { box-shadow: 0 0 30px rgba(252,211,77,0.5); } 50% { box-shadow: 0 0 50px rgba(252,211,77,0.9); } }
        @keyframes lb-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lb-sparkle { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes lb-shine { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .lb-podium-1 { animation: lb-float 3s ease-in-out infinite, lb-glow 2.5s ease-in-out infinite; }
        .lb-podium-2 { animation: lb-float 3s ease-in-out infinite 0.4s; }
        .lb-podium-3 { animation: lb-float 3s ease-in-out infinite 0.8s; }
        .lb-crown { display: inline-block; animation: lb-crown 2s ease-in-out infinite; transform-origin: 50% 80%; }
        .lb-row { animation: lb-rise 0.4s ease both; }
        .lb-spark { position: absolute; animation: lb-sparkle 2s ease-in-out infinite; pointer-events: none; }
        .lb-myrank { background-size: 200% 100%; animation: lb-shine 6s linear infinite; }
      `}</style>
      <PageHeader title="🏆 Эрэмбэ" subtitle="Хамгийн идэвхтэй, шилдэг суралцагчидтай өрсөлд!" streak={streak} />

      <div className="responsive-sidebar" style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 18, alignItems: 'start' }}>
        {/* ── Main column ── */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px 16px', borderRadius: 100, fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                border: tab === t ? 'none' : '1.5px solid var(--border)',
                background: tab === t ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#fff',
                color: tab === t ? '#fff' : 'var(--text-sub)',
              }}>{t}</button>
            ))}
          </div>

          {/* Podium */}
          <div style={{
            borderRadius: 22, padding: '28px 24px 0', marginBottom: 16,
            background: 'radial-gradient(120% 120% at 50% 0%, #5b3aa6, #3a2470 60%, #2a1a52)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 18, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none', backgroundImage: 'radial-gradient(1.5px 1.5px at 15% 25%,#fff,transparent),radial-gradient(1px 1px at 80% 15%,#fcd34d,transparent),radial-gradient(1.5px 1.5px at 60% 35%,#fff,transparent)' }} />
            {/* animated sparkles */}
            <span className="lb-spark" style={{ top: 24, left: '22%', fontSize: 16 }}>✨</span>
            <span className="lb-spark" style={{ top: 60, right: '20%', fontSize: 13, animationDelay: '0.6s' }}>⭐</span>
            <span className="lb-spark" style={{ top: 110, left: '12%', fontSize: 12, animationDelay: '1.1s' }}>✨</span>
            {podium.map((p, i) => (
              <div key={p.id} style={{ textAlign: 'center', position: 'relative', zIndex: 1, width: 120 }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>
                  {ranks[i] === 1 ? <span className="lb-crown">👑</span> : medals[i]}
                </div>
                <div className={ranks[i] === 1 ? 'lb-podium-1' : ranks[i] === 2 ? 'lb-podium-2' : 'lb-podium-3'} style={{
                  width: ranks[i] === 1 ? 82 : 64, height: ranks[i] === 1 ? 82 : 64, borderRadius: '50%', margin: '0 auto 8px',
                  background: 'rgba(168,85,247,0.3)', border: `3px solid ${ranks[i] === 1 ? '#fcd34d' : '#c4b5fd'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ranks[i] === 1 ? 40 : 30,
                }}>{p.avatarEmoji || p.username?.[0]?.toUpperCase()}</div>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: ranks[i] === 1 ? 16 : 14 }}>{p.username}</div>
                <div style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Level {levelOf(p.xp)}</div>
                <div style={{
                  height: heights[i], borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'flex-start', paddingTop: 14,
                  background: ranks[i] === 1 ? 'linear-gradient(180deg,#fcd34d,#f59e0b)' : 'linear-gradient(180deg,rgba(196,181,253,0.5),rgba(124,58,237,0.3))',
                }}>
                  <div style={{ fontWeight: 900, fontSize: ranks[i] === 1 ? 22 : 18, color: ranks[i] === 1 ? '#4c1d95' : '#fff' }}>{ranks[i]}</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: ranks[i] === 1 ? '#4c1d95' : '#fff', marginTop: 'auto', paddingBottom: 12 }}>{(p.xp || 0).toLocaleString()} XP</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="responsive-table-row" style={{ display: 'grid', gridTemplateColumns: '44px 1fr 90px 90px 90px 84px', gap: 8, padding: '12px 18px', borderBottom: '1.5px solid var(--border)', fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>
              <span>#</span><span>ХЭРЭГЛЭГЧ</span><span className="hide-mobile">LEVEL</span><span>XP ОНОО</span><span className="hide-mobile">ЦУВАА</span><span className="hide-mobile">АХИЦ</span>
            </div>
            {rest.map((r, i) => {
              const rank = i + 4;
              const isMe = r.id === user.id;
              return (
                <div key={r.id} className="lb-row responsive-table-row" style={{
                  display: 'grid', gridTemplateColumns: '44px 1fr 90px 90px 90px 84px', gap: 8, padding: '12px 18px',
                  alignItems: 'center', borderBottom: '1px solid var(--border)',
                  background: isMe ? 'var(--purple-light)' : 'transparent',
                  animationDelay: `${i * 0.06}s`,
                }}>
                  <span style={{ fontWeight: 900, color: isMe ? 'var(--purple)' : 'var(--text-sub)', fontSize: 15 }}>{rank}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{r.avatarEmoji || r.username?.[0]?.toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: isMe ? 'var(--purple)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username}{isMe ? ' (та)' : ''}</div>
                    </div>
                  </div>
                  <span className="hide-mobile"><span style={{ background: 'var(--purple-light)', color: 'var(--purple)', borderRadius: 8, padding: '3px 9px', fontSize: 12, fontWeight: 800 }}>Lv.{levelOf(r.xp)}</span></span>
                  <span style={{ fontWeight: 900, color: 'var(--text)', fontSize: 14 }}>{(r.xp || 0).toLocaleString()}</span>
                  <span className="hide-mobile" style={{ fontWeight: 800, color: 'var(--gold-dark)', fontSize: 13 }}>{r.streak ?? 0} 🔥</span>
                  <span className="hide-mobile"><Sparkline seed={rank} /></span>
                </div>
              );
            })}
            <Link href="/social" style={{ display: 'block', textAlign: 'center', padding: '14px', color: 'var(--purple)', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>Бүх эрэмбийг харах →</Link>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* My rank */}
          <div className="lb-myrank" style={{ borderRadius: 20, padding: '20px 22px', color: '#fff', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(110deg, #2a1a52, #5b3aa6, #2a1a52)' }}>
            <span className="lb-spark" style={{ top: 14, right: 18, fontSize: 18 }}>✨</span>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd', marginBottom: 6 }}>Миний байр</div>
            <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>#{myRank}</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginTop: 8 }}>{user.username}</div>
            <div style={{ color: '#c4b5fd', fontSize: 13, fontWeight: 600 }}>Level {levelOf(myXp)}</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 10 }}>{(myXp || 0).toLocaleString()} <span style={{ fontSize: 14, color: '#c4b5fd' }}>XP</span></div>
          </div>

          {/* League system */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>Лиг систем</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              {LEAGUES.map((lg, i) => (
                <div key={lg.name} style={{
                  width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  background: i === myLeague ? lg.color : 'var(--bg-alt)',
                  border: i === myLeague ? `2px solid ${lg.color}` : '1.5px solid var(--border)',
                  opacity: i === myLeague ? 1 : 0.55, transform: i === myLeague ? 'scale(1.15)' : 'none',
                }} title={lg.name}>{lg.icon}</div>
              ))}
            </div>
            <div style={{ background: `linear-gradient(135deg, ${LEAGUES[myLeague].color}22, transparent)`, border: `1.5px solid ${LEAGUES[myLeague].color}44`, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>{LEAGUES[myLeague].icon}</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{LEAGUES[myLeague].name} League</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>+{(myLeague + 1) * 5}% XP Bonus</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top gainers today */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>Өнөөдрийн топ ахиц</h3>
            {top3.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                <span style={{ fontSize: 15 }}>{['🥇','🥈','🥉'][i]}</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{p.avatarEmoji || p.username?.[0]}</div>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{p.username}</span>
                <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--green)' }}>+{Math.round((p.xp || 0) / 8)} XP</span>
              </div>
            ))}
          </div>

          {/* Challenge */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--purple-light), var(--purple-soft))', border: '1.5px solid var(--purple-mid)' }}>
            <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--purple-dark)', marginBottom: 6 }}>🏁 Challenge</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-sub)', fontWeight: 600, marginBottom: 12 }}>7 өдрийн зорилт — 5/7 өдөр амжилттай!</p>
            <div style={{ height: 8, background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '71%', background: 'linear-gradient(90deg,#7c3aed,#a855f7)', borderRadius: 8 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
