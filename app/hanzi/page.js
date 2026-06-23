'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import HanziTracer from '@/components/HanziTracer';
import SECTIONS from '@/lib/hanziSections';

export default function HanziPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  // 'sections' | 'practice'
  const [view, setView]           = useState('sections');
  const [activeSection, setSection] = useState(null);
  const [charIndex, setCharIndex] = useState(0);
  const [completed, setCompleted] = useState([]); // зурж дууссан chars
  const [sessionStats, setStats]  = useState({ correct: 0, mistakes: 0 });

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  function startSection(section) {
    setSection(section);
    setCharIndex(0);
    setCompleted([]);
    setStats({ correct: 0, mistakes: 0 });
    setView('practice');
  }

  function handleComplete({ char, mistakes }) {
    setCompleted(prev => [...prev, char]);
    setStats(s => ({ correct: s.correct + (mistakes === 0 ? 1 : 0), mistakes: s.mistakes + mistakes }));
  }

  function next() {
    if (!activeSection) return;
    if (charIndex + 1 >= activeSection.chars.length) {
      setView('done');
    } else {
      setCharIndex(i => i + 1);
    }
  }

  if (authLoad) return null;

  // ── ДУУССАН ДЭЛГЭЦ ──────────────────────────────────────────
  if (view === 'done') return (
    <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 12 }}>🏆</div>
      <h2 style={{ fontWeight: 900, fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>
        Бүгдийг дуусгалаа!
      </h2>
      <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 24 }}>
        {activeSection?.titleMn} — {activeSection?.chars.length} тэмдэгт
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>⭐ {sessionStats.correct}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Алдаагүй</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--red)' }}>❌ {sessionStats.mistakes}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Нийт алдаа</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-green" onClick={() => startSection(activeSection)}>
          ↺ Дахин хийх
        </button>
        <button className="btn btn-outline" onClick={() => setView('sections')}>
          Буцах
        </button>
      </div>
    </div>
  );

  // ── ЗУРАХ ДАСГАЛ ─────────────────────────────────────────────
  if (view === 'practice' && activeSection) {
    const char    = activeSection.chars[charIndex];
    const total   = activeSection.chars.length;
    const isDone  = completed.includes(char);

    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setView('sections')} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--muted)',
          }}>✕</button>
          <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--green)', borderRadius: 10,
              width: `${(completed.length / total) * 100}%`, transition: 'width 0.4s',
            }} />
          </div>
          <span style={{ fontWeight: 800, color: 'var(--muted)', fontSize: 13 }}>
            {completed.length}/{total}
          </span>
        </div>

        {/* Заавар */}
        <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>
          Ханзийг зур
        </h2>
        <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 24, fontSize: 15 }}>
          Зураасын дарааллыг дагаж зур
        </p>

        {/* Трасер */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <HanziTracer
            key={char}
            char={char}
            size={300}
            onComplete={handleComplete}
          />
        </div>

        {/* Үсгийн мэдээлэл */}
        <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 48, fontWeight: 900 }}>{char}</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            {activeSection.chars.map((c, i) => (
              <span key={c} style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 13, fontWeight: 900,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: completed.includes(c) ? 'var(--green-bg)' : i === charIndex ? 'var(--blue-light)' : 'var(--bg-alt)',
                border: `2px solid ${completed.includes(c) ? 'var(--green)' : i === charIndex ? 'var(--blue)' : 'var(--border)'}`,
                color: completed.includes(c) ? 'var(--green)' : i === charIndex ? 'var(--blue)' : 'var(--muted)',
              }}>{c}</span>
            ))}
          </div>
        </div>

        {/* CONTINUE товч */}
        <button
          className={`btn ${isDone ? 'btn-green' : 'btn-outline'}`}
          onClick={next}
          disabled={!isDone}
          style={{ width: '100%', fontSize: 16 }}
        >
          {charIndex + 1 >= total ? 'ДУУСГАХ' : 'ҮРГЭЛЖЛҮҮЛЭХ'}
        </button>
      </div>
    );
  }

  // ── SECTION ЖАГСААЛТ ─────────────────────────────────────────
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>汉 Ханзи зурах</h1>
      <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 24 }}>
        Зураасын зөв дарааллыг дагаж Хятад тэмдэгт зурж сурна
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {SECTIONS.map(section => (
          <button key={section.id} onClick={() => startSection(section)} style={{
            background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: 18,
            padding: 18, textAlign: 'left', cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1CB0F6'; e.currentTarget.style.boxShadow = '0 2px 12px #1CB0F620'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {section.chars.slice(0, 6).map(c => (
                <span key={c} style={{
                  fontSize: 22, fontWeight: 900, width: 36, height: 36,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-alt)', borderRadius: 8,
                }}>{c}</span>
              ))}
              {section.chars.length > 6 && (
                <span style={{
                  fontSize: 12, fontWeight: 800, color: 'var(--muted)',
                  width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>+{section.chars.length - 6}</span>
              )}
            </div>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{section.titleMn}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
              {section.chars.length} тэмдэгт
            </div>
            <div style={{
              marginTop: 12, background: 'var(--blue)', color: '#fff',
              borderRadius: 10, padding: '8px 0', textAlign: 'center',
              fontWeight: 900, fontSize: 13, borderBottom: '3px solid var(--blue-dark)',
            }}>
              ✏️ Зурах дасгал
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
