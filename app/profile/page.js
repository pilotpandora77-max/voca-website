'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const EMOJIS = ['🐼','🦊','🐨','🦁','🐯','🐸','🦄','🐙','🦋','🐬','🦅','🐺'];
const COLORS = [
  { name: 'purple', hex: '#9B6DFF' }, { name: 'blue', hex: '#38BDF8' },
  { name: 'green', hex: '#22C55E' },  { name: 'gold', hex: '#F59E0B' },
  { name: 'red', hex: '#F87171' },    { name: 'teal', hex: '#00C6AE' },
];

function getLevel(xp = 0) {
  const t = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];
  let level = 1;
  for (let i = 1; i < t.length; i++) { if (xp >= t[i]) level = i + 1; else break; }
  const lvlXp = t[Math.min(level - 1, t.length - 1)];
  const nextXp = t[Math.min(level, t.length - 1)] || lvlXp + 2000;
  return { level, current: xp - lvlXp, needed: nextXp - lvlXp, nextTotal: nextXp };
}

export default function ProfilePage() {
  const { user, logout, loading: authLoad } = useAuth();
  const router = useRouter();
  const [stats, setStats]       = useState(null);
  const [lb, setLb]             = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);

  // edit form
  const [emoji, setEmoji]       = useState('🐼');
  const [color, setColor]       = useState('purple');
  const [username, setUsername] = useState('');
  const [phone, setPhone]       = useState('');
  const [emailV, setEmailV]     = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      setEmoji(user.avatarEmoji || '🐼');
      setColor(user.avatarColor || 'purple');
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setEmailV(user.email || '');
      load();
    }
  }, [authLoad, user]);

  async function load() {
    setLoading(true);
    try {
      const [st, str, leader] = await Promise.all([
        api.get('/api/stats').catch(() => ({ data: {} })),
        api.get('/api/streak').catch(() => ({ data: {} })),
        api.get('/api/stats/leaderboard').catch(() => ({ data: [] })),
      ]);
      setStats({ ...st.data, streak: str.data.streak || 0 });
      setLb((leader.data || []).slice(0, 5));
    } catch {}
    setLoading(false);
  }

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.patch('/api/auth/profile', { username, phone, email: emailV, avatarEmoji: emoji, avatarColor: color });
      setEditing(false);
      setTimeout(() => location.reload(), 300);
    } catch (ex) { alert(ex.response?.data?.error || 'Алдаа гарлаа'); }
    setSaving(false);
  }

  const clrHex = COLORS.find(c => c.name === color)?.hex || '#9B6DFF';

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );
  if (!user) return null;

  const xp   = stats?.xp || 0;
  const lvl  = getLevel(xp);
  const pct  = Math.min((lvl.current / lvl.needed) * 100, 100);
  const wordCount   = stats?.wordCount || 0;
  const knownCount  = stats?.knownCount ?? Math.round(wordCount * 0.4);
  const dueCount    = stats?.dueCount ?? stats?.reviewCount ?? 0;
  const daysLearned = stats?.daysLearned ?? stats?.streak ?? 0;

  // Skill levels (derive from activity, fallback values)
  const skills = [
    { label: 'Үг цээжлэх', val: Math.min(95, 40 + wordCount), icon: '🏆' },
    { label: 'Сонсох',     val: Math.min(90, 30 + knownCount * 2), icon: '🎧' },
    { label: 'Унших',      val: Math.min(88, 35 + knownCount), icon: '📖' },
    { label: 'Бичих',      val: Math.min(85, 25 + daysLearned * 3), icon: '✍️' },
    { label: 'Ярих',       val: Math.min(80, 20 + lvl.level * 5), icon: '🗣️' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0c0820', padding: '26px 26px 48px' }}>
      <style>{`
        .pf-card { background: linear-gradient(160deg,#1a1336,#140e2a); border:1px solid rgba(150,120,230,0.12); border-radius:20px; }
        .pf-muted { color:#9486c4; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Миний профайл 👋</h1>
          <p className="pf-muted" style={{ fontSize: 14, marginTop: 5 }}>Хичээлээ үргэлжлүүл. Амжилтаа ахиул. Өөрийгөө ялгаатай болго.</p>
        </div>
        <button onClick={() => setEditing(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(150,120,230,0.1)',
          border: '1.5px solid rgba(150,120,230,0.25)', color: '#c4b5fd', borderRadius: 12,
          padding: '11px 18px', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
        }}>✏️ Профайлаа засах</button>
      </div>

      {/* ── Hero banner ── */}
      <div style={{
        position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 16,
        background: 'radial-gradient(120% 140% at 80% 10%, #4c2a8c 0%, #2a1a52 50%, #1a1038 100%)',
        border: '1px solid rgba(150,120,230,0.18)', padding: '28px 30px',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(1.5px 1.5px at 20% 30%, #fff, transparent),radial-gradient(1px 1px at 70% 20%, #fff, transparent),radial-gradient(1.5px 1.5px at 85% 60%, #fcd34d, transparent),radial-gradient(1px 1px at 40% 70%, #fff, transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 116, height: 116, borderRadius: '50%', flexShrink: 0,
            background: `radial-gradient(circle at 40% 35%, ${clrHex}, #4c1d95)`,
            border: '3px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 60, boxShadow: `0 0 50px ${clrHex}55`,
          }}>{emoji}</div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{user.username}</span>
              <span style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#fff', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 900 }}>Pro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14 }}>@{(user.username || '').toLowerCase().replace(/\s+/g, '.')}</span>
              <span className="pf-muted" style={{ fontSize: 13 }}>📍 Монгол улс</span>
            </div>
            {/* Level progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 420 }}>
              <span style={{ background: 'rgba(167,139,250,0.18)', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd', borderRadius: 8, padding: '4px 12px', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>Level {lvl.level}</span>
              <div style={{ flex: 1, height: 9, background: 'rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#a855f7,#7c3aed)', borderRadius: 8, boxShadow: '0 0 10px rgba(168,85,247,0.6)' }} />
              </div>
              <span className="pf-muted" style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{lvl.current} / {lvl.needed} XP</span>
            </div>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 26, flexShrink: 0 }}>
            {[
              { icon: '🔥', val: stats?.streak || 0, label: 'өдрийн цуваа' },
              { icon: '⭐', val: xp, label: 'нийт XP' },
              { icon: '🏆', val: `Lv.${lvl.level}`, label: 'түвшин' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{s.val}</div>
                <div className="pf-muted" style={{ fontSize: 11, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
        {[
          { icon: '💎', val: wordCount, label: 'Суралцсан үг', c: '#a855f7' },
          { icon: '✅', val: knownCount, label: 'Мэддэг болсон', c: '#22c55e' },
          { icon: '🔄', val: dueCount, label: 'Давтах шаардлагатай', c: '#f59e0b' },
          { icon: '📅', val: daysLearned, label: 'Суралцсан өдөр', c: '#38bdf8' },
        ].map((s, i) => (
          <div key={i} className="pf-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: `${s.c}22`, border: `1.5px solid ${s.c}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.val}</div>
              <div className="pf-muted" style={{ fontSize: 12, fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Skill radar */}
        <div className="pf-card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 16, color: '#fff', marginBottom: 8 }}>Ур чадварын түвшин</h3>
          <SkillRadar skills={skills} level={lvl.level} />
        </div>

        {/* Achievements */}
        <div className="pf-card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 16, color: '#fff', marginBottom: 16 }}>Шагналууд</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: '📅', name: '7 өдрийн цуваа', got: (stats?.streak || 0) >= 7, c: '#f59e0b' },
              { icon: '🎯', name: '100 үг нэмсэн', got: wordCount >= 100, c: '#ef4444' },
              { icon: '🎮', name: 'Тоглоомчин', got: true, c: '#38bdf8' },
              { icon: '⚡', name: 'Хурдны мастер', got: lvl.level >= 3, c: '#a855f7' },
            ].map((a, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 10px',
                background: a.got ? `${a.c}1a` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${a.got ? a.c + '44' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 14, opacity: a.got ? 1 : 0.45, textAlign: 'center',
              }}>
                <div style={{ fontSize: 30, filter: a.got ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: a.got ? '#fff' : '#9486c4' }}>{a.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: goal + game records + friends ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Learning goal */}
        <div className="pf-card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff', marginBottom: 16 }}>Хэл сурах зорилго</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 40 }}>🎯</div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>HSK {Math.min(6, lvl.level)} түвшний</div>
              <div className="pf-muted" style={{ fontSize: 13 }}>1000 үг цээжлэх болно!</div>
            </div>
          </div>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${Math.min((wordCount / 1000) * 100, 100)}%`, background: 'linear-gradient(90deg,#a855f7,#7c3aed)', borderRadius: 8 }} />
          </div>
          <div className="pf-muted" style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{wordCount} / 1000 үг · {Math.round((wordCount / 1000) * 100)}%</div>
        </div>

        {/* Game records */}
        <div className="pf-card" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff', marginBottom: 16 }}>Тоглоомын амжилт</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '🎯', name: 'Үг таах', c: '#a855f7' },
              { icon: '⚡', name: 'Хурдтай хариулт', c: '#38bdf8' },
              { icon: '🔗', name: 'Холбож сурах', c: '#22c55e' },
              { icon: '🧠', name: 'Санамж', c: '#ef4444' },
            ].map((g, i) => (
              <div key={i} style={{ background: `${g.c}14`, border: `1.5px solid ${g.c}33`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>{g.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginTop: 4 }}>{g.name}</div>
              </div>
            ))}
          </div>
          <Link href="/games" style={{ display: 'block', textAlign: 'center', marginTop: 14, color: '#a78bfa', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>Тоглоом тоглох →</Link>
        </div>

        {/* Friends / leaderboard */}
        <div className="pf-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>Найзууд</h3>
            <Link href="/social" style={{ color: '#a78bfa', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>Бүгдийг харах</Link>
          </div>
          {lb.length === 0 ? (
            <p className="pf-muted" style={{ fontSize: 13, textAlign: 'center', padding: '10px 0' }}>Өгөгдөл байхгүй</p>
          ) : lb.map((e, i) => {
            const isMe = e.id === user.id;
            return (
              <div key={e.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 10, marginBottom: 3, background: isMe ? 'rgba(168,85,247,0.14)' : 'transparent' }}>
                <span style={{ width: 18, fontWeight: 800, color: '#9486c4', fontSize: 13 }}>{i + 1}</span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(168,85,247,0.2)', border: '1.5px solid rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{e.avatarEmoji || e.username?.[0]?.toUpperCase()}</div>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: isMe ? '#c4b5fd' : '#fff' }}>{e.username}{isMe ? ' (та)' : ''}</span>
                <span style={{ fontWeight: 800, fontSize: 12, color: '#a78bfa' }}>{e.xp} XP</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout} style={{
        marginTop: 18, background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.3)',
        color: '#fca5a5', borderRadius: 12, padding: '12px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
      }}>← Гарах</button>

      {/* ── Edit modal ── */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,2,15,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(false); }}>
          <div className="pf-card" style={{ width: '100%', maxWidth: 440, padding: '28px 30px' }}>
            <h2 style={{ fontWeight: 900, fontSize: 19, color: '#fff', marginBottom: 20 }}>Профайл засах</h2>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="pf-muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Нэр</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(150,120,230,0.25)', color: '#fff' }} />
              </div>
              <div>
                <label className="pf-muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>И-мэйл</label>
                <input type="email" value={emailV} onChange={e => setEmailV(e.target.value)} placeholder="name@example.com"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(150,120,230,0.25)', color: '#fff' }} />
              </div>
              <div>
                <label className="pf-muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Утасны дугаар</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="9900-0000"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(150,120,230,0.25)', color: '#fff' }} />
              </div>
              <div>
                <label className="pf-muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Avatar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EMOJIS.map(em => (
                    <button type="button" key={em} onClick={() => setEmoji(em)} style={{
                      fontSize: 22, borderRadius: 11, padding: '6px 9px', cursor: 'pointer',
                      border: `1.5px solid ${emoji === em ? clrHex + '88' : 'rgba(255,255,255,0.08)'}`,
                      background: emoji === em ? clrHex + '22' : 'rgba(255,255,255,0.03)', fontFamily: 'inherit',
                    }}>{em}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="pf-muted" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Өнгө</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {COLORS.map(c => (
                    <button type="button" key={c.name} onClick={() => setColor(c.name)} style={{
                      width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', background: c.hex,
                      border: color === c.name ? '3px solid #fff' : '2px solid transparent',
                      boxShadow: color === c.name ? `0 0 14px ${c.hex}88` : 'none',
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#c4b5fd', borderRadius: 12, padding: '12px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Болих</button>
                <button type="submit" disabled={saving} className="btn btn-purple" style={{ flex: 1 }}>{saving ? 'Хадгалж байна...' : 'Хадгалах'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Skill radar (pentagon) ── */
function SkillRadar({ skills, level }) {
  const size = 230, cx = size / 2, cy = size / 2 + 6, R = 78;
  const n = skills.length;
  const angle = i => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const dataPts = skills.map((s, i) => point(i, (s.val / 100) * R));
  const polyStr = pts => pts.map(p => p.join(',')).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size + 30}>
        {/* grid rings */}
        {[0.25, 0.5, 0.75, 1].map((f, k) => (
          <polygon key={k} points={polyStr(skills.map((_, i) => point(i, R * f)))} fill="none" stroke="rgba(150,120,230,0.18)" strokeWidth="1" />
        ))}
        {/* spokes */}
        {skills.map((_, i) => { const [x, y] = point(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(150,120,230,0.15)" strokeWidth="1" />; })}
        {/* data */}
        <polygon points={polyStr(dataPts)} fill="rgba(168,85,247,0.35)" stroke="#a855f7" strokeWidth="2" />
        {dataPts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#c4b5fd" />)}
        {/* center level */}
        <circle cx={cx} cy={cy} r="22" fill="rgba(124,58,237,0.5)" stroke="#a855f7" strokeWidth="1.5" />
        <text x={cx} y={cy - 2} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">LV.</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="900">{level}</text>
        {/* labels */}
        {skills.map((s, i) => {
          const [x, y] = point(i, R + 26);
          return (
            <g key={i}>
              <text x={x} y={y - 3} textAnchor="middle" fill="#cbb9f5" fontSize="11" fontWeight="700">{s.label}</text>
              <text x={x} y={y + 11} textAnchor="middle" fill="#9486c4" fontSize="11" fontWeight="800">{s.val}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
