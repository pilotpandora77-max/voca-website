'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const QUALITY = [
  { q: 1, label: 'Дахин',   icon: '↩', color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  { q: 3, label: 'Хэцүү',   icon: '😅', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  { q: 5, label: 'Амархан', icon: '⚡', color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
];

export default function VocabPracticePage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [cards, setCards]       = useState([]);
  const [current, setCurrent]   = useState(null);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [done, setDone]         = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/cards/due');
      setCards(data);
      setCurrent(data[0] || null);
      if (data.length === 0) setDone(true);
    } catch {}
    setLoading(false);
  }

  function reveal() {
    setFlipping(true);
    setTimeout(() => { setShowBack(true); setFlipping(false); }, 150);
  }

  async function review(quality) {
    if (!current) return;
    try {
      await api.patch(`/api/cards/${current.id}/review`, { quality });
      try { await api.post('/api/streak/checkin'); } catch {}
      const rest = cards.filter(c => c.id !== current.id);
      setCards(rest);
      if (rest.length === 0) { setDone(true); setCurrent(null); }
      else { setCurrent(rest[0]); setShowBack(false); }
    } catch {}
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner" />
    </div>
  );

  const progress = cards.length > 0 && current
    ? cards.findIndex(c => c.id === current.id) / cards.length
    : 1;

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 28px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <Link href="/vocab" style={{
          color: 'var(--muted)', textDecoration: 'none', fontSize: 20,
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
          transition: 'all 0.15s',
        }}>
          ←
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#EDE9FF' }}>🃏 Карт давтах</h1>
        {cards.length > 0 && (
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(155,109,255,0.12)', border: '1px solid rgba(155,109,255,0.25)',
            color: '#C4AAFF', borderRadius: 100, padding: '4px 12px', fontSize: 13, fontWeight: 800,
          }}>
            {cards.length} карт
          </span>
        )}
      </div>

      {done ? (
        <div className="card" style={{
          textAlign: 'center', padding: '52px 24px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.04))',
          border: '1px solid rgba(34,197,94,0.2)',
        }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>🎉</div>
          <h2 style={{ fontWeight: 900, fontSize: 24, color: '#22C55E', marginBottom: 8 }}>Маш сайн!</h2>
          <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 28, fontSize: 14 }}>
            Өнөөдрийн давталт бүрэн дууслаа
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/games" className="btn btn-purple" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: 14 }}>
              🎮 Тоглоомоор давтах
            </Link>
            <Link href="/vocab" className="btn btn-green" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: 14 }}>
              Үгийн сан руу буцах
            </Link>
          </div>
        </div>
      ) : current ? (
        <div className="card" style={{ border: '1px solid rgba(155,109,255,0.18)' }}>
          {/* Progress */}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #9B6DFF, #FF6B9D)',
              borderRadius: 10,
              width: `${Math.max(progress * 100, 4)}%`,
              transition: 'width 0.4s ease',
              boxShadow: '0 0 8px rgba(155,109,255,0.5)',
            }} />
          </div>

          {/* Front */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(155,109,255,0.08), rgba(255,107,157,0.05))',
            borderRadius: 18, border: '1px solid rgba(155,109,255,0.15)',
            padding: '48px 20px', textAlign: 'center', marginBottom: 20, minHeight: 190,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'opacity 0.15s', opacity: flipping ? 0 : 1,
          }}>
            <span style={{
              fontSize: 92, fontWeight: 900, lineHeight: 1,
              background: 'linear-gradient(135deg, #EDE9FF, #C4AAFF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {current.front}
            </span>
            {current.hint && (
              <span style={{ color: '#9B6DFF', fontSize: 16, fontWeight: 600 }}>{current.hint}</span>
            )}
          </div>

          {!showBack ? (
            <button className="btn btn-purple" onClick={reveal} style={{ width: '100%', padding: '14px 22px', fontSize: 15 }}>
              Хариулт харах
            </button>
          ) : (
            <div className="anim-scale">
              <div style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)',
                borderRadius: 16, padding: '18px 20px', textAlign: 'center', marginBottom: 16,
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#22C55E' }}>{current.back}</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textAlign: 'center', marginBottom: 12, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Хэр сайн санасан бэ?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {QUALITY.map(({ q, label, icon, color, bg, border }) => (
                  <button key={q} onClick={() => review(q)} style={{
                    flex: 1, borderRadius: 14, border: `1.5px solid ${border}`,
                    background: bg, color, fontWeight: 800, fontSize: 14,
                    padding: '14px 8px', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'filter 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                  >
                    <span style={{ fontSize: 18, display: 'block', marginBottom: 3 }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
