'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { getCourses } from '@/lib/courses';
import { loadUserData, saveUserData } from '@/lib/userdata';
import { useLang } from '@/lib/LangContext';

// Хятад үг → {pinyin, mn} локал толь (курсын өгөгдлөөс)
const ZH_LOOKUP = (() => {
  const m = {};
  try { getCourses('zh').flatMap(c => c.words).forEach(w => { if (w.target) m[w.target] = { reading: w.reading, mn: w.mn }; }); } catch {}
  return m;
})();

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
  const { lang } = useLang();
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
  const [groups, setGroups]       = useState([]);     // [{id,name,color,wordIds:[]}]
  const [activeGroup, setActiveGr]= useState(null);   // group id
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#7C3AED');
  const [addToGroupId, setAddToGroupId] = useState(null); // group id for "add words" modal
  const [addToGroupSearch, setAtgSearch] = useState('');

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (user) loadData();
    // Бүлгүүдийг backend-ээс (байвал) синк; эс бөгөөс хуучин localStorage-оос (migration)
    let old = []; try { old = JSON.parse(localStorage.getItem('voca_word_groups') || '[]'); } catch {}
    loadUserData('wordGroups', old).then(g => { if (Array.isArray(g)) setGroups(g); });
  }, [authLoad, user]);

  const GROUP_COLORS = ['#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6', '#8B5CF6'];
  function saveGroups(g) { setGroups(g); saveUserData('wordGroups', g); }
  function openCreateGroup() { setNewGroupName(''); setNewGroupColor(GROUP_COLORS[groups.length % GROUP_COLORS.length]); setShowGroupModal(true); }
  function confirmCreateGroup() {
    if (!newGroupName.trim()) { alert('Бүлгийн нэр оруулна уу.'); return; }
    const g = { id: Date.now(), name: newGroupName.trim(), color: newGroupColor, wordIds: [] };
    saveGroups([...groups, g]);
    setShowGroupModal(false);
    setActiveGr(g.id);
  }
  function deleteGroup(id) {
    if (!confirm('Энэ бүлгийг устгах уу? (Үгс устахгүй)')) return;
    saveGroups(groups.filter(g => g.id !== id));
    if (activeGroup === id) setActiveGr(null);
  }
  function toggleWordInGroup(gid, wid) {
    saveGroups(groups.map(g => {
      if (g.id !== gid) return g;
      const has = g.wordIds.includes(wid);
      return { ...g, wordIds: has ? g.wordIds.filter(x => x !== wid) : [...g.wordIds, wid] };
    }));
  }

  async function loadData() {
    try {
      const [wRes, sRes, strRes] = await Promise.all([
        api.get('/api/words'),
        api.get('/api/stats').catch(() => ({ data: {} })),
        api.get('/api/streak').catch(() => ({ data: { streak: 0 } })),
      ]);
      const wList = Array.isArray(wRes.data) ? wRes.data : [];
      // Локал нэмсэн үгсийг нэгтгэх (backend амжаагүй ч хадгалагдсан байх)
      let local = [];
      try { local = JSON.parse(localStorage.getItem('voca_local_words') || '[]'); } catch {}
      const keyset = new Set(wList.map(w => `${w.front || w.word || ''}|${w.back || w.meaning || ''}`));
      const extra = local.filter(w => !keyset.has(`${w.front || ''}|${w.back || ''}`));
      const merged = [...extra, ...wList];
      setWords(merged);
      setStats({
        total:   merged.length,
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

  const [lookupBusy, setLookupBusy] = useState(false);
  async function lookupWord() {
    const q = (newWord.front || '').trim();
    if (!q) { alert('Эхлээд Хятад үг бичнэ үү.'); return; }
    setLookupBusy(true);
    let reading = '', mn = '';
    const local = ZH_LOOKUP[q];
    if (local) { reading = local.reading || ''; mn = local.mn || ''; }
    if (!reading || !mn) {
      try {
        const { data } = await api.get(`/api/dictionary?q=${encodeURIComponent(q)}`);
        const d = Array.isArray(data) ? data[0] : data;
        if (d) {
          reading = reading || d.pinyin || d.reading || '';
          mn = mn || d.mn || d.meaning || (Array.isArray(d.definitions) ? d.definitions.join('; ') : (d.english || ''));
        }
      } catch {}
    }
    setLookupBusy(false);
    if (!reading && !mn) { alert('Толь бичгээс олдсонгүй. Гараар бөглөнө үү.'); return; }
    setNewWord(n => ({ ...n, hint: reading || n.hint, back: mn || n.back }));
  }

  async function addWord() {
    const front = (newWord.front || '').trim();
    const back = (newWord.back || '').trim();
    if (!front || !back) { alert('Хятад үг болон Монгол утгыг бөглөнө үү.'); return; }
    setAddLoad(true);
    const payload = {
      front: newWord.front, back: newWord.back, hint: newWord.hint,
      word: newWord.front, meaning: newWord.back, reading: newWord.hint, lang,
    };
    // 1) Optimistic — шууд харагдана, localStorage-д хадгална (backend амжаагүй ч)
    const localId = 'local-' + Date.now();
    const added = { ...payload, _id: localId, id: localId, status: 'new' };
    setWords(w => [added, ...w]);
    setStats(s => ({ ...s, total: s.total + 1 }));
    try {
      const local = JSON.parse(localStorage.getItem('voca_local_words') || '[]');
      localStorage.setItem('voca_local_words', JSON.stringify([added, ...local]));
    } catch {}
    // Идэвхтэй бүлэг байвал шинэ үгийг түүнд автоматаар нэмнэ
    if (activeGroup) toggleWordInGroup(activeGroup, localId);
    setNewWord({ front: '', back: '', hint: '' });
    setShowAdd(false);
    setAddLoad(false);
    // 2) Backend рүү хадгалах оролдлого (амжвал локал хувийг арилгаж, бодит id-р солино)
    try {
      const { data } = await api.post('/api/words', payload);
      if (data && (data._id || data.id)) {
        const local = JSON.parse(localStorage.getItem('voca_local_words') || '[]');
        localStorage.setItem('voca_local_words', JSON.stringify(local.filter(x => x._id !== localId)));
        // локал түр id-г бодит backend id-р солих → утсан дээр синк болно
        setWords(w => w.map(x => (x._id === localId ? { ...data, _id: data._id || data.id } : x)));
      }
    } catch (e) {
      const msg = e.response?.data?.code === 'WORD_LIMIT'
        ? 'Үгийн хязгаарт хүрсэн тул серверт хадгалагдсангүй. (Premium-аар хязгааргүй болно)'
        : 'Үг серверт хадгалагдсангүй — утсан дээр синк болохгүй байж магадгүй. Интернэтээ шалгаад дахин оролдоно уу.';
      alert(msg);
    }
  }

  async function deleteWord(id) {
    if (!id) return;
    setWords(w => w.filter(x => (x._id || x.id) !== id));
    setStats(s => ({ ...s, total: Math.max(0, s.total - 1) }));
    try {
      const local = JSON.parse(localStorage.getItem('voca_local_words') || '[]');
      localStorage.setItem('voca_local_words', JSON.stringify(local.filter(x => (x._id || x.id) !== id)));
    } catch {}
    // Backend рүү устгах оролдлого (локал үг бол алдаа гарвал үл тоомсорлоно)
    if (!String(id).startsWith('local-')) {
      try { await api.delete(`/api/words/${id}`); } catch {}
    }
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
    let matchGroup = true;
    if (activeGroup) {
      const g = groups.find(x => x.id === activeGroup);
      matchGroup = g ? g.wordIds.includes(w._id || w.id) : true;
    }
    return matchTab && matchSearch && matchGroup;
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

          {/* Groups bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', flexShrink: 0 }}>📁 Бүлэг:</span>
            <button onClick={() => setActiveGr(null)} style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${!activeGroup ? 'var(--purple)' : 'var(--border)'}`, whiteSpace: 'nowrap', background: !activeGroup ? 'var(--purple-light)' : '#fff', color: !activeGroup ? 'var(--purple)' : 'var(--text-sub)' }}>Бүх үг ({stats.total})</button>
            {groups.map(g => (
              <button key={g.id} onClick={() => setActiveGr(g.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${activeGroup === g.id ? g.color : 'var(--border)'}`, whiteSpace: 'nowrap', background: activeGroup === g.id ? `${g.color}18` : '#fff', color: activeGroup === g.id ? g.color : 'var(--text-sub)' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: g.color || 'var(--purple)' }} />{g.name} ({g.wordIds.length})
              </button>
            ))}
            <button onClick={openCreateGroup} style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px dashed var(--purple-mid)', whiteSpace: 'nowrap', background: '#fff', color: 'var(--purple)' }}>➕ Шинэ бүлэг</button>
          </div>

          {/* Active group banner */}
          {activeGroup && (() => {
            const g = groups.find(x => x.id === activeGroup); if (!g) return null;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, marginBottom: 12, background: `${g.color}12`, border: `1.5px solid ${g.color}44`, flexWrap: 'wrap' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', flexShrink: 0 }}>📁</div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{g.wordIds.length} үг</div>
                </div>
                <button onClick={() => { setAtgSearch(''); setAddToGroupId(g.id); }} className="btn btn-purple" style={{ padding: '8px 16px', fontSize: 12.5 }}>➕ Үг нэмэх</button>
                {g.wordIds.length >= 4 && <button onClick={() => router.push('/vocab/practice')} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 12.5 }}>🎮 Тоглох</button>}
                <button onClick={() => deleteGroup(g.id)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 12.5, color: 'var(--red)' }}>🗑️</button>
              </div>
            );
          })()}

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
                        {/* Бүлэгт нэмэх */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>📁 БҮЛЭГТ НЭМЭХ</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {groups.length === 0 && <button onClick={createGroup} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px dashed var(--purple-mid)', background: '#fff', color: 'var(--purple)' }}>➕ Бүлэг үүсгэх</button>}
                            {groups.map(g => {
                              const inG = g.wordIds.includes(wid);
                              return <button key={g.id} onClick={() => toggleWordInGroup(g.id, wid)} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${inG ? 'var(--purple)' : 'var(--border)'}`, background: inG ? 'var(--purple-light)' : '#fff', color: inG ? 'var(--purple)' : 'var(--text-sub)' }}>{inG ? '✓ ' : ''}{g.name}</button>;
                            })}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-purple" style={{ fontSize: 12, padding: '8px 14px' }}
                            onClick={() => router.push('/vocab/practice')}>
                            🔄 Давтах
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
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={newWord.front} onChange={e => setNewWord(n => ({ ...n, front: e.target.value }))} onBlur={lookupWord} placeholder="ж: 你好" style={{ flex: 1 }} />
                  <button type="button" onClick={lookupWord} disabled={lookupBusy} className="btn btn-light" style={{ padding: '0 14px', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>{lookupBusy ? '...' : '🔍 Толиос олох'}</button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Хятад үгээ бичээд товч дарвал орчуулга, pinyin автоматаар олдоно.</div>
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Монгол утга</label>
                <input type="text" value={newWord.back} onChange={e => setNewWord(n => ({ ...n, back: e.target.value }))} placeholder="ж: Сайн уу" />
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Pinyin (заавал биш)</label>
                <input type="text" value={newWord.hint} onChange={e => setNewWord(n => ({ ...n, hint: e.target.value }))} placeholder="ж: nǐ hǎo" />
              </div>
            </div>
            {activeGroup && (() => { const g = groups.find(x => x.id === activeGroup); return g ? <div style={{ fontSize: 12, color: g.color, fontWeight: 700, marginBottom: 12 }}>📁 "{g.name}" бүлэгт нэмэгдэнэ</div> : null; })()}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Болих</button>
              <button className="btn btn-purple" onClick={addWord} disabled={addLoading} style={{ flex: 1 }}>
                {addLoading ? 'Нэмж байна...' : 'Нэмэх'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create group modal */}
      {showGroupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,30,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowGroupModal(false); }}>
          <div className="card" style={{ width: 380, padding: 28, maxWidth: '90vw' }}>
            <h2 style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>📁 Шинэ бүлэг үүсгэх</h2>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 18 }}>Үгсээ сэдвээр нь бүлэглэж, тусад нь сурах боломжтой.</p>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Бүлгийн нэр</label>
            <input type="text" value={newGroupName} autoFocus onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') confirmCreateGroup(); }} placeholder="ж: HSK 1 үгс, Аяллын үгс" style={{ marginBottom: 16 }} />
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 8 }}>Өнгө</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
              {GROUP_COLORS.map(c => (
                <button key={c} onClick={() => setNewGroupColor(c)} style={{ width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer', border: newGroupColor === c ? '3px solid #fff' : '2px solid transparent', boxShadow: newGroupColor === c ? `0 0 0 2px ${c}` : 'none' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setShowGroupModal(false)} style={{ flex: 1 }}>Болих</button>
              <button className="btn btn-purple" onClick={confirmCreateGroup} style={{ flex: 1 }}>Үүсгэх</button>
            </div>
          </div>
        </div>
      )}

      {/* Add words to group modal */}
      {addToGroupId && (() => {
        const g = groups.find(x => x.id === addToGroupId); if (!g) return null;
        const q = addToGroupSearch.toLowerCase();
        const list = words.filter(w => {
          const f = (w.front || w.word || ''), b = (w.back || w.meaning || '');
          return !q || f.toLowerCase().includes(q) || b.toLowerCase().includes(q);
        });
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,30,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setAddToGroupId(null); }}>
            <div className="card" style={{ width: 480, maxWidth: '92vw', padding: 24, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: g.color }} />
                <h2 style={{ fontWeight: 900, fontSize: 17 }}>"{g.name}" бүлэгт үг нэмэх</h2>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>Үгсээ сонгож тэмдэглэнэ үү. (Эсвэл "Шинэ үг нэмэх"-ээр шинээр нэмж болно)</p>
              <input type="text" value={addToGroupSearch} onChange={e => setAtgSearch(e.target.value)} placeholder="Үг хайх..." style={{ marginBottom: 12 }} />
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {list.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20, fontSize: 13 }}>Үг алга. Эхлээд үг нэмнэ үү.</p>}
                {list.map(w => {
                  const wid = w._id || w.id;
                  const inG = g.wordIds.includes(wid);
                  const f = w.front || w.word || '', b = w.back || w.meaning || '';
                  return (
                    <div key={wid} onClick={() => toggleWordInGroup(g.id, wid)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${inG ? g.color : 'var(--border)'}`, background: inG ? `${g.color}12` : '#fff' }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${inG ? g.color : 'var(--border)'}`, background: inG ? g.color : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{inG ? '✓' : ''}</span>
                      <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{f}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{b}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button className="btn btn-ghost" onClick={() => { setAddToGroupId(null); setShowAdd(true); }} style={{ flex: 1 }}>➕ Шинэ үг үүсгэх</button>
                <button className="btn btn-purple" onClick={() => setAddToGroupId(null)} style={{ flex: 1 }}>Болсон</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
