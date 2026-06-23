'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import GRAMMAR from '@/lib/grammarData';

const HSK_LEVELS = [
  { level: 1, color: '#58CC02', bg: '#EDFFD7', shadow: '#46A800' },
  { level: 2, color: '#1CB0F6', bg: '#DFF4FF', shadow: '#0099D4' },
  { level: 3, color: '#CE82FF', bg: '#F4F0FF', shadow: '#A560E8' },
];

export default function GrammarPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  if (authLoad) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>📚 Дүрмийн хичээлүүд</h1>
      <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 24 }}>HSK түвшинд тулгуурласан Хятад хэлний дүрмийн хичээлүүд</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {HSK_LEVELS.map(({ level, color, bg, shadow }) => {
          const lessons = GRAMMAR[level] || [];
          return (
            <div key={level} className="card" style={{ borderColor: color, background: bg }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color, letterSpacing: 1 }}>HSK {level}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', marginTop: 2 }}>
                    {lessons.length} сэдэв
                  </div>
                </div>
                <Link href={`/grammar/hsk/${level}`} style={{
                  background: color, color: '#fff', borderRadius: 12,
                  padding: '10px 20px', fontWeight: 900, fontSize: 14,
                  textDecoration: 'none', borderBottom: `3px solid ${shadow}`,
                }}>
                  Үзэх →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lessons.slice(0, 3).map((ls, i) => (
                  <Link key={ls.id} href={`/grammar/hsk/${level}?topic=${ls.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
                    padding: '8px 12px', background: 'rgba(255,255,255,0.6)',
                    borderRadius: 10, border: `1.5px solid ${color}40`,
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', background: color + '22',
                      border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 900, color,
                    }}>{i + 1}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{ls.title}</span>
                    <span style={{ marginLeft: 'auto', color, fontWeight: 700, fontSize: 12 }}>{ls.pattern}</span>
                  </Link>
                ))}
                {lessons.length > 3 && (
                  <Link href={`/grammar/hsk/${level}`} style={{
                    textAlign: 'center', color, fontWeight: 800, fontSize: 13,
                    textDecoration: 'none', padding: '6px 0',
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
