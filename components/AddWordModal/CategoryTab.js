'use client';
import { useState, useMemo } from 'react';
import api from '@/lib/api';
import { getCourses } from '@/lib/courses';
import { AI_LANGS } from './constants';

// Урьдчилан бэлтгэсэн курсын үгсийн сангаас ангилалаар нь олноор сонгож нэмнэ (AI хэрэггүй).
export default function CategoryTab({ aiLang, setAiLang, targetGroup, onAdded }) {
  const [activeCat, setActiveCat] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const categories = useMemo(() => getCourses(aiLang), [aiLang]);
  const supported = aiLang === 'en' || aiLang === 'zh';
  const cat = categories.find(c => c.id === activeCat);

  function selectLang(code) {
    setAiLang(code);
    setActiveCat(null);
    setChecked(new Set());
  }

  function toggle(wordId) {
    setChecked(s => {
      const next = new Set(s);
      if (next.has(wordId)) next.delete(wordId); else next.add(wordId);
      return next;
    });
  }

  async function addSelected() {
    if (!cat || checked.size === 0) return;
    setBusy(true);
    const entries = cat.words.filter(w => checked.has(w.id)).map(w => ({
      word: w.target, meaning: w.mn, reading: w.reading, pos: w.type,
      example: w.examples?.[0]?.en || '', exampleMeaning: w.examples?.[0]?.mn || '',
      synonyms: w.synonyms || [], antonyms: w.antonyms || [],
    }));
    try {
      const { data } = await api.post('/api/words/bulk', { lang: aiLang, group: targetGroup, entries });
      setToast(`✓ ${data.addedCount} үг нэмэгдлээ${data.skipped.length ? `, ${data.skipped.length} алгассан (давхцсан)` : ''}`);
      setChecked(new Set());
      onAdded?.();
      setTimeout(() => setToast(''), 3000);
    } catch {
      alert('Үг нэмэхэд алдаа гарлаа.');
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {AI_LANGS.map(l => (
          <button key={l.code} type="button" onClick={() => selectLang(l.code)} style={{
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
          🔜 Энэ хэлээр бэлэн ангилал тун удахгүй. Одоохондоо "Шинэ үг нэмэх" табаар AI ашиглан нэмнэ үү.
        </div>
      ) : !cat ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
          {categories.map(c => (
            <button key={c.id} type="button" onClick={() => setActiveCat(c.id)} disabled={!c.words.length} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px',
              borderRadius: 14, border: '1.5px solid var(--border)', background: '#fff', cursor: c.words.length ? 'pointer' : 'default',
              opacity: c.words.length ? 1 : 0.4, fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 24 }}>{c.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textAlign: 'center' }}>{c.name}</span>
              <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{c.words.length} үг</span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <button onClick={() => { setActiveCat(null); setChecked(new Set()); }} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12.5 }}>← Буцах</button>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{cat.emoji} {cat.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{checked.size} сонгогдсон</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto', marginBottom: 14 }}>
            {cat.words.map(w => {
              const on = checked.has(w.id);
              return (
                <div key={w.id} onClick={() => toggle(w.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${on ? cat.color : 'var(--border)'}`, background: on ? `${cat.color}12` : '#fff',
                }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${on ? cat.color : 'var(--border)'}`, background: on ? cat.color : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{on ? '✓' : ''}</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{w.target}</span>
                  {w.reading && <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>{w.reading}</span>}
                  <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{w.mn}</span>
                </div>
              );
            })}
          </div>
          {toast && <div style={{ fontSize: 12.5, color: 'var(--purple)', fontWeight: 700, marginBottom: 10 }}>{toast}</div>}
          <button className="btn btn-purple" onClick={addSelected} disabled={busy || checked.size === 0} style={{ width: '100%' }}>
            {busy ? 'Нэмж байна…' : `+ ${checked.size || ''} үг нэмэх`}
          </button>
        </div>
      )}
    </div>
  );
}
