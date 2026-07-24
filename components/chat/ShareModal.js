'use client';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';

export default function ShareModal({ onClose, onSendWord, onSendDeck }) {
  const [tab, setTab] = useState('word');
  const [words, setWords] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/words').then(r => setWords(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const folders = useMemo(() => {
    const map = {};
    words.forEach(w => {
      const name = w.group || 'Ерөнхий';
      if (!map[name]) map[name] = { name, lang: w.lang, words: [] };
      map[name].words.push(w);
    });
    return Object.values(map);
  }, [words]);

  const filteredWords = words.filter(w => !q.trim() || w.word.toLowerCase().includes(q.toLowerCase()) || w.meaning.toLowerCase().includes(q.toLowerCase()));
  const filteredFolders = folders.filter(f => !q.trim() || f.name.toLowerCase().includes(q.toLowerCase()));

  function sendWord(w) {
    onSendWord({ word: w.word, meaning: w.meaning, reading: w.reading || '', lang: w.lang || 'zh' });
    onClose();
  }
  function sendDeck(f) {
    onSendDeck({
      folderName: f.name, lang: f.lang || 'zh',
      words: f.words.map(w => ({ word: w.word, meaning: w.meaning, reading: w.reading || '' })),
    });
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,10,30,0.4)' }} />
      <div data-testid="share-modal" style={{ position: 'relative', width: 420, maxWidth: '92vw', maxHeight: '80vh', background: '#fff', borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>📖 Үг/Багц хуваалцах</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted)' }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[['word', 'Нэг үг'], ['deck', 'Багц']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '8px 14px', borderRadius: 100, fontWeight: 800, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
              border: tab === k ? 'none' : '1.5px solid var(--border)',
              background: tab === k ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#fff',
              color: tab === k ? '#fff' : 'var(--text-sub)',
            }}>{l}</button>
          ))}
        </div>

        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Хайх..." style={{
          border: '1.5px solid var(--border)', borderRadius: 12, padding: '9px 13px', fontSize: 13.5,
          fontFamily: 'inherit', outline: 'none', marginBottom: 12,
        }} />

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><div className="spinner" /></div>
          ) : tab === 'word' ? (
            filteredWords.length === 0 ? <Empty /> : filteredWords.map(w => (
              <Row key={w.id} title={w.word} sub={w.meaning} onSend={() => sendWord(w)} />
            ))
          ) : (
            filteredFolders.length === 0 ? <Empty /> : filteredFolders.map(f => (
              <Row key={f.name} title={`📁 ${f.name}`} sub={`${f.words.length} үг`} onSend={() => sendDeck(f)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ title, sub, onSend }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 10px', borderRadius: 12, marginBottom: 4 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{sub}</div>
      </div>
      <button onClick={onSend} className="btn btn-purple" style={{ padding: '6px 14px', fontSize: 12 }}>Илгээх</button>
    </div>
  );
}
function Empty() {
  return <div style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600, padding: 30 }}>Юу ч олдсонгүй.</div>;
}
