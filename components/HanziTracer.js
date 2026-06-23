'use client';
import { useEffect, useRef, useState } from 'react';

export default function HanziTracer({ char, onComplete, size = 280 }) {
  const containerRef  = useRef(null);
  const writerRef     = useRef(null);
  const [status, setStatus]     = useState('idle');   // idle | animating | quiz | done
  const [mistakes, setMistakes] = useState(0);
  const [strokes, setStrokes]   = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!char || !containerRef.current) return;
    setStatus('idle');
    setMistakes(0);
    setStrokes({ done: 0, total: 0 });

    // Хуучин writer-г устгана
    if (writerRef.current) {
      try { writerRef.current.cancelQuiz(); } catch {}
      containerRef.current.innerHTML = '';
    }

    let cancelled = false;

    async function init() {
      const HanziWriter = (await import('hanzi-writer')).default;

      const writer = HanziWriter.create(containerRef.current, char, {
        width: size,
        height: size,
        padding: 20,
        showOutline: true,
        strokeColor: '#4C1D95',
        outlineColor: '#DDD6FE',
        drawingColor: '#7C3AED',
        drawingWidth: 4,
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 250,
      });

      if (cancelled) return;
      writerRef.current = writer;

      // Нийт зураасын тоог мэдэх
      writer.getCharacterData().then?.(data => {
        if (data?.strokes) setStrokes(s => ({ ...s, total: data.strokes.length }));
      }).catch(() => {});

      setStatus('animating');
      writer.animateCharacter({
        onComplete: () => {
          if (!cancelled) setStatus('quiz');
        },
      });
    }

    init().catch(console.error);
    return () => { cancelled = true; };
  }, [char, size]);

  useEffect(() => {
    if (status !== 'quiz' || !writerRef.current) return;

    writerRef.current.quiz({
      onMistake: () => {
        setMistakes(m => m + 1);
      },
      onCorrectStroke: (data) => {
        setStrokes({ done: data.strokesRemaining === 0 ? data.totalStrokes : data.totalStrokes - data.strokesRemaining, total: data.totalStrokes });
      },
      onComplete: (summary) => {
        setStatus('done');
        onComplete?.({ char, mistakes: summary.totalMistakes });
      },
    });
  }, [status]);

  function replay() {
    if (!writerRef.current) return;
    setMistakes(0);
    setStatus('animating');
    writerRef.current.cancelQuiz();
    writerRef.current.animateCharacter({
      onComplete: () => setStatus('quiz'),
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

      {/* Canvas area */}
      <div style={{ position: 'relative' }}>
        {/* Grid background — Duolingo-н нэгэн адил */}
        <svg
          width={size} height={size}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          {/* Дөрвөн хэсэгт хуваах шугам */}
          <line x1={size/2} y1={0} x2={size/2} y2={size} stroke="#E5E5E5" strokeWidth={1} strokeDasharray="6,4" />
          <line x1={0} y1={size/2} x2={size} y2={size/2} stroke="#E5E5E5" strokeWidth={1} strokeDasharray="6,4" />
          {/* Гадна хүрээ */}
          <rect x={1} y={1} width={size-2} height={size-2} fill="none" stroke="#E5E5E5" strokeWidth={2} rx={16} />
        </svg>

        {/* hanzi-writer container */}
        <div
          ref={containerRef}
          style={{
            width: size, height: size,
            borderRadius: 16,
            cursor: status === 'quiz' ? 'crosshair' : 'default',
          }}
        />

        {/* Overlay товчлуур */}
        {status === 'done' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            background: 'rgba(237,255,215,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 56 }}>🎉</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#58CC02' }}>Зөв!</span>
          </div>
        )}
      </div>

      {/* Status + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 40 }}>
        {status === 'animating' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--blue)', fontWeight: 700 }}>
            <span style={{ fontSize: 18 }}>▶</span> Зураас харуулж байна...
          </div>
        )}

        {status === 'quiz' && (
          <>
            <div style={{
              background: 'var(--blue-light)', border: '2px solid var(--blue)',
              borderRadius: 12, padding: '8px 16px', fontWeight: 800, color: 'var(--blue)', fontSize: 14,
            }}>
              ✏️ Та зурна уу
            </div>
            {mistakes > 0 && (
              <div style={{ color: 'var(--red)', fontWeight: 800, fontSize: 14 }}>
                ❌ {mistakes} алдаа
              </div>
            )}
            <button onClick={replay} style={{
              background: 'none', border: '2px solid var(--border)', borderRadius: 10,
              padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--muted)',
            }}>
              ↺ Дахин харах
            </button>
          </>
        )}

        {status === 'done' && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: 15 }}>
              {mistakes === 0 ? '⭐ Алдаагүй!' : `${mistakes} алдаатай дууслаа`}
            </span>
            <button onClick={replay} style={{
              background: 'none', border: '2px solid var(--border)', borderRadius: 10,
              padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--muted)',
            }}>
              ↺ Дахин зурах
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
