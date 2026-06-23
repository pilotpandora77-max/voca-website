'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

export default function DictionaryPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  async function search(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setSelected(null);
    try {
      const { data } = await api.get(`/api/dictionary?q=${encodeURIComponent(query)}`);
      setResults(Array.isArray(data) ? data : [data]);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  async function addToVocab(word) {
    try {
      await api.post('/api/words', { front: word.simplified, back: word.definitions?.[0] || word.english, hint: word.pinyin });
      alert('Үгийн санд нэмэгдлэ! ✅');
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
  }

  if (authLoad) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>📖 Хятад-Монгол толь</h1>

      <form onSubmit={search} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Хятад үг хайх... (жш: 你好, nǐ hǎo)" style={{ flex: 1 }} />
        <button type="submit" className="btn btn-green" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? '...' : '🔍 Хайх'}
        </button>
      </form>

      {loading && <div style={{ textAlign: 'center', padding: 40, fontSize: 32 }}>⏳</div>}

      {!loading && searched && results.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Үр дүн олдсонгүй</p>
        </div>
      )}

      {!loading && results.length > 0 && !selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map((item, i) => (
            <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(item)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 36, fontWeight: 900 }}>{item.simplified || item.word}</span>
                <div>
                  <div style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 15 }}>{item.pinyin}</div>
                  <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>
                    {item.definitions?.slice(0, 2).join('; ') || item.english || item.meaning}
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 20 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="card">
          <button onClick={() => setSelected(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
          }}>← Буцах</button>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 72, fontWeight: 900 }}>{selected.simplified || selected.word}</div>
            <div style={{ fontSize: 18, color: 'var(--blue)', fontWeight: 700, marginTop: 8 }}>{selected.pinyin}</div>
            {selected.traditional && selected.traditional !== selected.simplified && (
              <div style={{ color: 'var(--muted)', fontWeight: 600 }}>Уламжлалт: {selected.traditional}</div>
            )}
          </div>

          {selected.definitions && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 14, color: 'var(--muted)', marginBottom: 10, letterSpacing: 0.5 }}>УТГА</h3>
              {selected.definitions.map((d, i) => (
                <div key={i} style={{
                  padding: '10px 14px', background: 'var(--bg-alt)', borderRadius: 10,
                  marginBottom: 6, fontWeight: 600,
                }}>
                  {i + 1}. {d}
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-green" onClick={() => addToVocab(selected)} style={{ width: '100%' }}>
            + Үгийн санд нэмэх
          </button>
        </div>
      )}
    </div>
  );
}
