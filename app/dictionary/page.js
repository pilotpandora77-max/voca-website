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
  const [added, setAdded]       = useState(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  async function search(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setSelected(null);
    setAdded(null);
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
      setAdded(word.simplified);
      setTimeout(() => setAdded(null), 2000);
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
  }

  if (authLoad) return null;

  return (
    <div style={{ padding: '28px 28px 40px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.5, marginBottom: 6 }}>
          Толь бичиг
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Хятад-Монгол тайлбар толь</p>
      </div>

      {/* Search bar */}
      <form onSubmit={search} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
          <input type="search" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Хятад үг хайх... (жш: 你好, nǐ hǎo)"
            style={{ paddingLeft: 48, fontSize: 16, padding: '14px 16px 14px 48px' }} />
        </div>
        <button type="submit" className="btn btn-purple" disabled={loading} style={{ padding: '14px 24px', fontSize: 15 }}>
          {loading ? '...' : 'Хайх'}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 52 }}>
          <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.5 }}>🔍</div>
          <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 14 }}>Үр дүн олдсонгүй</p>
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && !selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map((item, i) => (
            <div key={i} className="card" style={{
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 20, padding: '18px 22px',
            }}
            onClick={() => setSelected(item)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(155,109,255,0.28)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = ''; }}
            >
              <div style={{
                fontSize: 48, fontWeight: 900, lineHeight: 1, minWidth: 60, textAlign: 'center',
                background: 'linear-gradient(135deg, #EDE9FF, #C4AAFF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {item.simplified || item.word}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#9B6DFF', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{item.pinyin}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {item.definitions?.slice(0, 2).join(' · ') || item.english || item.meaning}
                </div>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: 20, opacity: 0.5 }}>›</span>
            </div>
          ))}
        </div>
      )}

      {/* Detail view */}
      {selected && (
        <div className="anim-up">
          <button onClick={() => setSelected(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
            fontSize: 14, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'inherit', padding: 0, transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EDE9FF'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}
          >
            ← Буцах
          </button>

          <div className="card" style={{ border: '1px solid rgba(155,109,255,0.2)' }}>
            {/* Character hero */}
            <div style={{
              textAlign: 'center', padding: '32px 20px 24px',
              background: 'linear-gradient(135deg, rgba(155,109,255,0.08), rgba(255,107,157,0.05))',
              borderRadius: 16, marginBottom: 24,
            }}>
              <div style={{
                fontSize: 100, fontWeight: 900, lineHeight: 1, marginBottom: 12,
                background: 'linear-gradient(135deg, #EDE9FF, #C4AAFF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {selected.simplified || selected.word}
              </div>
              <div style={{ fontSize: 22, color: '#9B6DFF', fontWeight: 700, marginBottom: 6 }}>
                {selected.pinyin}
              </div>
              {selected.traditional && selected.traditional !== selected.simplified && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '4px 12px',
                  color: 'var(--muted)', fontSize: 13, fontWeight: 600,
                }}>
                  Уламжлалт: {selected.traditional}
                </div>
              )}
            </div>

            {/* Definitions */}
            {selected.definitions && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
                  Утга тайлбар
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selected.definitions.map((d, i) => (
                    <div key={i} style={{
                      padding: '11px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <span style={{
                        minWidth: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 900,
                        background: 'rgba(155,109,255,0.15)', color: '#9B6DFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontWeight: 600, color: '#EDE9FF', fontSize: 14, lineHeight: 1.5 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-purple" onClick={() => addToVocab(selected)} style={{ width: '100%', padding: '13px 22px', fontSize: 15 }}>
              {added === selected.simplified ? '✓ Нэмэгдлэ!' : '+ Үгийн санд нэмэх'}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{
            fontSize: 72, marginBottom: 16,
            animation: 'float 3s ease infinite',
          }}>
            📖
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#EDE9FF', marginBottom: 8 }}>
            Хятад үг хайж эхлэцгээе
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            Хятад тэмдэгт, pinyin, эсвэл монгол утгаар хайж болно
          </p>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
