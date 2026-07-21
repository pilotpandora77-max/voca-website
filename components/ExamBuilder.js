'use client';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { EXAM_TYPES, TIME_LIMIT_OPTIONS, QUESTION_COUNT_OPTIONS } from '@/lib/examTypes';

const DEFAULT_GROUP = 'Ерөнхий';

// Шинэ шалгалт үүсгэх / засах хэлбэржүүлэгч (create болон edit хоёуланд хуваалцана).
export default function ExamBuilder({ mode, initialExam, onSaved, onCancel }) {
  const [allWords, setAllWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [title, setTitle] = useState(initialExam?.title || '');
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialExam?.wordIds || []));
  const [folderFilter, setFolderFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [types, setTypes] = useState(() => new Set(initialExam?.questionTypes?.length ? initialExam.questionTypes : EXAM_TYPES.map(t => t.key)));
  const [questionCount, setQuestionCount] = useState(initialExam?.questionCount || 10);
  const [timeLimit, setTimeLimit] = useState(initialExam?.timeLimit ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/words').then(({ data }) => setAllWords(Array.isArray(data) ? data : []))
      .catch(() => setError('Үгсийн жагсаалт татахад алдаа гарлаа'))
      .finally(() => setWordsLoading(false));
  }, []);

  const folders = useMemo(() => {
    const names = new Set();
    allWords.forEach(w => names.add(w.group || DEFAULT_GROUP));
    return Array.from(names).sort((a, b) => (a === DEFAULT_GROUP ? 1 : b === DEFAULT_GROUP ? -1 : a.localeCompare(b)));
  }, [allWords]);

  const visibleWords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allWords.filter(w => {
      if (folderFilter && (w.group || DEFAULT_GROUP) !== folderFilter) return false;
      if (q && !w.word.toLowerCase().includes(q) && !w.meaning.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allWords, folderFilter, search]);

  const allVisibleSelected = visibleWords.length > 0 && visibleWords.every(w => selectedIds.has(w.id));

  function toggleWord(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleAllVisible() {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleWords.forEach(w => next.delete(w.id));
      else visibleWords.forEach(w => next.add(w.id));
      return next;
    });
  }
  function toggleType(key) {
    setTypes(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const countOptions = useMemo(() => {
    const n = selectedIds.size;
    const opts = QUESTION_COUNT_OPTIONS.filter(v => v < n);
    if (n > 0) opts.push(n);
    return opts;
  }, [selectedIds]);

  useEffect(() => {
    if (selectedIds.size && questionCount > selectedIds.size) setQuestionCount(selectedIds.size);
  }, [selectedIds, questionCount]);

  async function save() {
    if (!title.trim()) return setError('Шалгалтын нэрээ оруулна уу');
    if (!selectedIds.size) return setError('Хамгийн багадаа 1 үг сонгоно уу');
    if (!types.size) return setError('Хамгийн багадаа 1 дасгалын төрөл сонгоно уу');
    setError(''); setSaving(true);
    const payload = {
      title: title.trim(),
      wordIds: Array.from(selectedIds),
      questionTypes: Array.from(types),
      questionCount: Math.min(questionCount, selectedIds.size),
      timeLimit,
    };
    try {
      const { data } = mode === 'edit'
        ? await api.patch(`/api/exams/${initialExam.id}`, payload)
        : await api.post('/api/exams', payload);
      onSaved(data);
    } catch (e) {
      setError(e?.response?.data?.error || 'Хадгалахад алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 900, fontSize: 19, marginBottom: 18 }}>{mode === 'edit' ? '✏️ Шалгалт засах' : '🎓 Шинэ шалгалт үүсгэх'}</h2>

      <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Шалгалтын нэр</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ж: 5-р бүлгийн үгс" style={{ marginBottom: 18 }} />

      <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 8 }}>
        Үгсээ сонгоно уу ({selectedIds.size} сонгогдсон)
      </label>
      {wordsLoading ? (
        <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>Ачаалж байна...</div>
      ) : allWords.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Танд одоогоор нэмсэн үг байхгүй байна. Эхлээд "Үгс" хуудаснаас үг нэмнэ үү.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <button onClick={() => setFolderFilter(null)} style={chipStyle(folderFilter === null)}>Бүгд</button>
            {folders.map(f => (
              <button key={f} onClick={() => setFolderFilter(f)} style={chipStyle(folderFilter === f)}>{f}</button>
            ))}
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Үг хайх..." style={{ marginBottom: 8 }} />
          <button onClick={toggleAllVisible} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5, marginBottom: 10 }}>
            {allVisibleSelected ? 'Харагдаж буйг цуцлах' : 'Харагдаж буйг бүгдийг сонгох'}
          </button>
          <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18, border: '1.5px solid var(--border)', borderRadius: 12, padding: 8 }}>
            {visibleWords.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 16, fontSize: 13 }}>Илэрц алга</p>}
            {visibleWords.map(w => {
              const sel = selectedIds.has(w.id);
              return (
                <div key={w.id} onClick={() => toggleWord(w.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '9px 11px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${sel ? 'var(--purple)' : 'var(--border)'}`, background: sel ? 'var(--purple-light)' : '#fff',
                }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${sel ? 'var(--purple)' : 'var(--border)'}`, background: sel ? 'var(--purple)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{sel ? '✓' : ''}</span>
                  <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)' }}>{w.word}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{w.meaning}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 8 }}>Дасгалын төрөл</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {EXAM_TYPES.map(t => {
          const on = types.has(t.key);
          return (
            <button key={t.key} onClick={() => toggleType(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit',
              border: `1.5px solid ${on ? 'var(--purple)' : 'var(--border)'}`, background: on ? 'var(--purple-light)' : '#fff',
              color: on ? 'var(--purple)' : 'var(--text-sub)', fontWeight: 700, fontSize: 13,
            }}>{t.icon} {t.title}</button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 18, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 8 }}>Асуултын тоо</label>
          <select value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} disabled={!countOptions.length} style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'inherit', fontWeight: 700 }}>
            {countOptions.map(n => <option key={n} value={n}>{n === selectedIds.size ? `Бүгд (${n})` : n}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 8 }}>Хугацаа</label>
          <select value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'inherit', fontWeight: 700 }}>
            {TIME_LIMIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Болих</button>
        <button className="btn btn-purple" onClick={save} disabled={saving} style={{ flex: 1 }}>
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </button>
      </div>
    </div>
  );
}

function chipStyle(active) {
  return {
    padding: '6px 12px', borderRadius: 100, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    border: `1.5px solid ${active ? 'var(--purple)' : 'var(--border)'}`,
    background: active ? 'var(--purple-light)' : '#fff',
    color: active ? 'var(--purple)' : 'var(--text-sub)',
  };
}
