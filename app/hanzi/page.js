'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import HanziTracer from '@/components/HanziTracer';
import SECTIONS from '@/lib/hanziSections';

export default function HanziPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  const [view, setView]             = useState('sections');
  const [activeSection, setSection] = useState(null);
  const [charIndex, setCharIndex]   = useState(0);
  const [completed, setCompleted]   = useState([]);
  const [sessionStats, setStats]    = useState({ correct: 0, mistakes: 0 });

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

  // Done screen
  if (view === 'done') return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '60px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16, animation: 'float 3s ease infinite' }}>🏆</div>
      <h2 style={{
        fontWeight: 900, fontSize: 28, marginBottom: 8,
        background: 'linear-gradient(135deg, #F59E0B, #FF6B9D)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Бүгдийг дуусгалаа!
      </h2>
      <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 28, fontSize: 14 }}>
        {activeSection?.titleMn} · {activeSection?.chars.length} тэмдэгт
      </p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 28 }}>
        <div style={{
          flex: 1, maxWidth: 140, padding: '20px 16px', textAlign: 'center', borderRadius: 18,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
        }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#22C55E' }}>⭐ {sessionStats.correct}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 12, marginTop: 4 }}>Алдаагүй</div>
        </div>
        <div style={{
          flex: 1, maxWidth: 140, padding: '20px 16px', textAlign: 'center', borderRadius: 18,
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
        }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#F87171' }}>✕ {sessionStats.mistakes}</div>
          <div style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 12, marginTop: 4 }}>Нийт алдаа</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-purple" onClick={() => startSection(activeSection)} style={{ padding: '12px 24px', fontSize: 14 }}>
          ↺ Дахин хийх
        </button>
        <button className="btn btn-ghost" onClick={() => setView('sections')} style={{ padding: '12px 24px', fontSize: 14 }}>
          Буцах
        </button>
      </div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );

  // Practice screen
  if (view === 'practice' && activeSection) {
    const char   = activeSection.chars[charIndex];
    const total  = activeSection.chars.length;
    const isDone = completed.includes(char);

    return (
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '28px 28px 40px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button onClick={() => setView('sections')} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, cursor: 'pointer', fontSize: 16, color: 'var(--muted)',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EDE9FF'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}
          >
            ✕
          </button>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #9B6DFF, #22C55E)',
              borderRadius: 10,
              width: `${(completed.length / total) * 100}%`,
              transition: 'width 0.4s ease',
              boxShadow: '0 0 10px rgba(155,109,255,0.5)',
            }} />
          </div>
          <span style={{
            fontSize: 13, fontWeight: 800, color: 'var(--muted)',
            background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '4px 10px',
          }}>
            {completed.length}/{total}
          </span>
        </div>

        <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 4, color: '#EDE9FF' }}>
          Ханзийг зур
        </h2>
        <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 24, fontSize: 14 }}>
          Зураасын дарааллыг дагаж зурна уу
        </p>

        {/* Tracer */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 24,
          background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20,
          border: '1px solid rgba(155,109,255,0.15)',
        }}>
          <HanziTracer key={char} char={char} size={280} onComplete={handleComplete} />
        </div>

        {/* Character dots */}
        <div className="card" style={{ textAlign: 'center', marginBottom: 20, padding: '18px 20px' }}>
          <span style={{
            fontSize: 44, fontWeight: 900,
            background: 'linear-gradient(135deg, #EDE9FF, #C4AAFF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {char}
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {activeSection.chars.map((c, i) => (
              <div key={c} style={{
                width: 32, height: 32, borderRadius: '50%', fontSize: 14, fontWeight: 900,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: completed.includes(c)
                  ? 'rgba(34,197,94,0.15)'
                  : i === charIndex ? 'rgba(155,109,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${completed.includes(c) ? 'rgba(34,197,94,0.4)' : i === charIndex ? 'rgba(155,109,255,0.45)' : 'rgba(255,255,255,0.08)'}`,
                color: completed.includes(c) ? '#22C55E' : i === charIndex ? '#9B6DFF' : 'var(--muted)',
                transition: 'all 0.2s',
              }}>
                {c}
              </div>
            ))}
          </div>
        </div>

        <button
          className={`btn ${isDone ? 'btn-green' : 'btn-ghost'}`}
          onClick={next}
          disabled={!isDone}
          style={{ width: '100%', fontSize: 15, padding: '13px 22px' }}
        >
          {charIndex + 1 >= total ? 'Дуусгах ✓' : 'Үргэлжлүүлэх →'}
        </button>
      </div>
    );
  }

  // Sections list
  return (
    <div style={{ padding: '28px 28px 40px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.5, marginBottom: 6 }}>
          汉 Ханзи зурах
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          Зураасын зөв дарааллыг дагаж Хятад тэмдэгт зурж сур
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {SECTIONS.map((section, idx) => {
          const gradients = [
            'linear-gradient(135deg, #9B6DFF, #7B4FE0)',
            'linear-gradient(135deg, #38BDF8, #0EA5E9)',
            'linear-gradient(135deg, #22C55E, #16A34A)',
            'linear-gradient(135deg, #F59E0B, #D97706)',
            'linear-gradient(135deg, #F87171, #DC2626)',
            'linear-gradient(135deg, #00C6AE, #009688)',
          ];
          const grad = gradients[idx % gradients.length];

          return (
            <button key={section.id} onClick={() => startSection(section)} style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: 18, textAlign: 'left', cursor: 'pointer',
              transition: 'all 0.18s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(155,109,255,0.25)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(155,109,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = ''; }}
            >
              {/* Chars preview */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {section.chars.slice(0, 6).map(c => (
                  <div key={c} style={{
                    fontSize: 20, fontWeight: 900, width: 36, height: 36,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.04)', borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                    color: '#EDE9FF',
                  }}>{c}</div>
                ))}
                {section.chars.length > 6 && (
                  <div style={{
                    fontSize: 11, fontWeight: 800, color: 'var(--muted)',
                    width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    +{section.chars.length - 6}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 900, fontSize: 15, color: '#EDE9FF', marginBottom: 4 }}>
                {section.titleMn}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
                {section.chars.length} тэмдэгт
              </div>
              <div style={{
                borderRadius: 10, padding: '9px 0', fontSize: 12, fontWeight: 800,
                background: grad, color: '#fff', textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}>
                ✏️ Зурах дасгал
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
