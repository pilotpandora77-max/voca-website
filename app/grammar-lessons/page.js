'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import LESSONS, { CEFR, lessonsByLevel } from '@/lib/grammarEn';

export default function GrammarLessonsPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [prog, setProg]     = useState({});

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
    try { setProg(JSON.parse(localStorage.getItem('voca_grammar_prog') || '{}')); } catch {}
  }, [authLoad, user]);

  if (authLoad) return null;

  function pctOf(id) {
    const p = prog[id] || {};
    let done = 0;
    if (p.read) done++; if (p.practice) done++; if ((p.quiz || 0) >= 60) done++; if (p.note) done++;
    return Math.round((done / 4) * 100);
  }

  const learned = LESSONS.filter(l => pctOf(l.id) >= 75).length;
  const avgAcc = 83;

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Дүрмийн хичээл 📘" subtitle="CEFR түвшинд тулгуурласан Англи хэлний дүрмийн хичээлүүд" streak={streak} />

      <div style={{ padding: '0 28px', maxWidth: 1000, margin: '0 auto' }}>
        {/* Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[['Эзэмшсэн дүрэм', `${learned} / ${LESSONS.length}`, '#7C3AED', '📚'], ['Дундаж нарийвчлал', `${avgAcc}%`, '#22C55E', '🎯'], ['Одоогийн түвшин', 'A1–B1', '#38BDF8', '📈']].map(([l, v, c, ic]) => (
            <div key={l} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{ic}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 3 }}>{l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Levels */}
        {CEFR.map(lv => {
          const lessons = lessonsByLevel(lv.level);
          if (lessons.length === 0) return null;
          return (
            <div key={lv.level} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: lv.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span style={{ fontSize: 14, fontWeight: 900, lineHeight: 1 }}>{lv.level}</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: lv.color, textTransform: 'uppercase', letterSpacing: 0.6 }}>{lv.name}</div>
                  <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)' }}>{lessons.length} дүрэм</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
                {lessons.map((l, i) => {
                  const pct = pctOf(l.id);
                  return (
                    <Link key={l.id} href={`/grammar-lessons/${l.id}`} style={{ textDecoration: 'none', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: '16px', transition: 'all 0.15s', display: 'block' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = lv.color + '66'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${lv.color}1A`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${lv.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: lv.color }}>{l.icon}</div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: lv.color, background: `${lv.color}18`, borderRadius: 6, padding: '2px 7px' }}>{l.level}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>{l.title}</div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4, marginBottom: 12, minHeight: 34 }}>{l.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-alt)', borderRadius: 6, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: lv.color, borderRadius: 6 }} /></div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: pct > 0 ? lv.color : 'var(--muted)' }}>{pct}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
