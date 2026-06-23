'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const QUALITY = [
  { q: 1, label: 'ДАХИН',   color: '#FF4B4B', bg: '#FFE0E0', border: '#FF4B4B' },
  { q: 3, label: 'ХЭЦҮҮ',   color: '#FF9600', bg: '#FFF0C0', border: '#FF9600' },
  { q: 5, label: 'АМАРХАН', color: '#58CC02', bg: '#EDFFD7', border: '#58CC02' },
];

export default function VocabPracticePage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [cards, setCards]       = useState([]);
  const [current, setCurrent]   = useState(null);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [done, setDone]         = useState(false);

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ fontSize: 40 }}>⏳</div>
    </div>
  );

  const progress = cards.length > 0 && current
    ? cards.findIndex(c => c.id === current.id) / cards.length
    : 1;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/vocab" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 20, fontWeight: 900 }}>🃏 Карт давтах</h1>
        {cards.length > 0 && (
          <span style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--muted)', fontSize: 14 }}>
            {cards.length} карт үлдсэн
          </span>
        )}
      </div>

      {done ? (
        <div className="card" style={{
          textAlign: 'center', padding: 48,
          background: 'var(--green-bg)', border: '2px solid var(--green)',
        }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontWeight: 900, fontSize: 24, color: 'var(--green)', marginBottom: 8 }}>Маш сайн!</h2>
          <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 24 }}>Өнөөдрийн давталт дууслаа</p>
          <Link href="/vocab" className="btn btn-green" style={{ textDecoration: 'none' }}>
            Буцах
          </Link>
        </div>
      ) : current ? (
        <div className="card">
          <div style={{ height: 10, background: 'var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ height: '100%', background: 'var(--green)', borderRadius: 10,
              width: `${Math.max(progress * 100, 4)}%`, transition: 'width 0.3s' }} />
          </div>

          <div style={{
            background: 'var(--bg-alt)', borderRadius: 16, border: '2px solid var(--border)',
            padding: '48px 20px', textAlign: 'center', marginBottom: 24, minHeight: 180,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 88, fontWeight: 900, lineHeight: 1 }}>{current.front}</span>
            {current.hint && <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16 }}>{current.hint}</span>}
          </div>

          {!showBack ? (
            <button className="btn btn-blue" onClick={() => setShowBack(true)} style={{ width: '100%', fontSize: 16 }}>
              ХАРИУЛТ ХАРАХ
            </button>
          ) : (
            <>
              <div style={{
                background: 'var(--green-bg)', border: '2px solid var(--green)', borderRadius: 14,
                padding: 20, textAlign: 'center', marginBottom: 20,
              }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{current.back}</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textAlign: 'center', marginBottom: 12, letterSpacing: 0.8 }}>
                ХЭР САЙН САНАСАН БЭ?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {QUALITY.map(({ q, label, color, bg, border }) => (
                  <button key={q} onClick={() => review(q)} style={{
                    flex: 1, borderRadius: 14, border: `2.5px solid ${border}`,
                    background: bg, color, fontWeight: 900, fontSize: 14,
                    padding: 14, cursor: 'pointer',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
