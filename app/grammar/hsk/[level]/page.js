'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import GRAMMAR from '@/lib/grammarData';

const COLORS = {
  1: { color: '#58CC02', bg: '#EDFFD7', shadow: '#46A800' },
  2: { color: '#1CB0F6', bg: '#DFF4FF', shadow: '#0099D4' },
  3: { color: '#CE82FF', bg: '#F4F0FF', shadow: '#A560E8' },
};

export default function HskGrammarPage({ params }) {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const level   = parseInt(params.level);
  const { color, bg } = COLORS[level] || COLORS[1];
  const lessons = GRAMMAR[level] || [];

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  if (authLoad) return null;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/grammar" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <div style={{ background: bg, border: `2px solid ${color}`, borderRadius: 12, padding: '6px 16px' }}>
          <span style={{ color, fontWeight: 900, fontSize: 15 }}>HSK {level} · Дүрмийн тайлбар</span>
        </div>
        <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>{lessons.length} дүрэм</span>
      </div>

      {/* Rules list — explanations only */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {lessons.map((ls, i) => (
          <div key={ls.id} className="card">
            {/* title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: color + '22', border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color, flexShrink: 0,
              }}>{i + 1}</div>
              <h3 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)' }}>{ls.title}</h3>
            </div>

            {/* pattern */}
            <div style={{ background: bg, border: `1.5px solid ${color}`, borderRadius: 12, padding: '10px 16px', marginBottom: 14 }}>
              <span style={{ fontWeight: 900, color, fontSize: 15 }}>{ls.pattern}</span>
            </div>

            {/* explanation */}
            <p style={{ color: 'var(--text-sub)', fontWeight: 500, lineHeight: 1.65, marginBottom: 16, fontSize: 14.5 }}>{ls.explanation}</p>

            {/* examples */}
            <h4 style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)', letterSpacing: 0.5, marginBottom: 10 }}>ЖИШЭЭ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ls.examples.map((ex, k) => (
                <div key={k} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '12px 16px', borderLeft: `3px solid ${color}` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{ex.zh}</div>
                  <div style={{ color, fontWeight: 700, marginTop: 3, fontSize: 14 }}>{ex.py}</div>
                  <div style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 2, fontSize: 13.5 }}>{ex.mn}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Link href="/grammar" style={{
        display: 'block', textAlign: 'center', marginTop: 22, color, fontWeight: 800,
        fontSize: 14, textDecoration: 'none',
      }}>← Бусад түвшин харах</Link>
    </div>
  );
}
