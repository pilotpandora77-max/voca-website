'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const FILTER_TABS = ['Бүгд', 'Үг', 'Хэлц', 'Жишээ', 'Идиом'];

export default function DictionaryPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [streak, setStreak]     = useState(0);
  const [filter, setFilter]     = useState('Бүгд');
  const [addedMsg, setAdded]    = useState('');

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
  }, [authLoad, user]);

  async function search(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true); setSelected(null);
    try {
      const { data } = await api.get(`/api/dictionary?q=${encodeURIComponent(query)}`);
      const list = Array.isArray(data) ? data : [data];
      setResults(list);
      if (list.length === 1) setSelected(list[0]);
    } catch { setResults([]); }
    setLoading(false);
  }

  async function addToVocab(word) {
    try {
      await api.post('/api/words', { front: word.simplified || word.word, back: word.definitions?.[0] || word.english, hint: word.pinyin });
      setAdded('✓ Үгийн санд нэмэгдлэ!');
      setTimeout(() => setAdded(''), 2500);
    } catch (e) { alert(e.response?.data?.error || 'Алдаа'); }
  }

  if (authLoad) return null;

  const QUICK_ACTIONS = [
    { icon: '🔊', label: 'Дуу сонсох' },
    { icon: '📋', label: 'Хуулбарлах' },
    { icon: '↗', label: 'Хуваалцах' },
    { icon: '+', label: 'Жишээ нэмэх' },
  ];

  return (
    <div style={{ paddingBottom: 32 }}>
      <PageHeader
        title="Толь бичиг 📖"
        subtitle="Хайсан үгийн утга, тайлбар, жишээ, холбоотой үгсийг харна уу."
        streak={streak}
      />

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>

        {/* Main column */}
        <div>
          {/* Search bar */}
          <form onSubmit={search} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 16 }}>🔍</span>
              <input type="search" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Хайх... (ж: 你好, happy, 学习)"
                style={{ paddingLeft: 44, background: '#fff', borderRadius: 14 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '0 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
              Хятад <span style={{ color: 'var(--purple)' }}>⇔</span> Монгол
            </div>
            <button type="submit" className="btn btn-purple" style={{ padding: '11px 22px' }}>Хайх</button>
          </form>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {FILTER_TABS.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.14s',
                background: filter === t ? 'var(--purple)' : '#fff',
                color: filter === t ? '#fff' : 'var(--text-sub)',
                boxShadow: filter === t ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
              }}>
                {t}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>}

          {/* Results list */}
          {!loading && searched && !selected && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map((item, i) => (
                <div key={i} className="card" style={{ cursor: 'pointer', transition: 'all 0.14s', display: 'flex', gap: 18, alignItems: 'center', padding: '16px 20px' }}
                onClick={() => setSelected(item)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-mid)'; e.currentTarget.style.background = 'var(--purple-soft)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--purple)' }}>{item.simplified || item.word}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, color: 'var(--purple)', fontWeight: 700, marginBottom: 3 }}>{item.pinyin}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{item.definitions?.slice(0, 2).join(' · ') || item.english}</div>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: 20 }}>›</span>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && searched && results.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
              <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Үр дүн олдсонгүй</p>
            </div>
          )}

          {/* Word detail */}
          {selected && (
            <div className="anim-up">
              {results.length > 1 && (
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)',
                  fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: 'inherit', padding: 0, transition: 'color 0.14s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--purple)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}
                >
                  ← Буцах
                </button>
              )}

              {/* Main word card */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, background: 'var(--purple-light)',
                    border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, color: 'var(--purple)', flexShrink: 0,
                  }}>🔊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 42, fontWeight: 900, color: 'var(--text)' }}>{selected.simplified || selected.word}</span>
                      <span style={{ fontSize: 16 }}>⭐</span>
                      <button onClick={() => addToVocab(selected)} style={{
                        marginLeft: 'auto', background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)',
                        color: 'var(--purple)', borderRadius: 10, padding: '7px 14px',
                        fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        {addedMsg || '+ Үгэнд нэмэх'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18, color: 'var(--purple)', fontWeight: 700 }}>{selected.pinyin}</span>
                      <span className="tag tag-purple">Үг</span>
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--text-sub)', fontWeight: 500 }}>
                      {selected.definitions?.join(' / ') || selected.english || selected.meaning}
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1.5px solid var(--border)' }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>Хэлний төрөл</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-sub)' }}>Мэндчилгээ</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>HSK түвшин</div>
                    <span className="tag tag-purple">HSK 1</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 5 }}>Түгээмэл байдал</div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: i < 6 ? 'var(--purple)' : 'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Example sentences */}
              {selected.examples && selected.examples.length > 0 ? (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 15, marginBottom: 14 }}>Жишээ өгүүлбэрүүд</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selected.examples.slice(0, 3).map((ex, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                        background: 'var(--bg-alt)', borderRadius: 12,
                        border: '1.5px solid var(--border)',
                      }}>
                        <button style={{
                          width: 30, height: 30, borderRadius: '50%', background: 'var(--purple-light)',
                          border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 13, color: 'var(--purple)', cursor: 'pointer',
                          flexShrink: 0,
                        }}>▶</button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{ex.zh}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ex.mn}</div>
                        </div>
                        <button style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'var(--text-sub)', fontFamily: 'inherit' }}>
                          📋 Копи
                        </button>
                      </div>
                    ))}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', textAlign: 'center', padding: '6px' }}>
                      Дэлгэрэнгүй жишээ харах ▾
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 15, marginBottom: 10 }}>Жишээ өгүүлбэрүүд</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { zh: `${selected.simplified || selected.word}，你好！`, mn: `${selected.definitions?.[0] || '...'}, сайн уу!` },
                      { zh: `我说${selected.simplified || selected.word}。`, mn: `Би "${selected.definitions?.[0] || '...'}" гэж хэлэв.` },
                    ].map((ex, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 12, border: '1.5px solid var(--border)' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--purple)', flexShrink: 0 }}>▶</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{ex.zh}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ex.mn}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related words */}
              <div className="card">
                <h3 style={{ fontWeight: 900, fontSize: 15, marginBottom: 14 }}>Холбоотой үгс</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['你', '好', '大家好', '您好', '早上好'].map(w => (
                    <button key={w} onClick={() => { setQuery(w); search(); }} style={{
                      background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12,
                      padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit',
                      textAlign: 'center', transition: 'all 0.14s', minWidth: 72,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.background = 'var(--purple-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 3 }}>{w}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>🔊</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!searched && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 14, animation: 'float 3s ease infinite' }}>📖</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Хятад үг хайж эхлэцгээе</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Хятад тэмдэгт, pinyin, эсвэл монгол утгаар хайж болно</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Цээжлэхэд туслах */}
            <div className="card">
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                Цээжлэхэд туслах <span style={{ color: 'var(--muted)', fontSize: 13 }}>ⓘ</span>
              </div>
              <div style={{ display: 'flex', align: 'center', gap: 12, padding: '12px', background: 'var(--bg-alt)', borderRadius: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>🔥</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>Суралцах давтамж (SRS)</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Энэ үгийг маргааш давтах болно.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, padding: '11px', background: 'var(--bg-alt)', borderRadius: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>📅</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>Маргааш</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Дараагийн давталт</div>
                </div>
              </div>
              <button className="btn btn-purple" onClick={() => addToVocab(selected)} style={{ width: '100%', fontSize: 13, padding: '10px' }}>
                🔄 Одоо давтах
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 8, fontSize: 13, padding: '10px' }}>
                ✓ Би мэддэг боллоо
              </button>
            </div>

            {/* Хурдан үйлдэл */}
            <div className="card">
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 12 }}>Хурдан үйлдэл</div>
              {QUICK_ACTIONS.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px',
                  borderRadius: 10, cursor: 'pointer', transition: 'background 0.14s',
                  borderBottom: i < QUICK_ACTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--purple)' }}>{a.icon}</div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', flex: 1 }}>{a.label}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 16 }}>›</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 14 }}>✏️ Миний тэмдэглэл</div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--muted)' }}>✏️</button>
              </div>
              <textarea placeholder="Энэ үгийн талаар тэмдэглэлзэ бичих үү..." style={{ minHeight: 80, resize: 'vertical', fontSize: 13 }} />
              <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>0/200</div>
            </div>
          </div>
        )}

        {!selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ textAlign: 'center', padding: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💡</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>Зөвлөмж</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>Дуртай үгсийг хайж үгийн санд нэмснээр давтамжтайгаар сурна</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
