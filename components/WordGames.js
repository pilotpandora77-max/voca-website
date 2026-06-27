'use client';
import { useState, useEffect } from 'react';

function norm(w) {
  return {
    front: w.target || w.front || w.word || w.simplified || '',
    back:  w.mn || w.back || w.meaning || w.meaningEn || '',
    hint:  w.reading || w.hint || w.ipa || w.pinyin || '',
    emoji: w.emoji || '',
  };
}
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const MODES = [
  { id: 'choice', icon: '🎯', title: 'Олон сонголт', desc: 'Зөв орчуулгыг сонго', color: '#7C3AED', bg: '#EDE9FF' },
  { id: 'listen', icon: '🔊', title: 'Сонсож таних', desc: 'Дуудлагыг сонсоод сонго', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'match',  icon: '🔗', title: 'Хос тааруулах', desc: 'Үгсийг утгатай нь холбо', color: '#10B981', bg: '#ECFDF5' },
  { id: 'type',   icon: '⌨️', title: 'Утга бичих', desc: 'Үгийн утгыг бичих', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'memory', icon: '🧠', title: 'Санах ой', desc: 'Картуудыг эргүүлж хослуул', color: '#EC4899', bg: '#FDF2F8' },
];

export default function WordGames({ words: raw, sttLang = 'zh-CN' }) {
  const words = (raw || []).map(norm).filter(w => w.front && w.back);
  const [game, setGame] = useState(null);

  function speak(t) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = sttLang; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  if (words.length < 4) return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>🎮</div>
      <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Тоглоом тоглохын тулд дор хаяж 4 үг хэрэгтэй.</p>
    </div>
  );

  if (!game) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
      {MODES.map(m => (
        <button key={m.id} onClick={() => setGame(m.id)} style={{ textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 18, padding: 18, transition: 'all 0.16s', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + '66'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 24px ${m.color}22`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>{m.icon}</div>
          <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{m.title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>{m.desc}</div>
        </button>
      ))}
    </div>
  );

  const meta = MODES.find(m => m.id === game);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setGame(null)} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 17, color: 'var(--text-sub)' }}>←</button>
        <h3 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)' }}>{meta.icon} {meta.title}</h3>
      </div>
      {(game === 'choice' || game === 'listen') && <ChoiceGame words={words} mode={game} speak={speak} onExit={() => setGame(null)} />}
      {game === 'match' && <MatchGame words={words} onExit={() => setGame(null)} />}
      {game === 'type' && <TypeGame words={words} onExit={() => setGame(null)} />}
      {game === 'memory' && <MemoryGame words={words} onExit={() => setGame(null)} />}
    </div>
  );
}

function Progress({ idx, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}><div style={{ height: '100%', background: 'var(--purple)', borderRadius: 8, width: `${((idx + 1) / total) * 100}%`, transition: 'width 0.3s' }} /></div>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>{idx + 1}/{total}</span>
    </div>
  );
}
function Result({ score, total, label = 'оноо', onExit }) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '🎉' : '💪'}</div>
      <h2 style={{ fontWeight: 900, fontSize: 24, color: 'var(--purple)', marginBottom: 8 }}>{label === 'оноо' ? `${score} / ${total}` : `${score} ${label}`}</h2>
      {label === 'оноо' && <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 20 }}>{pct}% зөв</p>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => location.reload()} className="btn btn-purple" style={{ padding: '11px 24px' }}>Дахин</button>
        <button onClick={onExit} className="btn btn-ghost" style={{ padding: '11px 24px' }}>Горим солих</button>
      </div>
    </div>
  );
}

function ChoiceGame({ words, mode, speak, onExit }) {
  const ROUNDS = Math.min(10, words.length);
  const [questions] = useState(() => shuffle(words).slice(0, ROUNDS).map(correct => {
    const opts = shuffle([correct, ...shuffle(words.filter(w => w.back !== correct.back)).slice(0, 3)]);
    return { correct, opts, answer: opts.indexOf(correct) };
  }));
  const [idx, setIdx] = useState(0); const [sel, setSel] = useState(null); const [conf, setConf] = useState(false); const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  const q = questions[idx];
  useEffect(() => { if (mode === 'listen' && q) speak(q.correct.front); }, [idx]);
  function pick(i) { if (conf) return; setSel(i); setConf(true); if (i === q.answer) setScore(s => s + 1); }
  function next() { if (idx + 1 >= questions.length) setDone(true); else { setIdx(i => i + 1); setSel(null); setConf(false); } }
  if (done) return <Result score={score} total={questions.length} onExit={onExit} />;
  return (
    <div className="card">
      <Progress idx={idx} total={questions.length} />
      <div style={{ textAlign: 'center', padding: '26px 16px 20px' }}>
        {mode === 'listen' ? (
          <button onClick={() => speak(q.correct.front)} style={{ width: 90, height: 90, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(145deg,#3B82F6,#2563EB)', color: '#fff', fontSize: 40, boxShadow: '0 8px 22px rgba(59,130,246,0.4)' }}>🔊</button>
        ) : (
          <>
            <div style={{ fontSize: 56, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{q.correct.front}</div>
            {q.correct.hint && <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 17, marginTop: 6 }}>{q.correct.hint}</div>}
          </>
        )}
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, marginTop: 12 }}>Зөв орчуулгыг сонго</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {q.opts.map((o, i) => {
          let bg = 'var(--bg-alt)', bd = 'var(--border)', cl = 'var(--text)';
          if (conf) { if (i === q.answer) { bg = 'var(--green-bg)'; bd = 'var(--green)'; cl = 'var(--green-dark)'; } else if (i === sel) { bg = 'var(--red-light)'; bd = 'var(--red)'; cl = 'var(--red)'; } }
          return <button key={i} disabled={conf} onClick={() => pick(i)} style={{ padding: '15px', borderRadius: 14, border: `2px solid ${bd}`, background: bg, color: cl, fontWeight: 800, fontSize: 15, cursor: conf ? 'default' : 'pointer', fontFamily: 'inherit' }}>{o.back}</button>;
        })}
      </div>
      {conf && <button onClick={next} className="btn btn-purple" style={{ width: '100%', marginTop: 16 }}>{idx + 1 >= questions.length ? 'Дүн' : 'Дараах →'}</button>}
    </div>
  );
}

function MatchGame({ words, onExit }) {
  const PAIRS = Math.min(6, words.length);
  const [pool] = useState(() => shuffle(words).slice(0, PAIRS));
  const [leftCol] = useState(() => shuffle(pool));
  const [rightCol] = useState(() => shuffle(pool));
  const [selL, setSelL] = useState(null); const [matched, setMatched] = useState(new Set()); const [wrong, setWrong] = useState(null); const [tries, setTries] = useState(0);
  function clickR(w) {
    if (!selL || matched.has(w.front)) return;
    setTries(t => t + 1);
    if (w.front === selL) { const n = new Set(matched); n.add(w.front); setMatched(n); setSelL(null); }
    else { setWrong(w.front); setTimeout(() => setWrong(null), 500); setSelL(null); }
  }
  if (matched.size === pool.length) return <Result score={pool.length} total={tries || pool.length} label="хос таарсан" onExit={onExit} />;
  const cell = (active, isM, isW) => ({ padding: '15px', borderRadius: 14, cursor: isM ? 'default' : 'pointer', border: `2px solid ${isW ? 'var(--red)' : active ? 'var(--purple)' : isM ? 'var(--green)' : 'var(--border)'}`, background: isW ? 'var(--red-light)' : active ? 'var(--purple-light)' : isM ? 'var(--green-bg)' : 'var(--bg-alt)', opacity: isM ? 0.5 : 1, fontWeight: 800, fontSize: 16, textAlign: 'center', color: 'var(--text)', transition: 'all 0.15s' });
  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 16, color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Үгийг утгатай нь холбо · {matched.size}/{pool.length}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leftCol.map(w => <div key={w.front} onClick={() => !matched.has(w.front) && setSelL(w.front)} style={cell(selL === w.front, matched.has(w.front), false)}>{w.front}</div>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rightCol.map(w => <div key={w.front} onClick={() => clickR(w)} style={cell(false, matched.has(w.front), wrong === w.front)}>{w.back}</div>)}
        </div>
      </div>
    </div>
  );
}

function TypeGame({ words, onExit }) {
  const ROUNDS = Math.min(8, words.length);
  const [questions] = useState(() => shuffle(words).slice(0, ROUNDS));
  const [idx, setIdx] = useState(0); const [val, setVal] = useState(''); const [conf, setConf] = useState(false); const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  const q = questions[idx];
  function check() { if (conf || !val.trim()) return; setConf(true); if (val.trim().toLowerCase() === q.back.trim().toLowerCase()) setScore(s => s + 1); }
  function next() { if (idx + 1 >= questions.length) setDone(true); else { setIdx(i => i + 1); setVal(''); setConf(false); } }
  const correct = conf && val.trim().toLowerCase() === q.back.trim().toLowerCase();
  if (done) return <Result score={score} total={questions.length} onExit={onExit} />;
  return (
    <div className="card">
      <Progress idx={idx} total={questions.length} />
      <div style={{ textAlign: 'center', padding: '24px 16px 18px' }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: 'var(--text)' }}>{q.front}</div>
        {q.hint && <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 16, marginTop: 6 }}>{q.hint}</div>}
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, marginTop: 12 }}>Энэ үгийн утгыг бичээрэй</div>
      </div>
      <input value={val} onChange={e => setVal(e.target.value)} disabled={conf} onKeyDown={e => { if (e.key === 'Enter') (conf ? next() : check()); }} placeholder="Утга..." autoFocus style={{ textAlign: 'center', fontSize: 16, fontWeight: 700 }} />
      {conf && <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, fontWeight: 800, textAlign: 'center', background: correct ? 'var(--green-bg)' : 'var(--red-light)', border: `2px solid ${correct ? 'var(--green)' : 'var(--red)'}`, color: correct ? 'var(--green-dark)' : 'var(--red)' }}>{correct ? '🎉 Зөв!' : `Зөв хариулт: ${q.back}`}</div>}
      <button onClick={conf ? next : check} disabled={!val.trim()} className="btn btn-purple" style={{ width: '100%', marginTop: 14 }}>{conf ? (idx + 1 >= questions.length ? 'Дүн' : 'Дараах →') : 'Шалгах'}</button>
    </div>
  );
}

function MemoryGame({ words, onExit }) {
  const PAIRS = Math.min(6, words.length);
  const [cards] = useState(() => {
    const pool = shuffle(words).slice(0, PAIRS);
    const deck = [];
    pool.forEach((w, i) => { deck.push({ id: `${i}f`, pair: i, text: w.front }); deck.push({ id: `${i}b`, pair: i, text: w.back }); });
    return shuffle(deck);
  });
  const [flipped, setFlipped] = useState([]); const [matched, setMatched] = useState(new Set()); const [moves, setMoves] = useState(0);
  function flip(c) {
    if (flipped.length === 2 || flipped.find(f => f.id === c.id) || matched.has(c.pair)) return;
    const nf = [...flipped, c];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves(m => m + 1);
      if (nf[0].pair === nf[1].pair) { const n = new Set(matched); n.add(c.pair); setMatched(n); setTimeout(() => setFlipped([]), 400); }
      else setTimeout(() => setFlipped([]), 800);
    }
  }
  if (matched.size === PAIRS) return <Result score={PAIRS} total={moves} label="алхамтай" onExit={onExit} />;
  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 16, color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Картуудыг эргүүлж хослуул · {matched.size}/{PAIRS} · {moves} алхам</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {cards.map(c => {
          const isUp = flipped.find(f => f.id === c.id) || matched.has(c.pair);
          return (
            <button key={c.id} onClick={() => flip(c)} style={{
              aspectRatio: '3/4', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
              border: `2px solid ${matched.has(c.pair) ? 'var(--green)' : isUp ? 'var(--purple)' : 'var(--border)'}`,
              background: matched.has(c.pair) ? 'var(--green-bg)' : isUp ? 'var(--purple-light)' : 'var(--bg-alt)',
              fontWeight: 800, fontSize: 15, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, transition: 'all 0.2s',
            }}>{isUp ? c.text : '?'}</button>
          );
        })}
      </div>
    </div>
  );
}
