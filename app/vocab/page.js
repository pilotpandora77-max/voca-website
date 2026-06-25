'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const TABS = ['Бүгд', 'Шинэ', 'Сурч байгаа', 'Давтах', 'Мэддэг болсон', 'Сагсархаг үг'];
const SORT_OPTIONS = ['А-Я', 'Я-А', 'Шинэ нэмэгдсэн', 'Хуучин нэмэгдсэн'];
const LEVEL_OPTIONS = ['Бүгд', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'];

function ProgressRing({ pct, r = 52, stroke = 9 }) {
  const circ = 2 * Math.PI * r;
  return (
    <svg width={r * 2 + stroke * 2} height={r * 2 + stroke * 2}>
      <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={r + stroke} cy={r + stroke} r={r} fill="none"
        stroke="var(--purple)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round"
        transform={`rotate(-90 ${r + stroke} ${r + stroke})`}
        style={{ transition: 'stroke-dashoffset 0.7s ease' }}
      />
      <text x={r + stroke} y={r + stroke + 6} textAnchor="middle" fontSize={22} fontWeight={900} fill="var(--purple)">{pct}%</text>
    </svg>
  );
}

function StatusDot({ status }) {
  const map = { new: '#3B82F6', learning: '#F59E0B', review: '#EF4444', known: '#10B981' };
  const label = { new: 'Шинэ', learning: 'Сурч байгаа', review: 'Давтах', known: 'Мэддэг' };
  const color = map[status] || map.new;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ color }}>{label[status] || 'Шинэ'}</span>
    </span>
  );
}

export default function VocabPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [words, setWords]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('Бүгд');
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState('Шинэ нэмэгдсэн');
  const [level, setLevel]         = useState('Бүгд');
  const [stats, setStats]         = useState({ total: 0, learned: 0, review: 0, known: 0 });
  const [streak, setStreak]       = useState(0);
  const [showAdd, setShowAdd]     = useState(false);
  const [newWord, setNewWord]     = useState({ front: '', back: '', hint: '' });
  const [addLoading, setAddLoad]  = useState(false);
  const [aiLoading, setAiLoad]    = useState(false);
  const [expandedId, setExp]      = useState(null);
  const [calDays, setCalDays]     = useState([]);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (user) loadData();
  }, [authLoad, user]);

  async function loadData() {
    try {
      const [wRes, sRes, strRes] = await Promise.all([
        api.get('/api/words'),
        api.get('/api/stats').catch(() => ({ data: {} })),
        api.get('/api/streak').catch(() => ({ data: { streak: 0 } })),
      ]);
      const wList = Array.isArray(wRes.data) ? wRes.data : [];
      setWords(wList);
      setStats({
        total:   wList.length,
        learned: wList.filter(w => w.status === 'learning' || w.status === 'review').length,
        review:  wList.filter(w => w.status === 'review').length,
        known:   wList.filter(w => w.status === 'known').length,
      });
      setStreak(strRes.data.streak || 0);

      const today = new Date();
      setCalDays(Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return {
          label: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'][d.getDay()],
          active: i >= 7 - (strRes.data.streak || 0),
          today: i === 6,
        };
      }));
    } catch { }
    setLoading(false);
  }

  async function addWord() {
    if (!newWord.front.trim() || !newWord.back.trim()) return;
    setAddLoad(true);
    try {
      const { data } = await api.post('/api/words', newWord);
      setWords(w => [data, ...w]);
      setStats(s => ({ ...s, total: s.total + 1 }));
      setNewWord({ front: '', back: '', hint: '' });
      setShowAdd(false);
    } catch (e) { alert(e.response?.data?.error || 'Алдаа'); }
    setAddLoad(false);
  }

  async function deleteWord(id) {
    if (!id) return;
    try {
      await api.delete(`/api/words/${id}`);
      setWords(w => w.filter(x => (x._id || x.id) !== id));
      setStats(s => ({ ...s, total: Math.max(0, s.total - 1) }));
    } catch (e) { alert(e.response?.data?.error || 'Устгахад алдаа гарлаа'); }
  }

  async function generateAI() {
    setAiLoad(true);
    try {
      const { data } = await api.post('/api/words/generate');
      if (Array.isArray(data)) {
        setWords(w => [...data, ...w]);
        setStats(s => ({ ...s, total: s.total + data.length }));
      }
    } catch (e) { alert(e.response?.data?.error || 'AI алдаа'); }
    setAiLoad(false);
  }

  const filtered = words.filter(w => {
    const matchTab = tab === 'Бүгд' ? true
      : tab === 'Шинэ' ? (!w.status || w.status === 'new')
      : tab === 'Сурч байгаа' ? w.status === 'learning'
      : tab === 'Давтах' ? w.status === 'review'
      : tab === 'Мэддэг болсон' ? w.status === 'known'
      : tab === 'Сагсархаг үг' ? w.starred
      : true;
    const q = search.toLowerCase();
    const matchSearch = !q || (w.front || w.word || '').toLowerCase().includes(q) || (w.back || w.meaning || '').toLowerCase().includes(q) || (w.hint || w.reading || '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const pct = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0;

  if (authLoad || loading) return null;

  return (
    <div style={{ paddingBottom: 32 }}>
      <PageHeader
        title="Үгийн сан 📚"
        subtitle="Хадгалсан үгс, ахиц дэвшил, давтах карт."
        streak={streak}
        actions={
          <button className="btn btn-purple" onClick={() => setShowAdd(true)} style={{ fontSize: 13, padding: '9px 16px' }}>
            + Үг нэмэх
          </button>
        }
      />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '0 28px', marginBottom: 18 }}>
        {[
          { label: 'Нийт үг',       value: stats.total,   icon: '📚', color: 'var(--purple)', bg: 'var(--purple-light)' },
          { label: 'Суралцсан',     value: stats.learned, icon: '📈', color: '#3B82F6',        bg: '#EFF6FF' },
          { label: 'Давтах',        value: stats.review,  icon: '🔄', color: '#EF4444',        bg: '#FEF2F2' },
          { label: 'Мэддэг болсон', value: stats.known,   icon: '✓',  color: '#10B981',        bg: '#ECFDF5' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 268px', gap: 18 }}>
        {/* Main */}
        <div>
          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>🔍</span>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Хайх..." style={{ paddingLeft: 42, background: '#fff' }} />
            </div>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{
              padding: '11px 14px', borderRadius: 14, border: '1.5px solid var(--border)',
              background: '#fff', fontWeight: 700, fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer',
            }}>
              {LEVEL_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              padding: '11px 14px', borderRadius: 14, border: '1.5px solid var(--border)',
              background: '#fff', fontWeight: 700, fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer',
            }}>
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none', whiteSpace: 'nowrap', transition: 'all 0.14s',
                background: tab === t ? 'var(--purple)' : '#fff',
                color: tab === t ? '#fff' : 'var(--text-sub)',
                boxShadow: tab === t ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
              }}>
                {t}
              </button>
            ))}
          </div>

          {/* Word list */}
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
              <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Үг байхгүй</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Шинэ үг нэмэх эсвэл толь бичгээс нэмнэ үү</p>
              <button className="btn btn-purple" onClick={() => setShowAdd(true)}>+ Үг нэмэх</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map((w, i) => {
                const wid   = w._id || w.id;
                const open  = expandedId === wid;
                const front = w.front || w.word || w.simplified || '';
                const back  = w.back  || w.meaning || w.meaningEn || '';
                const hint  = w.hint  || w.reading || w.pinyin || '';
                return (
                  <div key={wid || i} className="card" style={{
                    padding: 0, overflow: 'hidden',
                    boxShadow: open ? '0 0 0 2px var(--purple-mid)' : undefined,
                    transition: 'all 0.14s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer' }}
                      onClick={() => setExp(open ? null : wid)}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, background: 'var(--purple-light)',
                        border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 22, fontWeight: 900, color: 'var(--purple)', flexShrink: 0,
                      }}>
                        {front.slice(0, 1) || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>{front}</span>
                          {hint && <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>{hint}</span>}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{back}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <StatusDot status={w.status} />
                        <span style={{ color: 'var(--muted)', fontSize: 18, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>⌄</span>
                      </div>
                    </div>

                    {open && (
                      <div style={{ borderTop: '1.5px solid var(--border)', padding: '14px 16px', background: 'var(--bg-alt)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>ХЯТАД</div>
                            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>{front}</div>
                            {hint && <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 13 }}>{hint}</div>}
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>МОНГОЛ</div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{back}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-purple" style={{ fontSize: 12, padding: '8px 14px' }}
                            onClick={() => router.push('/vocab/practice')}>
                            🔄 Давтах
                          </button>
                          <button className="btn btn-outline" style={{ fontSize: 12, padding: '8px 14px' }}>
                            ✏️ Засах
                          </button>
                          <button onClick={() => deleteWord(wid)} className="btn btn-red" style={{ fontSize: 12, padding: '8px 14px', marginLeft: 'auto' }}>
                            🗑️ Устгах
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Progress ring */}
          <div className="card" style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 20 }}>
            <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 16 }}>Миний ахиц</div>
            <ProgressRing pct={pct} />
            <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>
              {stats.known} / {stats.total} үг мэддэг болсон
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14, paddingTop: 14, borderTop: '1.5px solid var(--border)' }}>
              {[['📚', stats.total, 'Нийт'], ['✓', stats.known, 'Мэддэг'], ['🔄', stats.review, 'Давтах']].map(([icon, val, lbl]) => (
                <div key={lbl} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18 }}>{icon}</div>
                  <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 16 }}>{val}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-day calendar */}
          <div className="card">
            <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 12 }}>7 хоногийн идэвх</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {calDays.map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
                  <div style={{
                    width: 24, height: 24, borderRadius: 8, margin: '0 auto',
                    background: d.active ? (d.today ? 'var(--purple)' : '#C4B5FD') : 'var(--border)',
                    border: `2px solid ${d.active ? (d.today ? 'var(--purple-dark)' : 'var(--purple-mid)') : 'var(--border)'}`,
                  }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textAlign: 'center' }}>
              🔥 {streak} өдрийн цуваа
            </div>
          </div>

          {/* AI word generator */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 13 }}>AI үг санал болгох</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Таны түвшинд тохирсон</div>
              </div>
            </div>
            <button className="btn btn-purple" onClick={generateAI} disabled={aiLoading} style={{ width: '100%', fontSize: 12, padding: '9px' }}>
              {aiLoading ? '⏳ Боловсруулж байна...' : '✨ Үг санал авах'}
            </button>
          </div>

          {/* Import */}
          <div className="card">
            <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 10 }}>📥 Импорт</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['CSV файлаас', 'Anki deck', 'Clipboard-аас'].map(opt => (
                <button key={opt} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 10,
                  background: 'var(--bg-alt)', border: '1.5px solid var(--border)', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: 'var(--text)', transition: 'all 0.14s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-mid)'; e.currentTarget.style.background = 'var(--purple-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-alt)'; }}
                >
                  <span style={{ color: 'var(--purple)' }}>↑</span> {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add word modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,10,30,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)',
        }} onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="card" style={{ width: 400, padding: 28, maxWidth: '90vw' }}>
            <h2 style={{ fontWeight: 900, fontSize: 18, marginBottom: 20 }}>Шинэ үг нэмэх</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Хятад үг</label>
                <input value={newWord.front} onChange={e => setNewWord(n => ({ ...n, front: e.target.value }))} placeholder="ж: 你好" />
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Монгол утга</label>
                <input value={newWord.back} onChange={e => setNewWord(n => ({ ...n, back: e.target.value }))} placeholder="ж: Сайн уу" />
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Pinyin (заавал биш)</label>
                <input value={newWord.hint} onChange={e => setNewWord(n => ({ ...n, hint: e.target.value }))} placeholder="ж: nǐ hǎo" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Болих</button>
              <button className="btn btn-purple" onClick={addWord} disabled={addLoading} style={{ flex: 1 }}>
                {addLoading ? 'Нэмж байна...' : 'Нэмэх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
