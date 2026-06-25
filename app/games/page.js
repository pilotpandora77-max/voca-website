'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

/* ── Helpers ── */
function norm(w) {
  return {
    front: w.front || w.word || w.simplified || '',
    back:  w.back  || w.meaning || w.meaningEn || '',
    hint:  w.hint  || w.reading || w.pinyin || '',
  };
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN'; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

const GAMES = [
  { id: 'choice',   icon: '🎯', title: 'Олон сонголт',   desc: 'Хятад үгийн зөв орчуулгыг сонго', color: '#7C3AED', bg: '#EDE9FF' },
  { id: 'match',    icon: '🔗', title: 'Хос тааруулах',  desc: 'Хятад ↔ Монгол үгсийг холбо',     color: '#10B981', bg: '#ECFDF5' },
  { id: 'listen',   icon: '🔊', title: 'Сонсож таних',   desc: 'Дуудлагыг сонсоод тэмдэгт сонго', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'type',     icon: '⌨️', title: 'Утга бичих',     desc: 'Хятад үгийн утгыг бичих',          color: '#F59E0B', bg: '#FEF3C7' },
];

export default function GamesPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [words, setWords]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [game, setGame]     = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user]);

  async function load() {
    setLoad(true);
    try {
      const [w, s] = await Promise.all([
        api.get('/api/words'),
        api.get('/api/streak').catch(() => ({ data: {} })),
      ]);
      setWords((w.data || []).map(norm).filter(x => x.front && x.back));
      setStreak(s.data.streak || 0);
    } catch {}
    setLoad(false);
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );

  const enough = words.length >= 4;

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Тоглоомоор суралц 🎮" subtitle="Үгсээ тоглоомоор бататга" streak={streak} />

      <div style={{ padding: '0 28px', maxWidth: 900, margin: '0 auto' }}>
        {!enough ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>📚</div>
            <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>Тоглоом тоглохын тулд дор хаяж 4 үг хэрэгтэй</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 22 }}>Та одоогоор {words.length} үгтэй байна. Толиос үг нэмээрэй!</p>
            <Link href="/dictionary" className="btn btn-purple" style={{ textDecoration: 'none', padding: '12px 26px' }}>Толь руу очих →</Link>
          </div>
        ) : !game ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {GAMES.map(g => (
              <button key={g.id} onClick={() => setGame(g.id)} style={{
                textAlign: 'left', cursor: 'pointer', background: '#fff',
                border: '1.5px solid var(--border)', borderRadius: 20, padding: '22px',
                transition: 'all 0.16s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = g.color + '66'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${g.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14 }}>{g.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)', marginBottom: 5 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.4 }}>{g.desc}</div>
              </button>
            ))}
          </div>
        ) : (
          <GameRunner game={game} words={words} onExit={() => setGame(null)} />
        )}
      </div>
    </div>
  );
}

/* ════════════ Game Runner ════════════ */
function GameRunner({ game, words, onExit }) {
  const meta = GAMES.find(g => g.id === game);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onExit} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: 18, color: 'var(--text-sub)' }}>←</button>
        <h2 style={{ fontWeight: 900, fontSize: 19, color: 'var(--text)' }}>{meta.icon} {meta.title}</h2>
      </div>
      {game === 'choice'  && <ChoiceGame  words={words} onExit={onExit} mode="meaning" />}
      {game === 'listen'  && <ChoiceGame  words={words} onExit={onExit} mode="listen" />}
      {game === 'match'   && <MatchGame   words={words} onExit={onExit} />}
      {game === 'type'    && <TypeGame    words={words} onExit={onExit} />}
    </div>
  );
}

/* ── Олон сонголт / Сонсож таних ── */
function ChoiceGame({ words, onExit, mode }) {
  const ROUNDS = Math.min(10, words.length);
  const [questions] = useState(() => {
    const picked = shuffle(words).slice(0, ROUNDS);
    return picked.map(correct => {
      const distractors = shuffle(words.filter(w => w.back !== correct.back)).slice(0, 3);
      const opts = shuffle([correct, ...distractors]);
      return { correct, opts, answer: opts.indexOf(correct) };
    });
  });
  const [idx, setIdx]   = useState(0);
  const [sel, setSel]   = useState(null);
  const [conf, setConf] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  useEffect(() => {
    if (mode === 'listen' && q) speak(q.correct.front);
  }, [idx]);

  function pick(i) {
    if (conf) return;
    setSel(i); setConf(true);
    if (i === q.answer) setScore(s => s + 1);
  }
  function next() {
    if (idx + 1 >= questions.length) setDone(true);
    else { setIdx(i => i + 1); setSel(null); setConf(false); }
  }

  if (done) return <Result score={score} total={questions.length} onExit={onExit} onRetry={() => location.reload()} />;

  return (
    <div className="card">
      <Progress idx={idx} total={questions.length} />
      {/* Prompt */}
      <div style={{ textAlign: 'center', padding: '30px 16px 24px' }}>
        {mode === 'listen' ? (
          <button onClick={() => speak(q.correct.front)} style={{
            width: 96, height: 96, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(145deg,#3B82F6,#2563EB)', color: '#fff', fontSize: 44,
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
          }}>🔊</button>
        ) : (
          <>
            <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{q.correct.front}</div>
            {q.correct.hint && <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 18, marginTop: 8 }}>{q.correct.hint}</div>}
          </>
        )}
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, marginTop: 14 }}>
          {mode === 'listen' ? 'Сонссон үгийн утгыг сонго' : 'Зөв орчуулгыг сонго'}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {q.opts.map((o, i) => {
          let bg = 'var(--bg-alt)', border = 'var(--border)', clr = 'var(--text)';
          if (conf) {
            if (i === q.answer) { bg = 'var(--green-bg)'; border = 'var(--green)'; clr = 'var(--green-dark)'; }
            else if (i === sel) { bg = 'var(--red-light)'; border = 'var(--red)'; clr = 'var(--red)'; }
          }
          return (
            <button key={i} disabled={conf} onClick={() => pick(i)} style={{
              padding: '16px', borderRadius: 14, border: `2px solid ${border}`, background: bg, color: clr,
              fontWeight: 800, fontSize: 15, cursor: conf ? 'default' : 'pointer', transition: 'all 0.15s', textAlign: 'center',
            }}>
              {o.back}
            </button>
          );
        })}
      </div>

      {conf && (
        <button onClick={next} className="btn btn-purple" style={{ width: '100%', marginTop: 16 }}>
          {idx + 1 >= questions.length ? 'Дүн харах' : 'Дараах →'}
        </button>
      )}
    </div>
  );
}

/* ── Хос тааруулах ── */
function MatchGame({ words, onExit }) {
  const PAIRS = Math.min(6, words.length);
  const [pool] = useState(() => shuffle(words).slice(0, PAIRS));
  const [leftCol]  = useState(() => shuffle(pool));
  const [rightCol] = useState(() => shuffle(pool));
  const [selL, setSelL]   = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrong, setWrong] = useState(null);
  const [tries, setTries] = useState(0);

  function clickL(w) { if (!matched.has(w.front)) setSelL(w.front); }
  function clickR(w) {
    if (!selL || matched.has(w.front)) return;
    setTries(t => t + 1);
    if (w.front === selL) {
      const n = new Set(matched); n.add(w.front); setMatched(n); setSelL(null);
    } else {
      setWrong(w.front);
      setTimeout(() => setWrong(null), 500);
      setSelL(null);
    }
  }

  const done = matched.size === pool.length;
  if (done) return <Result score={pool.length} total={tries || pool.length} label="оролдлого" onExit={onExit} onRetry={() => location.reload()} />;

  const cellStyle = (active, isMatched, isWrong, color) => ({
    padding: '16px', borderRadius: 14, cursor: isMatched ? 'default' : 'pointer',
    border: `2px solid ${isWrong ? 'var(--red)' : active ? color : isMatched ? 'var(--green)' : 'var(--border)'}`,
    background: isWrong ? 'var(--red-light)' : active ? 'var(--purple-light)' : isMatched ? 'var(--green-bg)' : 'var(--bg-alt)',
    opacity: isMatched ? 0.5 : 1, fontWeight: 800, fontSize: 16, textAlign: 'center', transition: 'all 0.15s',
    color: 'var(--text)',
  });

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: 18, color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>
        Хятад үгийг утгатай нь холбо · {matched.size}/{pool.length}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leftCol.map(w => (
            <div key={w.front} onClick={() => clickL(w)} style={cellStyle(selL === w.front, matched.has(w.front), false, 'var(--purple)')}>
              {w.front}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rightCol.map(w => (
            <div key={w.front} onClick={() => clickR(w)} style={cellStyle(false, matched.has(w.front), wrong === w.front, 'var(--purple)')}>
              {w.back}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Утга бичих ── */
function TypeGame({ words, onExit }) {
  const ROUNDS = Math.min(8, words.length);
  const [questions] = useState(() => shuffle(words).slice(0, ROUNDS));
  const [idx, setIdx]   = useState(0);
  const [val, setVal]   = useState('');
  const [conf, setConf] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[idx];

  function check() {
    if (conf || !val.trim()) return;
    setConf(true);
    const ok = val.trim().toLowerCase() === (q.back || '').trim().toLowerCase();
    if (ok) setScore(s => s + 1);
  }
  function next() {
    if (idx + 1 >= questions.length) setDone(true);
    else { setIdx(i => i + 1); setVal(''); setConf(false); }
  }
  const correct = conf && val.trim().toLowerCase() === (q.back || '').trim().toLowerCase();

  if (done) return <Result score={score} total={questions.length} onExit={onExit} onRetry={() => location.reload()} />;

  return (
    <div className="card">
      <Progress idx={idx} total={questions.length} />
      <div style={{ textAlign: 'center', padding: '28px 16px 22px' }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--text)' }}>{q.front}</div>
        {q.hint && <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 17, marginTop: 6 }}>{q.hint}</div>}
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, marginTop: 12 }}>Энэ үгийн утгыг бичээрэй</div>
      </div>
      <input value={val} onChange={e => setVal(e.target.value)} disabled={conf}
        onKeyDown={e => { if (e.key === 'Enter') (conf ? next() : check()); }}
        placeholder="Монгол утга..." autoFocus
        style={{ textAlign: 'center', fontSize: 16, fontWeight: 700 }} />
      {conf && (
        <div style={{
          marginTop: 12, padding: '12px 16px', borderRadius: 12, fontWeight: 800, textAlign: 'center',
          background: correct ? 'var(--green-bg)' : 'var(--red-light)',
          border: `2px solid ${correct ? 'var(--green)' : 'var(--red)'}`,
          color: correct ? 'var(--green-dark)' : 'var(--red)',
        }}>
          {correct ? '🎉 Зөв!' : `Зөв хариулт: ${q.back}`}
        </div>
      )}
      <button onClick={conf ? next : check} disabled={!val.trim()} className="btn btn-purple" style={{ width: '100%', marginTop: 14 }}>
        {conf ? (idx + 1 >= questions.length ? 'Дүн харах' : 'Дараах →') : 'Шалгах'}
      </button>
    </div>
  );
}

/* ── Shared bits ── */
function Progress({ idx, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--purple)', borderRadius: 8, width: `${((idx + 1) / total) * 100}%`, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>{idx + 1}/{total}</span>
    </div>
  );
}

function Result({ score, total, label = 'оноо', onExit, onRetry }) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  return (
    <div className="card" style={{ textAlign: 'center', padding: '44px 24px' }}>
      <div style={{ fontSize: 60, marginBottom: 14 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '🎉' : '💪'}</div>
      <h2 style={{ fontWeight: 900, fontSize: 24, color: 'var(--purple)', marginBottom: 8 }}>
        {label === 'оноо' ? `${score} / ${total}` : `${score} хос · ${total} ${label}`}
      </h2>
      {label === 'оноо' && <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 22 }}>{pct}% зөв</p>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onRetry} className="btn btn-purple" style={{ padding: '12px 26px' }}>Дахин тоглох</button>
        <button onClick={onExit} className="btn btn-ghost" style={{ padding: '12px 26px' }}>Тоглоом солих</button>
      </div>
    </div>
  );
}
