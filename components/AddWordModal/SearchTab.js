'use client';
import { useState, useRef } from 'react';
import api from '@/lib/api';
import { AI_LANGS } from './constants';

// Тогтмол толь бичгээс (englishDict.json / CC-CEDICT) хайж шууд нэмнэ — AI хэрэггүй,
// өгөгдөл бэлэн тул шууд POST /api/words.
export default function SearchTab({ aiLang, setAiLang, targetGroup, onAdded }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [addedWord, setAddedWord] = useState(null);
  const debounceRef = useRef(null);

  const curLang = AI_LANGS.find(l => l.code === aiLang);
  const supported = aiLang === 'en' || aiLang === 'zh';

  function onQueryChange(v) {
    setQ(v);
    clearTimeout(debounceRef.current);
    if (!supported || v.trim().length < 1) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setBusy(true);
      try {
        if (aiLang === 'en') {
          const { data } = await api.get('/api/english', { params: { q: v.trim() } });
          setResults((data || []).slice(0, 20).map(e => ({
            word: e.word, reading: e.ipa || '', meaning: e.mn || '', pos: e.posMn || '',
          })));
        } else {
          const { data } = await api.get('/api/dictionary', { params: { q: v.trim() } });
          setResults((data || []).slice(0, 20).map(e => ({
            word: e.simplified, reading: e.pinyin || '', meaning: e.mn || (e.definitions || []).join('; '), pos: e.pos || '',
          })));
        }
      } catch { setResults([]); }
      setBusy(false);
    }, 300);
  }

  async function addResult(r) {
    if (!r.meaning) return;
    try {
      await api.post('/api/words', {
        front: r.word, back: r.meaning, hint: r.reading,
        word: r.word, meaning: r.meaning, reading: r.reading, lang: aiLang, pos: r.pos,
        group: targetGroup,
      });
      setAddedWord(r.word);
      setTimeout(() => setAddedWord(null), 2000);
      onAdded?.();
    } catch (e) {
      const msg = e.response?.data?.code === 'WORD_LIMIT'
        ? 'Үгийн хязгаарт хүрсэн байна.'
        : 'Үг нэмэхэд алдаа гарлаа.';
      alert(msg);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {AI_LANGS.map(l => (
          <button key={l.code} type="button" onClick={() => { setAiLang(l.code); setQ(''); setResults([]); }} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
            border: `1.5px solid ${aiLang === l.code ? 'var(--purple)' : 'var(--border)'}`,
            background: aiLang === l.code ? 'var(--purple-light)' : 'var(--bg-alt)',
            color: aiLang === l.code ? 'var(--purple)' : 'var(--text-sub)',
          }}>
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {!supported ? (
        <div className="card" style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>
          🔜 Энэ хэлээр хайлт тун удахгүй нэмэгдэнэ. Одоохондоо "Шинэ үг нэмэх" табаар AI ашиглан нэмнэ үү.
        </div>
      ) : (
        <>
          <input type="text" value={q} onChange={e => onQueryChange(e.target.value)} placeholder={`${curLang.wordLabel} хайх...`} style={{ width: '100%', marginBottom: 14 }} autoFocus />
          {busy && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Хайж байна…</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 380, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{r.word}</span>
                    {r.reading && <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>{r.reading}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.meaning}</div>
                </div>
                <button type="button" onClick={() => addResult(r)} className="btn btn-light" style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }}>
                  {addedWord === r.word ? '✓ Нэмэгдлээ' : '+ Нэмэх'}
                </button>
              </div>
            ))}
            {!busy && q.trim() && results.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: 20 }}>Олдсонгүй.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
