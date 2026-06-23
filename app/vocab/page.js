'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

export default function VocabPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [words, setWords]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [front, setFront]     = useState('');
  const [back, setBack]       = useState('');
  const [hint, setHint]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [deleting, setDel]    = useState(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/words');
      setWords(data);
    } catch {}
    setLoading(false);
  }

  async function addWord(e) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post('/api/words', { front, back, hint });
      setWords(prev => [data, ...prev]);
      setFront(''); setBack(''); setHint(''); setShowAdd(false);
    } catch {}
    setSaving(false);
  }

  async function deleteWord(id) {
    setDel(id);
    try {
      await api.delete(`/api/words/${id}`);
      setWords(prev => prev.filter(w => w.id !== id));
    } catch {}
    setDel(null);
  }

  const filtered = words.filter(w =>
    !search || w.front.includes(search) || w.back.toLowerCase().includes(search.toLowerCase()) || (w.hint || '').toLowerCase().includes(search.toLowerCase())
  );

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ padding: '28px 28px 40px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.5 }}>Үгийн сан</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>{words.length} үг нэмэгдсэн</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/vocab/practice" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: 13, padding: '10px 18px' }}>
            🃏 Давтах
          </Link>
          <button className="btn btn-purple" onClick={() => setShowAdd(s => !s)} style={{ fontSize: 13, padding: '10px 18px' }}>
            {showAdd ? '✕ Болих' : '+ Нэмэх'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card anim-scale" style={{ marginBottom: 20, border: '1px solid rgba(155,109,255,0.25)' }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#EDE9FF' }}>Шинэ үг нэмэх</h3>
          <form onSubmit={addWord} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Хятад үг
                </label>
                <input type="text" value={front} onChange={e => setFront(e.target.value)}
                  placeholder="жш: 你好" required style={{ fontSize: 18 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Монгол утга
                </label>
                <input type="text" value={back} onChange={e => setBack(e.target.value)}
                  placeholder="жш: Сайн уу" required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                Дуудлага / санамж
              </label>
              <input type="text" value={hint} onChange={e => setHint(e.target.value)}
                placeholder="жш: nǐ hǎo" />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" className="btn btn-purple" disabled={saving} style={{ flex: 1, fontSize: 14 }}>
                {saving ? 'Нэмж байна...' : '+ Нэмэх'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)} style={{ padding: '11px 20px', fontSize: 14 }}>
                Болих
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Үг хайх..." style={{ paddingLeft: 42 }} />
      </div>

      {/* Words list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 52 }}>
          <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.5 }}>📭</div>
          <p style={{ fontWeight: 700, color: 'var(--muted)', fontSize: 14 }}>
            {search ? 'Хайлтад тохирох үг олдсонгүй' : 'Үг байхгүй байна. Нэмж эхлэцгээе!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(w => (
            <div key={w.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 18, padding: '16px 20px',
              transition: 'all 0.15s', cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(155,109,255,0.2)'; e.currentTarget.style.background = 'rgba(155,109,255,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              {/* Chinese character */}
              <div style={{
                fontSize: 34, fontWeight: 900, lineHeight: 1,
                background: 'linear-gradient(135deg, #EDE9FF, #C4AAFF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', minWidth: 50, textAlign: 'center',
              }}>
                {w.front}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#EDE9FF', marginBottom: 2 }}>{w.back}</div>
                {w.hint && (
                  <div style={{ color: '#9B6DFF', fontSize: 13, fontWeight: 600 }}>{w.hint}</div>
                )}
              </div>

              {/* SRS info */}
              {w.nextReview && (
                <div style={{
                  fontSize: 11, color: 'var(--muted)', fontWeight: 700,
                  background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '4px 10px',
                }}>
                  {new Date(w.nextReview) < new Date() ? '🔴 Давтах' : `📅 ${new Date(w.nextReview).toLocaleDateString('mn-MN')}`}
                </div>
              )}

              {/* Delete */}
              <button onClick={() => deleteWord(w.id)} disabled={deleting === w.id} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: deleting === w.id ? 'var(--muted)' : 'rgba(248,113,113,0.45)',
                fontSize: 16, padding: '6px', borderRadius: 8, transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,113,113,0.45)'; e.currentTarget.style.background = 'none'; }}
              >
                {deleting === w.id ? '...' : '🗑'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
