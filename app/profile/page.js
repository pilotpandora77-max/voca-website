'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api, { uploadUrl } from '@/lib/api';
import GoalSettingsModal from '@/components/GoalSettingsModal';

const EMOJIS = ['🐼','🦊','🐨','🦁','🐯','🐸','🦄','🐙','🦋','🐬','🦅','🐺'];
const COLORS = [
  { name: 'purple', hex: '#7C3AED' }, { name: 'blue', hex: '#3B82F6' },
  { name: 'green', hex: '#22C55E' },  { name: 'gold', hex: '#F59E0B' },
  { name: 'red', hex: '#EF4444' },    { name: 'teal', hex: '#14B8A6' },
];

function getLevel(xp = 0) {
  const t = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
  let level = 1;
  for (let i = 1; i < t.length; i++) { if (xp >= t[i]) level = i + 1; else break; }
  const lvlXp = t[Math.min(level - 1, t.length - 1)];
  const nextXp = t[Math.min(level, t.length - 1)] || lvlXp + 2000;
  return { level, current: xp - lvlXp, needed: nextXp - lvlXp, remain: nextXp - xp };
}

export default function ProfilePage() {
  const { user, logout, loading: authLoad, refreshUser } = useAuth();
  const router = useRouter();
  const [stats, setStats]   = useState(null);
  const [lb, setLb]         = useState([]);
  const [loading, setLoad]  = useState(true);
  const [editing, setEditing] = useState(false);
  const [emoji, setEmoji]   = useState('🐼');
  const [color, setColor]   = useState('purple');
  const [username, setUsername] = useState('');
  const [phone, setPhone]   = useState('');
  const [emailV, setEmailV] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null); // data URI хэрэглэгч шинээр сонгосон бол
  const [idCopied, setIdCopied] = useState(false);
  const [exams, setExams] = useState([]);
  const [goalEditing, setGoalEditing] = useState(false);

  function copyId() {
    navigator.clipboard?.writeText(user.id);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 1500);
  }

  // Профайл нэвтрэлт бүрд нэг удаа ачаалдаг user context-ыг л ашигладаг тул
  // мобайл апп дээр солисон зураг гэх мэт өөрчлөлт хуудсыг дахин ачаалахгүйгээр
  // харагдахгүй байх магадлалтай — тэгэхээр энэ хуудсанд ирэх бүрт шинэчилнэ.
  useEffect(() => { refreshUser(); }, []);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      setEmoji(user.avatarEmoji || '🐼'); setColor(user.avatarColor || 'purple');
      setUsername(user.username || ''); setPhone(user.phone || ''); setEmailV(user.email || '');
      load();
    }
  }, [authLoad, user]);

  async function load() {
    setLoad(true);
    try {
      const [st, str, leader, ex] = await Promise.all([
        api.get('/api/stats').catch(() => ({ data: {} })),
        api.get('/api/streak').catch(() => ({ data: {} })),
        api.get('/api/stats/leaderboard').catch(() => ({ data: [] })),
        api.get('/api/exams').catch(() => ({ data: [] })),
      ]);
      setStats({ ...st.data, streak: str.data.streak || 0 });
      setLb((leader.data || []).slice(0, 5));
      setExams(Array.isArray(ex.data) ? ex.data : []);
    } catch {}
    setLoad(false);
  }

  function pickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const body = { username, phone, email: emailV, avatarEmoji: emoji, avatarColor: color };
      if (photoPreview) body.avatarPhoto = photoPreview; // mobile app-тай ижил формат/талбар
      await api.patch('/api/auth/profile', body);
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...u, username, phone, email: emailV, avatarEmoji: emoji, avatarColor: color }));
      setEditing(false); setTimeout(() => location.reload(), 300);
    } catch (ex) { alert(ex.response?.data?.error || 'Алдаа гарлаа'); }
    setSaving(false);
  }

  const clrHex = COLORS.find(c => c.name === color)?.hex || '#7C3AED';

  if (authLoad || loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>;
  if (!user) return null;

  const xp = stats?.xp || 0;
  const lvl = getLevel(xp);
  const pct = Math.min((lvl.current / lvl.needed) * 100, 100);
  const wordCount = stats?.wordCount || 0;
  const examCount = exams.length;
  const attemptCount = exams.reduce((s, e) => s + (e.attemptCount || 0), 0);
  const bestScores = exams.map(e => e.bestScorePct).filter(v => v != null);
  const bestScore = bestScores.length ? Math.max(...bestScores) : null;
  const latestAttempt = exams.map(e => e.lastAttempt).filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const knownCount = stats?.masteryDone ?? 0;
  const dueCount = stats?.dueCount ?? 0;
  const daysLearned = stats?.studyDays ?? stats?.streak ?? 0;
  const goal = stats?.goal || { targetWords: 500, dailyWordTarget: 20, dailyReviewTarget: 20, dailyExerciseTarget: 3, dailyMinutes: 20, hasCustomGoal: false };
  const today = stats?.today || { wordsAdded: 0, reviewsDone: 0, exercisesDone: 0, minutesStudied: 0 };
  const weekTrend = stats?.weekTrend || { xpDeltaPct: 0, wordsDeltaPct: 0 };
  const goalPct = Math.min((wordCount / goal.targetWords) * 100, 100);
  const roadmapCheckpoints = [0.2, 0.4, 0.6, 0.8, 1.0].map(f => Math.round(goal.targetWords * f));
  const roadmapCurrentIdx = roadmapCheckpoints.findIndex(c => wordCount < c);
  const STREAK_REWARDS = [
    { d: 7,   icon: '🔥', name: 'Streak эхлүүлэгч', c: '#F59E0B' },
    { d: 14,  icon: '🔥', name: 'Галын сонирхогч', c: '#F97316' },
    { d: 30,  icon: '✴️', name: 'Тогтмол суралцагч', c: '#EF4444' },
    { d: 60,  icon: '❄️', name: 'Хичээл мастер', c: '#8B5CF6' },
    { d: 100, icon: '🏆', name: 'Легенд суралцагч', c: '#FACC15' },
  ];
  const nextReward = STREAK_REWARDS.find(r => r.d > (stats?.streak || 0));
  const cumulativeWords = (() => {
    const wa = stats?.weekActivity || [];
    const startTotal = wordCount - wa.reduce((s, d) => s + (d.wordsAdded || 0), 0);
    let running = startTotal;
    return wa.map(d => (running += (d.wordsAdded || 0)));
  })();
  const topPct = lb.length ? Math.max(1, Math.round(((lb.findIndex(e => e.id === user.id) + 1 || lb.length) / Math.max(lb.length, 1)) * 100)) : 12;

  const skills = [
    { label: 'Үг цээжлэх', val: Math.min(95, 40 + wordCount), icon: '🏆' },
    { label: 'Сонсох', val: Math.min(90, 30 + knownCount * 2), icon: '🎧' },
    { label: 'Унших', val: Math.min(88, 35 + knownCount), icon: '📖' },
    { label: 'Бичих', val: Math.min(85, 25 + daysLearned * 3), icon: '✍️' },
    { label: 'Ярих', val: Math.min(80, 20 + lvl.level * 5), icon: '🗣️' },
  ];
  const timeline = Array.from({ length: 7 }, (_, i) => Math.round(xp * (0.55 + i * 0.075)));

  return (
    <div style={{ padding: '26px 28px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px' }}>Миний профайл 👋</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 5 }}>Хичээлээ үргэлжлүүл. Амжилтаа ахиул. Өөрийгөө ялгаатай болго.</p>
        </div>
        <button onClick={() => setEditing(true)} className="btn btn-ghost" style={{ padding: '11px 18px', fontSize: 13.5 }}>✏️ Профайлаа засах</button>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 16, background: 'linear-gradient(120deg, #EDE9FF 0%, #F5F0FF 60%, #FCE7F3 100%)', border: '1.5px solid var(--purple-mid)', padding: '26px 30px' }}>
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 90, opacity: 0.25 }}>🏔️</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ width: 116, height: 116, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: `radial-gradient(circle at 40% 35%, ${clrHex}, #4c1d95)`, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, boxShadow: `0 8px 30px ${clrHex}44` }}>
            {user.avatarPhotoUrl
              ? <img src={uploadUrl(user.avatarPhotoUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : emoji}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{user.username}</span>
              <span style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 900 }}>Pro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 14 }}>@{(user.username || '').toLowerCase().replace(/\s+/g, '.')}</span>
              <span style={{ color: 'var(--text-sub)', fontSize: 13 }}>🇲🇳 Монгол улс</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span title={user.id} style={{ color: 'var(--muted)', fontSize: 11.5, fontFamily: 'monospace' }}>ID: {(user.id || '').slice(0, 8)}</span>
              <button onClick={copyId} title="Бүтэн ID хуулах" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--purple)', fontWeight: 700, fontFamily: 'inherit', padding: 0 }}>
                {idCopied ? 'Хуулагдлаа ✓' : '📋 Хуулах'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 420, marginBottom: 4 }}>
              <span style={{ background: 'var(--purple)', color: '#fff', borderRadius: 8, padding: '4px 12px', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>Level {lvl.level}</span>
              <div style={{ flex: 1, height: 9, background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#a855f7,#7c3aed)', borderRadius: 8 }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{lvl.current} / {lvl.needed} XP</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[['🔥', stats?.streak || 0, 'өдрийн цуваа'], ['⭐', xp, 'нийт XP'], ['🏆', `Top ${topPct}%`, 'дундаас']].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '14px 18px', minWidth: 92 }}>
                <div style={{ fontSize: 20 }}>{s[0]}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>{s[1]}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{s[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
        {[
          { icon: '💎', val: wordCount, label: 'Суралцсан үг', c: '#a855f7' },
          { icon: '✅', val: knownCount, label: 'Мэддэг болсон', c: '#22c55e' },
          { icon: '🔄', val: dueCount, label: 'Давтах шаардлагатай', c: '#f59e0b' },
          { icon: '📅', val: daysLearned, label: 'Суралцсан өдөр', c: '#38bdf8' },
          { icon: '🎮', val: stats?.gameMedals ?? 0, label: 'Тоглоомын медаль', c: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Row: timeline + radar + achievements */}
      <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Lesson timeline */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>Хичээлийн тойм</h3>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, border: '1.5px solid var(--border)', borderRadius: 8, padding: '4px 10px' }}>7 хоног ▾</span>
          </div>
          <LineChart data={timeline} />
          <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
            {[['Нийт XP', xp, '+18%'], ['Суралцах хугацаа', `${Math.round(daysLearned * 0.4)}h`, '+2h'], ['Шинэ үг', wordCount, `+${Math.min(wordCount, 12)}`]].map(([l, v, d], i) => (
              <div key={i} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>{d} ↑</div>
              </div>
            ))}
          </div>
        </div>
        {/* Skill radar */}
        <div className="card">
          <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>Ур чадварын түвшин</h3>
          <SkillRadar skills={skills} level={lvl.level} />
        </div>
        {/* Achievements */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>Сүүлд авсан шагналууд</h3>
          </div>
          <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: '📅', name: '7 өдрийн цуваа', got: (stats?.streak || 0) >= 7, c: '#f59e0b' },
              { icon: '🎯', name: '100 үг нэмсэн', got: wordCount >= 100, c: '#ef4444' },
              { icon: '🎮', name: 'Тоглоомчин', got: true, c: '#38bdf8' },
              { icon: '⚡', name: 'Хурдны мастер', got: lvl.level >= 3, c: '#a855f7' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', background: a.got ? `${a.c}12` : 'var(--bg-alt)', border: `1.5px solid ${a.got ? a.c + '33' : 'var(--border)'}`, borderRadius: 14, opacity: a.got ? 1 : 0.5, textAlign: 'center' }}>
                <div style={{ fontSize: 28, filter: a.got ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: a.got ? 'var(--text)' : 'var(--muted)' }}>{a.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Mission (goal+checklist+progress+streak+roadmap) + exams/friends sidebar */}
      <div className="responsive-sidebar" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="responsive-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Goal card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>🎯 Хэл сурах зорилго</h3>
                <button onClick={() => setGoalEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--purple)', fontWeight: 700, fontFamily: 'inherit' }}>
                  {goal.hasCustomGoal ? '✏️ Засах' : 'Тохируулах'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <svg width={88} height={88}>
                  <defs><linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>
                  <circle cx={44} cy={44} r={36} stroke="var(--border)" strokeWidth={9} fill="none" />
                  <circle cx={44} cy={44} r={36} stroke="url(#goalGrad)" strokeWidth={9} fill="none" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 * (1 - goalPct / 100)}
                    transform="rotate(-90 44 44)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                  <text x={44} y={49} textAnchor="middle" fontSize={17} fontWeight={900} fill="var(--text)">{Math.round(goalPct)}%</text>
                </svg>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 14.5 }}>{goal.title || 'Зорилгоо тохируулаарай'}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 2 }}>{wordCount} / {goal.targetWords} үг</div>
                </div>
              </div>
            </div>

            {/* Daily checklist */}
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Өдөр бүрийн зорилго</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  ['📖', 'Үг сурах', today.wordsAdded, goal.dailyWordTarget, 'үг'],
                  ['🔄', 'Давтах', today.reviewsDone, goal.dailyReviewTarget, 'үг'],
                  ['🎯', 'Дасгал хийх', today.exercisesDone, goal.dailyExerciseTarget, 'дасгал'],
                  ['⏱️', 'Суралцах хугацаа', today.minutesStudied, goal.dailyMinutes, 'мин'],
                ].map(([icon, label, val, target, unit], i) => {
                  const done = val >= target;
                  const p = Math.min((val / target) * 100, 100);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-sub)' }}>{icon} {label}</span>
                        <span style={{ fontWeight: 800, color: done ? 'var(--green)' : 'var(--muted)' }}>{done ? '✓' : `${val}/${target} ${unit}`}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-alt)', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p}%`, background: done ? 'var(--green)' : 'var(--purple)', borderRadius: 6 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ахицын тойм */}
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>Ахицын тойм</h3>
              <LineChart data={cumulativeWords} />
              <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                <div style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>Нийт XP</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text)' }}>{xp}</div>
                  <div style={{ fontSize: 11, color: weekTrend.xpDeltaPct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{weekTrend.xpDeltaPct >= 0 ? '+' : ''}{weekTrend.xpDeltaPct}% {weekTrend.xpDeltaPct >= 0 ? '↑' : '↓'}</div>
                </div>
                <div style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>Үгийн сан</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text)' }}>{wordCount}</div>
                  <div style={{ fontSize: 11, color: weekTrend.wordsDeltaPct >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{weekTrend.wordsDeltaPct >= 0 ? '+' : ''}{weekTrend.wordsDeltaPct}% {weekTrend.wordsDeltaPct >= 0 ? '↑' : '↓'}</div>
                </div>
              </div>
            </div>

            {/* Streak-save card */}
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 10 }}>Сахилга батаа хадгал!</h3>
              <svg width={88} height={88}>
                <defs><linearGradient id="fireGrad2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FCD34D" /><stop offset="100%" stopColor="#EF4444" /></linearGradient></defs>
                <circle cx={44} cy={44} r={36} stroke="var(--border)" strokeWidth={9} fill="none" />
                <circle cx={44} cy={44} r={36} stroke="url(#fireGrad2)" strokeWidth={9} fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 * (1 - Math.min((stats?.streak || 0) / (nextReward?.d || 1), 1))}
                  transform="rotate(-90 44 44)" />
                <text x={44} y={41} textAnchor="middle" fontSize={20}>🔥</text>
                <text x={44} y={59} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text)">{stats?.streak || 0} өдөр</text>
              </svg>
              {nextReward ? (
                <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, marginTop: 6 }}>Дараагийн шагнал: {nextReward.d - (stats?.streak || 0)} өдөр</div>
              ) : (
                <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, marginTop: 6 }}>Бүх шагнал авсан 🏆</div>
              )}
              <Link href="/vocab" className="btn btn-purple" style={{ width: '100%', marginTop: 12, textDecoration: 'none', justifyContent: 'center', fontSize: 13 }}>Суралцах</Link>
            </div>
          </div>

          {/* Зорилтот түвшин roadmap */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>Зорилтот түвшин</h3>
              <button onClick={() => setGoalEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--purple)', fontWeight: 700, fontFamily: 'inherit' }}>Зорилго өөрчлөх</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 22 }}>
              {roadmapCheckpoints.map((c, i) => {
                const done = wordCount >= c;
                const current = !done && i === roadmapCurrentIdx;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < roadmapCheckpoints.length - 1 ? 1 : '0 0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900,
                        background: done ? 'var(--green-bg)' : current ? 'var(--purple-light)' : 'var(--bg-alt)',
                        border: `2px solid ${done ? 'var(--green)' : current ? 'var(--purple)' : 'var(--border)'}`,
                        color: done ? 'var(--green-dark)' : current ? 'var(--purple)' : 'var(--muted)',
                      }}>{done ? '✓' : current ? '💠' : '🔒'}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{c} үг</div>
                    </div>
                    {i < roadmapCheckpoints.length - 1 && <div style={{ flex: 1, height: 2, background: done ? 'var(--green)' : 'var(--border)', marginLeft: 6, marginRight: 6, marginTop: -18 }} />}
                  </div>
                );
              })}
            </div>
            <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                [goal.targetWords, 'Нийт зорилтот үгс'],
                [stats?.masteryLearning || 0, 'Суралцаж буй үгс'],
                [knownCount, 'Мэддэг болсон'],
                [dueCount, 'Давтах шаардлагатай'],
              ].map(([v, l], i) => (
                <div key={i} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>Шалгалтын амжилт</h3>
              <Link href="/exams" style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>Бүгдийг харах</Link>
            </div>
            <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['🎓', 'Хадгалсан', `${examCount}`, '#a855f7'],
                ['✅', 'Нийт өгсөн', `${attemptCount}`, '#38bdf8'],
                ['🏆', 'Шилдэг оноо', bestScore != null ? `${bestScore}%` : '—', '#22c55e'],
                ['🎯', 'Сүүлийн оноо', latestAttempt ? `${latestAttempt.scorePct}%` : '—', '#ef4444'],
              ].map(([ic, n, v, c], i) => (
                <Link key={i} href="/exams" style={{ textDecoration: 'none', background: `${c}12`, border: `1.5px solid ${c}28`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20 }}>{ic}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>{v}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginTop: 1 }}>{n}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>Найзууд</h3>
              <Link href="/leaderboard" style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>Бүгдийг харах</Link>
            </div>
            {lb.length === 0 ? <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>Өгөгдөл байхгүй</p>
            : lb.map((e, i) => {
              const isMe = e.id === user.id;
              return (
                <div key={e.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 10, marginBottom: 3, background: isMe ? 'var(--purple-light)' : 'transparent' }}>
                  <span style={{ width: 18, fontWeight: 800, color: 'var(--muted)', fontSize: 13 }}>{i + 1}</span>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{e.avatarEmoji || e.username?.[0]?.toUpperCase()}</div>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: isMe ? 'var(--purple)' : 'var(--text)' }}>{e.username}{isMe ? ' (та)' : ''}</span>
                  <span style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--purple)' }}>{(e.xp || 0).toLocaleString()} XP</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button onClick={logout} className="btn btn-ghost" style={{ marginTop: 18, color: 'var(--red)', padding: '11px 22px' }}>← Гарах</button>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,30,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(false); }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: '28px 30px', maxHeight: '88vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 900, fontSize: 19, color: 'var(--text)', marginBottom: 20 }}>Профайл засах</h2>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Зураг</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                  <div style={{
                    width: 62, height: 62, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    background: photoPreview || user.avatarPhotoUrl ? 'transparent' : `${clrHex}22`,
                    border: `2px solid ${clrHex}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  }}>
                    {photoPreview
                      ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : user.avatarPhotoUrl
                      ? <img src={uploadUrl(user.avatarPhotoUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : emoji}
                  </div>
                  <span style={{ fontSize: 12.5, color: 'var(--purple)', fontWeight: 700 }}>Зураг сонгох →</span>
                  <input type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
                </label>
              </div>
              {[['Нэр', username, setUsername, 'text', ''], ['И-мэйл', emailV, setEmailV, 'email', 'name@example.com'], ['Утасны дугаар', phone, setPhone, 'tel', '9900-0000']].map(([label, val, set, type, ph]) => (
                <div key={label}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>{label}</label>
                  <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph} required={type === 'text'} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Avatar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EMOJIS.map(em => <button type="button" key={em} onClick={() => setEmoji(em)} style={{ fontSize: 22, borderRadius: 11, padding: '6px 9px', cursor: 'pointer', border: `1.5px solid ${emoji === em ? clrHex : 'var(--border)'}`, background: emoji === em ? clrHex + '18' : '#fff', fontFamily: 'inherit' }}>{em}</button>)}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Өнгө</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {COLORS.map(c => <button type="button" key={c.name} onClick={() => setColor(c.name)} style={{ width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', background: c.hex, border: color === c.name ? '3px solid #fff' : '2px solid transparent', boxShadow: color === c.name ? `0 0 0 2px ${c.hex}` : 'none' }} />)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost" style={{ flex: 1 }}>Болих</button>
                <button type="submit" disabled={saving} className="btn btn-purple" style={{ flex: 1 }}>{saving ? 'Хадгалж байна...' : 'Хадгалах'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {goalEditing && (
        <GoalSettingsModal
          initial={goal}
          onSaved={() => { setGoalEditing(false); load(); }}
          onCancel={() => setGoalEditing(false)}
        />
      )}
    </div>
  );
}

function LineChart({ data }) {
  if (!data || data.length < 2) return null;
  const w = 320, h = 130, pad = 24;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const pts = data.map((v, i) => [pad + (i * (w - pad * 2)) / (data.length - 1), h - pad - ((v - min) / range) * (h - pad * 2)]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${path} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  const days = ['Пүр', 'Ба', 'Бя', 'Лха', 'Пү', 'Ба', 'Ня'];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id="lc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(124,58,237,0.25)" /><stop offset="100%" stopColor="rgba(124,58,237,0)" /></linearGradient></defs>
      <path d={area} fill="url(#lc)" />
      <path d={path} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#7c3aed" />)}
      {pts.map((p, i) => <text key={i} x={p[0]} y={h - 6} textAnchor="middle" fontSize="8" fill="#9CA3AF">{days[i]}</text>)}
    </svg>
  );
}

function SkillRadar({ skills, level }) {
  const size = 220, cx = size / 2, cy = size / 2 + 4, R = 72;
  const n = skills.length;
  const angle = i => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const dataPts = skills.map((s, i) => point(i, (s.val / 100) * R));
  const poly = pts => pts.map(p => p.join(',')).join(' ');
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size + 26}>
        {[0.25, 0.5, 0.75, 1].map((f, k) => <polygon key={k} points={poly(skills.map((_, i) => point(i, R * f)))} fill="none" stroke="#E5E7EB" strokeWidth="1" />)}
        {skills.map((_, i) => { const [x, y] = point(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E5E7EB" strokeWidth="1" />; })}
        <polygon points={poly(dataPts)} fill="rgba(124,58,237,0.25)" stroke="#7c3aed" strokeWidth="2" />
        {dataPts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#7c3aed" />)}
        <circle cx={cx} cy={cy} r="20" fill="rgba(124,58,237,0.12)" stroke="#7c3aed" strokeWidth="1.5" />
        <text x={cx} y={cy - 2} textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="700">LV.</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fill="#7c3aed" fontSize="15" fontWeight="900">{level}</text>
        {skills.map((s, i) => { const [x, y] = point(i, R + 24); return <g key={i}><text x={x} y={y - 2} textAnchor="middle" fill="#374151" fontSize="10.5" fontWeight="700">{s.label}</text><text x={x} y={y + 11} textAnchor="middle" fill="#9CA3AF" fontSize="10.5" fontWeight="800">{s.val}%</text></g>; })}
      </svg>
    </div>
  );
}
