'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

export default function VocabPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [words, setWords]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [front, setFront]       = useState('');
  const [back, setBack]         = useState('');
  const [hint, setHint]         = useState('');
  const [saving, setSaving]     = useState(false);

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
    if (!confirm('Үгийг устгах уу?')) return;
    try {
      await api.delete(`/api/words/${id}`);
      setWords(prev => prev.filter(w => w.id !== id));
    } catch {}
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ fontSize: 40 }}>⏳</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>📝 Миний үгийн сан</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/vocab/practice" className="btn btn-blue" style={{ textDecoration: 'none', padding: '10px 18px', fontSize: 14 }}>
            🃏 Давтах
          </Link>
          <button className="btn btn-green" onClick={() => setShowAdd(true)} style={{ padding: '10px 18px', fontSize: 14 }}>
            + Нэмэх
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 20, background: 'var(--blue-light)', borderColor: 'var(--blue)' }}>
          <h3 style={{ fontWeight: 800, marginBottom: 14 }}>Шинэ үг нэмэх</h3>
          <form onSubmit={addWord} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" value={front} onChange={e => setFront(e.target.value)}
              placeholder="Хятад үг (жш: 你好)" required />
            <input type="text" value={back} onChange={e => setBack(e.target.value)}
              placeholder="Монгол утга (жш: Сайн уу)" required />
            <input type="text" value={hint} onChange={e => setHint(e.target.value)}
              placeholder="Дуудлага / санамж (жш: nǐ hǎo)" />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-green" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Нэмж байна...' : 'НЭМЭХ'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>
                БОЛИХ
              </button>
            </div>
          </form>
        </div>
      )}

      {words.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontWeight: 700, color: 'var(--muted)' }}>Үг байхгүй байна. Нэмж эхлэцгээе!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {words.map(w => (
            <div key={w.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 28, fontWeight: 900 }}>{w.front}</span>
                {w.hint && <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 10, fontWeight: 600 }}>{w.hint}</span>}
                <div style={{ color: 'var(--muted)', fontWeight: 700, marginTop: 4 }}>{w.back}</div>
              </div>
              <button onClick={() => deleteWord(w.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: 18, padding: 8,
              }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
