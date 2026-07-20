'use client';
import { useState, useEffect, useRef } from 'react';
import { Progress, Result } from './ExerciseUI';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FillBlankGame({ words, onExit, exitLabel }) {
  const ROUNDS = Math.min(10, words.length);
  const [questions] = useState(() => shuffle(words).slice(0, ROUNDS).map(w => {
    const chars = [...w.front];
    const n = chars.length;
    const maskCount = n <= 1 ? 1 : Math.min(n - 1, Math.max(1, Math.round(n * 0.35)));
    const masked = new Set(shuffle(chars.map((_, i) => i)).slice(0, maskCount));
    return { ...w, chars, masked };
  }));
  const [idx, setIdx]     = useState(0);
  const [vals, setVals]   = useState([]);
  const [conf, setConf]   = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone]   = useState(false);
  const inputRefs = useRef([]);
  const q = questions[idx];

  useEffect(() => {
    setVals(q.chars.map((c, i) => (q.masked.has(i) ? '' : c)));
    const firstMasked = q.chars.findIndex((_, i) => q.masked.has(i));
    setTimeout(() => inputRefs.current[firstMasked]?.focus(), 50);
  }, [idx]);

  function onChar(i, v) {
    if (conf) return;
    const c = v.slice(-1);
    setVals(vs => vs.map((x, j) => (j === i ? c : x)));
    if (c) {
      const maskedIdxs = q.chars.map((_, j) => j).filter(j => q.masked.has(j));
      const nextIdx = maskedIdxs[maskedIdxs.indexOf(i) + 1];
      if (nextIdx !== undefined) inputRefs.current[nextIdx]?.focus();
    }
  }
  function check() {
    if (conf) return;
    setConf(true);
    if (vals.join('').toLowerCase() === q.front.toLowerCase()) setScore(s => s + 1);
  }
  function next() {
    if (idx + 1 >= questions.length) setDone(true);
    else { setIdx(i => i + 1); setConf(false); }
  }
  const correct = conf && vals.join('').toLowerCase() === q.front.toLowerCase();
  const allFilled = vals.length > 0 && vals.every(v => v);

  if (done) return <Result score={score} total={questions.length} onExit={onExit} onRetry={() => location.reload()} exitLabel={exitLabel} />;

  return (
    <div className="card">
      <Progress idx={idx} total={questions.length} />
      <div style={{ textAlign: 'center', padding: '24px 16px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{q.back}</div>
        {q.hint && <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 15, marginTop: 4 }}>{q.hint}</div>}
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, marginTop: 10 }}>Дутуу үлдсэн үсгийг бичиж гүйцээ</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {q.chars.map((c, i) => q.masked.has(i) ? (
          <input key={i} ref={el => inputRefs.current[i] = el} value={vals[i] || ''} disabled={conf}
            onChange={e => onChar(i, e.target.value)} maxLength={1}
            style={{
              width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 900, borderRadius: 10,
              border: `2px solid ${conf ? (correct ? 'var(--green)' : 'var(--red)') : 'var(--purple-mid)'}`,
              background: conf ? (correct ? 'var(--green-bg)' : 'var(--red-light)') : 'var(--bg-alt)',
              color: 'var(--text)',
            }} />
        ) : (
          <div key={i} style={{ width: 44, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>{c}</div>
        ))}
      </div>
      {conf && !correct && (
        <div style={{ textAlign: 'center', fontWeight: 800, color: 'var(--red)', marginBottom: 12 }}>Зөв хариулт: {q.front}</div>
      )}
      <button onClick={conf ? next : check} disabled={!allFilled} className="btn btn-purple" style={{ width: '100%' }}>
        {conf ? (idx + 1 >= questions.length ? 'Дүн харах' : 'Дараах →') : 'Шалгах'}
      </button>
    </div>
  );
}
