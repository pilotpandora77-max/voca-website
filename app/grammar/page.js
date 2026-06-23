'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import GRAMMAR from '@/lib/grammarData';

const HSK_CONFIG = [
  { level: 1, gradient: 'linear-gradient(135deg, #22C55E, #16A34A)', glow: 'rgba(34,197,94,0.25)', color: '#22C55E', label: 'Эхлэгч' },
  { level: 2, gradient: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', glow: 'rgba(56,189,248,0.25)', color: '#38BDF8', label: 'Суурь' },
  { level: 3, gradient: 'linear-gradient(135deg, #9B6DFF, #7B4FE0)', glow: 'rgba(155,109,255,0.25)', color: '#9B6DFF', label: 'Дунд' },
];

export default function GrammarPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  if (authLoad) return null;

  return (
    <div style={{ padding: '28px 28px 40px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.5, marginBottom: 6 }}>
          Хичээлүүд
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          HSK түвшинд тулгуурласан Хятад хэлний дүрмийн хичээлүүд
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {HSK_CONFIG.map(({ level, gradient, glow, color, label }) => {
          const lessons = GRAMMAR[level] || [];
          return (
            <div key={level} className="card" style={{
              border: `1px solid ${color}28`,
              background: `linear-gradient(135deg, ${color}08, transparent)`,
              boxShadow: `0 4px 32px ${glow}`,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: gradient, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 16px ${glow}`,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.8)', letterSpacing: 1 }}>HSK</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{level}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: '#EDE9FF', marginTop: 2 }}>
                      {lessons.length} сэдэв
                    </div>
                  </div>
                </div>
                <Link href={`/grammar/hsk/${level}`} style={{
                  textDecoration: 'none',
                  background: gradient,
                  color: '#fff', borderRadius: 12,
                  padding: '10px 20px', fontWeight: 800, fontSize: 13.5,
                  boxShadow: `0 4px 16px ${glow}`,
                  transition: 'filter 0.15s',
                }}>
                  Бүгдийг харах →
                </Link>
              </div>

              {/* Lesson preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lessons.slice(0, 3).map((ls, i) => (
                  <Link key={ls.id} href={`/grammar/hsk/${level}?topic=${ls.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
                    padding: '11px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}28`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: `${color}18`, border: `1.5px solid ${color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 900, color, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 700, color: '#EDE9FF', fontSize: 14, flex: 1 }}>{ls.title}</span>
                    <span style={{ color, fontWeight: 700, fontSize: 12, opacity: 0.8 }}>{ls.pattern}</span>
                  </Link>
                ))}
                {lessons.length > 3 && (
                  <Link href={`/grammar/hsk/${level}`} style={{
                    textAlign: 'center', color, fontWeight: 800, fontSize: 13,
                    textDecoration: 'none', padding: '8px 0',
                    opacity: 0.8, transition: 'opacity 0.15s',
                  }}>
                    + {lessons.length - 3} сэдэв харах
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
