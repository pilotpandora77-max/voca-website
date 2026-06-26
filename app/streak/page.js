'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

function getLevel(xp = 0) {
  const t = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
  let level = 1;
  for (let i = 1; i < t.length; i++) { if (xp >= t[i]) level = i + 1; else break; }
  const lvlXp = t[Math.min(level - 1, t.length - 1)];
  const nextXp = t[Math.min(level, t.length - 1)] || lvlXp + 2500;
  return { level, current: xp - lvlXp, needed: nextXp - lvlXp, remain: nextXp - xp };
}

const REWARDS = [
  { d: 7,   icon: '🔥', name: 'Streak эхлүүлэгч', c: '#F59E0B' },
  { d: 14,  icon: '🔥', name: 'Галын сонирхогч', c: '#F97316' },
  { d: 30,  icon: '✴️', name: 'Тогтмол суралцагч', c: '#EF4444' },
  { d: 60,  icon: '❄️', name: 'Хичээл мастер', c: '#8B5CF6' },
  { d: 100, icon: '🏆', name: 'Легенд суралцагч', c: '#FACC15' },
];

const HOW = [
  { icon: '📅', title: 'Өдөр бүр хичээл хий', desc: 'Хамгийн багадаа 1 хичээл дуусга.' },
  { icon: '🔥', title: 'Streak нэмэгдэнэ', desc: 'Өдөр дараалан хийсэн өдрүүд тоологдоно.' },
  { icon: '🎁', title: 'Шагнал авах', desc: 'Streak уртсах тусам илүү их шагналтай.' },
  { icon: '🛡️', title: 'Түвшин ахих', desc: 'XP цуглуулж, шинэ түвшинд хүрээрэй.' },
];

const TIPS = [
  { icon: '📅', text: 'Өдөр бүр тогтсон цагт хичээллэ.' },
  { icon: '🔔', text: 'Сэрүүлэг тохируулж, мартахгүй бай.' },
  { icon: '🎯', text: 'Жижиг зорилго тавьж, тогтмол хэрэгжүүл.' },
  { icon: '📈', text: 'Прогрессээ хянаж, урам зориг ав.' },
];

const DAYS = ['Да', 'Мя', 'Лх', 'Пу', 'Ба', 'Бя', 'Ня'];

export default function StreakPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [stats, setStats]   = useState(null);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user]);

  async function load() {
    setLoad(true);
    try {
      const [s, st] = await Promise.all([
        api.get('/api/streak').catch(() => ({ data: {} })),
        api.get('/api/stats').catch(() => ({ data: {} })),
      ]);
      setStreak(s.data.streak || 0);
      setStats(st.data);
    } catch {}
    setLoad(false);
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );
  if (!user) return null;

  const xp  = stats?.xp || 0;
  const lvl = getLevel(xp);
  const lvlPct = Math.min((lvl.current / lvl.needed) * 100, 100);
  const best = Math.max(streak, stats?.bestStreak || 0);

  // Streak ring %
  const ringTarget = streak < 7 ? 7 : streak < 30 ? 30 : streak < 100 ? 100 : 365;
  const ringPct = Math.min((streak / ringTarget) * 100, 100);

  // Calendar — current month, mark last `streak` days as fire
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const isFire = d => d && d <= today && (today - d) < streak;

  // 7-day progress (synthetic rising to current streak)
  const prog = Array.from({ length: 7 }, (_, i) => Math.max(0, streak - (6 - i) * 2));

  // ── VOCA Learning Score (#16) ──
  const consistency = Math.min(100, Math.round((streak / 30) * 100));
  const retention   = stats?.memoryScore ?? Math.min(95, 60 + (stats?.reviewCount || 0));
  const dailyGoal   = stats?.dailyGoalPct ?? Math.min(100, 50 + streak);
  const reviewQ     = Math.min(95, 55 + Math.round((stats?.reviewCount || 0) * 1.5));
  const learningScore = Math.round(consistency * 0.3 + retention * 0.3 + dailyGoal * 0.2 + reviewQ * 0.2);

  const card = { background: 'linear-gradient(160deg,#1a1336,#140e2a)', border: '1px solid rgba(150,120,230,0.12)', borderRadius: 20 };
  const muted = '#9486c4';

  return (
    <div style={{ minHeight: '100vh', background: '#0c0820', padding: '26px 26px 48px' }}>
      <style>{`
        @keyframes st-flicker { 0%,100%{transform:scale(1) rotate(-2deg);} 50%{transform:scale(1.08) rotate(2deg);} }
        @keyframes st-glow { 0%,100%{filter:drop-shadow(0 0 12px rgba(245,158,11,.6));} 50%{filter:drop-shadow(0 0 26px rgba(245,158,11,.9));} }
        .st-flame { animation: st-flicker 1.6s ease-in-out infinite, st-glow 2s ease-in-out infinite; }
        @keyframes st-rise { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .st-rise { animation: st-rise .4s ease both; }
      `}</style>

      <PageHeader title="🔥 Streak – Тогтмол байдал" subtitle="Өдөр бүр суралцаж, streak-аа улам уртасгаарай!" streak={streak} />

      {/* ── Row 1: hero + level + how ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Hero streak */}
        <div className="st-rise" style={{ ...card, padding: '26px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="9" />
              <circle cx="65" cy="65" r="58" fill="none" stroke="url(#fireGrad)" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - ringPct / 100)} style={{ transition: 'stroke-dashoffset 0.8s' }} />
              <defs><linearGradient id="fireGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FCD34D" /><stop offset="100%" stopColor="#EF4444" /></linearGradient></defs>
            </svg>
            <span className="st-flame" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>🔥</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: muted, marginBottom: 4 }}>Таны хамгийн урт streak</div>
            <div style={{ fontSize: 54, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 13, color: muted, fontWeight: 600, marginBottom: 12 }}>өдөр дараалан</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>🏆</span>
              <span style={{ fontWeight: 800, color: '#fcd34d', fontSize: 15 }}>{best} өдөр</span>
            </div>
            <p style={{ fontSize: 12.5, color: muted, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 14 }}>"Өнөөдөр бага ч гэсэн ахиц гарга, маргааш үүчийг давтагдана."</p>
          </div>
        </div>

        {/* Level */}
        <div className="st-rise" style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Таны түвшин</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#a78bfa', lineHeight: 1 }}>Level {lvl.level}</div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(145deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 6px 18px rgba(124,58,237,0.5)' }}>⚡</div>
          </div>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${lvlPct}%`, background: 'linear-gradient(90deg,#a855f7,#7c3aed)', borderRadius: 8 }} />
          </div>
          <div style={{ fontSize: 12, color: muted, fontWeight: 700, marginBottom: 16 }}>{xp.toLocaleString()} / {(xp + lvl.remain).toLocaleString()} XP</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(168,85,247,0.1)', borderRadius: 12 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>Дараагийн түвшин: Level {lvl.level + 1}</div>
              <div style={{ fontSize: 12, color: muted, fontWeight: 600 }}>{lvl.remain} XP дутуу байна</div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="st-rise" style={{ ...card, padding: '24px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff', marginBottom: 14 }}>Streak хэрхэн ажилладаг?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HOW.map(h => (
              <div key={h.title} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{h.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{h.title}</div>
                  <div style={{ fontSize: 11.5, color: muted, fontWeight: 500, lineHeight: 1.4 }}>{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: calendar + progress + rewards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Calendar */}
        <div style={{ ...card, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>Streak календарь</h3>
            <span style={{ fontSize: 13, color: muted, fontWeight: 700 }}>{year} оны {month + 1}-р сар</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, color: muted, fontWeight: 700 }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
            {cells.map((d, i) => {
              const fire = isFire(d), isToday = d === today;
              return (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: fire ? 'rgba(245,158,11,0.16)' : d ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: isToday ? '2px solid #a855f7' : '1px solid transparent',
                }}>
                  {d && <span style={{ fontSize: 10, color: fire ? '#fcd34d' : muted, fontWeight: 700 }}>{d}</span>}
                  {fire && <span style={{ fontSize: 13 }}>🔥</span>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: muted, display: 'flex', alignItems: 'center', gap: 5 }}>🔥 Streak өдөр</span>
            <span style={{ fontSize: 11, color: muted, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #a855f7' }} /> Өнөөдөр</span>
          </div>
        </div>

        {/* Progress chart */}
        <div style={{ ...card, padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff', marginBottom: 6 }}>Streak прогресс</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{streak}</span>
            <span style={{ fontSize: 12, color: muted, fontWeight: 600 }}>өдөр</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#22c55e', fontWeight: 800 }}>▲ {prog[0] ? Math.round(((streak - prog[0]) / Math.max(prog[0], 1)) * 100) : 0}%</span>
          </div>
          <ProgressChart data={prog} />
        </div>

        {/* Rewards */}
        <div style={{ ...card, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>Streak шагналууд</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REWARDS.map(r => {
              const got = streak >= r.d;
              return (
                <div key={r.d} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: got ? 1 : 0.55 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${r.c}22`, border: `1.5px solid ${r.c}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, filter: got ? 'none' : 'grayscale(0.6)' }}>{r.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{r.d} өдөр</div>
                    <div style={{ fontSize: 11.5, color: muted, fontWeight: 500 }}>{r.name}</div>
                  </div>
                  <span style={{ fontSize: 16 }}>{got ? '✅' : '🔒'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Learning Score (#16) ── */}
      <div style={{ ...card, padding: '24px 26px', marginBottom: 16, background: 'radial-gradient(120% 130% at 85% 10%, #3a2470, #1a1038)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd', marginBottom: 4 }}>⭐ VOCA Learning Score</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{learningScore}<span style={{ fontSize: 22, color: muted }}>/100</span></div>
          </div>
          <div style={{ flex: 1, minWidth: 280, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['🔥 Тогтмол байдал', consistency, '#F59E0B'],
              ['🧠 Санах чадвар', retention, '#22C55E'],
              ['🎯 Зорилгын биелэлт', dailyGoal, '#A855F7'],
              ['📚 Давталтын чанар', reviewQ, '#38BDF8'],
            ].map(([label, val, c]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, color: '#e0d8f5', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 12.5, color: c, fontWeight: 800 }}>{val}%</span>
                </div>
                <div style={{ height: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val}%`, background: c, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: tips + quote + freeze ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 16 }}>
        <div style={{ ...card, padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff', marginBottom: 16 }}>Streak-аа хэрхэн хадгалах вэ?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {TIPS.map(t => (
              <div key={t.text} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168,85,247,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{t.icon}</div>
                <div style={{ fontSize: 12.5, color: muted, fontWeight: 500, lineHeight: 1.45 }}>{t.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: '22px 24px', background: 'radial-gradient(120% 120% at 50% 100%, #3a2470, #140e2a)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🏔️</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 10 }}>"Тогтмол жижиг алхмууд том өөрчлөлтийг бий болгодог."</p>
          <span style={{ color: '#a78bfa', fontWeight: 800, fontSize: 13 }}>– VOCA</span>
        </div>

        <div style={{ ...card, padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff', marginBottom: 14 }}>Streak хамгаалалт</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(145deg,#38BDF8,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 6px 18px rgba(56,189,248,0.4)' }}>❄️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Streak Freeze – 3ш</div>
              <div style={{ fontSize: 12, color: muted, fontWeight: 500, lineHeight: 1.4 }}>Хэрэв өдөр алгассан ч streak-аа хадгалах боломжтой.</div>
            </div>
          </div>
          <button onClick={() => alert('Streak Freeze ашиглагдлаа! ❄️\nӨнөөдөр алгассан ч streak хадгалагдана.')} className="btn btn-purple" style={{ width: '100%', padding: '11px' }}>Ашиглах</button>
        </div>
      </div>
    </div>
  );
}

function ProgressChart({ data }) {
  const w = 240, h = 120, pad = 18;
  const max = Math.max(...data, 1), min = Math.min(...data);
  const range = Math.max(max - min, 1);
  const pts = data.map((v, i) => [pad + (i * (w - pad * 2)) / (data.length - 1), h - pad - ((v - min) / range) * (h - pad * 2)]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${path} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(168,85,247,0.4)" /><stop offset="100%" stopColor="rgba(168,85,247,0)" /></linearGradient></defs>
      <path d={area} fill="url(#pg)" />
      <path d={path} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4" fill="#fcd34d" />
          <text x={p[0]} y={p[1] - 9} textAnchor="middle" fontSize="9" fill="#cbb9f5" fontWeight="700">{data[i]}</text>
        </g>
      ))}
    </svg>
  );
}
