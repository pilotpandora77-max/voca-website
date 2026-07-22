'use client';
import { useState } from 'react';

const DEFAULT_GROUP = 'Ерөнхий';

// Хэрэглэгчийн аль хэдийн нэмсэн үгсээс сонгож энэ бүлэгт шилжүүлнэ
// (нэг үг зэрэг зөвхөн нэг бүлэгт байна).
export default function MyWordsTab({ words, activeGroup, setWordGroup, onDone }) {
  const [q, setQ] = useState('');

  const list = words.filter(w => {
    const query = q.toLowerCase();
    const f = (w.front || w.word || ''), b = (w.back || w.meaning || '');
    return !query || f.toLowerCase().includes(query) || b.toLowerCase().includes(query);
  });

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
        Аль хэдийн нэмсэн үгсээсээ сонгож "{activeGroup}" бүлэгт шилжүүлнэ үү.
      </p>
      <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Үг хайх..." style={{ width: '100%', marginBottom: 12 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto', marginBottom: 14 }}>
        {list.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20, fontSize: 13 }}>Үг алга.</p>}
        {list.map(w => {
          const wid = w._id || w.id;
          const inGroup = (w.group || DEFAULT_GROUP) === activeGroup;
          const f = w.front || w.word || '', b = w.back || w.meaning || '';
          return (
            <div key={wid} onClick={() => setWordGroup(w, inGroup ? DEFAULT_GROUP : activeGroup)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${inGroup ? 'var(--purple)' : 'var(--border)'}`, background: inGroup ? 'var(--purple-light)' : '#fff',
            }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${inGroup ? 'var(--purple)' : 'var(--border)'}`, background: inGroup ? 'var(--purple)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{inGroup ? '✓' : ''}</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{f}</span>
              <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{b}</span>
            </div>
          );
        })}
      </div>
      <button className="btn btn-purple" onClick={onDone} style={{ width: '100%' }}>Болсон</button>
    </div>
  );
}
