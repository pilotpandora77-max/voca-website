'use client';
import { useState, useEffect, useMemo, useRef } from 'react';

export function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function speak(text, lang = 'zh-CN') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}
export function speakWord(w) { speak(w.word, w.lang === 'en' ? 'en-US' : 'zh-CN'); }

export function FlashQ({ word, revealed, onReveal, onAnswer }) {
  if (!word) return null;
  return (
    <div>
      <div onClick={onReveal} style={{
        cursor: 'pointer', minHeight: 240, borderRadius: 20, border: '1.5px solid var(--border)', background: 'var(--bg-alt)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, marginBottom: 20, textAlign: 'center',
      }}>
        {!revealed ? (
          <>
            <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--text)' }}>{word.word}</div>
            {word.reading && <div style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>/{word.reading}/</div>}
            <button onClick={e => { e.stopPropagation(); speakWord(word); }} style={{
              width: 52, height: 52, borderRadius: 26, background: 'var(--purple)', border: 'none', color: '#fff',
              fontSize: 20, cursor: 'pointer', marginTop: 18,
            }}>🔊</button>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 14 }}>(дарж хариулт харах)</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--purple)' }}>{word.meaning}</div>
            {word.example && <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginTop: 12 }}>{word.example}</div>}
          </>
        )}
      </div>
      <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>Утгыг санаж байна уу?</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-red" onClick={() => onAnswer(false)} style={{ flex: 1, padding: '15px' }}>✕ Мэдэхгүй</button>
        <button className="btn btn-green" onClick={() => onAnswer(true)} style={{ flex: 1, padding: '15px' }}>✓ Мэднэ</button>
      </div>
    </div>
  );
}

export function ChoiceQ({ word, all, field, prompt, listen, picked, setPicked, onNext }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!word) return;
    const wid = word._id || word.id;
    const others = shuffle(all.filter(w => (w._id || w.id) !== wid)).slice(0, 3);
    setList(shuffle([word, ...others]));
    setPicked(null);
    if (listen) speakWord(word);
  }, [word?._id, word?.id]);
  if (!word) return null;

  return (
    <div>
      {listen ? (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700, marginBottom: 14 }}>{prompt}</div>
          <button onClick={() => speakWord(word)} style={{
            width: 72, height: 72, borderRadius: 36, background: 'var(--purple)', border: 'none', color: '#fff', fontSize: 26, cursor: 'pointer',
          }}>▶️</button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)', marginTop: 6 }}>{word.word}</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700, marginTop: 6, marginBottom: 14 }}>{prompt}</div>
        </>
      )}
      <div>
        {list.map((o, i) => {
          const sel = picked === i;
          return (
            <div key={(o._id || o.id) + '-' + i} onClick={() => setPicked(i)} style={{
              display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 10, cursor: 'pointer',
              border: `2px solid ${sel ? 'var(--purple)' : 'var(--border)'}`, background: sel ? 'var(--purple-light)' : 'var(--bg-alt)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 13, border: `2px solid ${sel ? 'var(--purple)' : 'var(--border)'}`,
                background: sel ? 'var(--purple)' : 'transparent', color: sel ? '#fff' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0,
              }}>{String.fromCharCode(65 + i)}</div>
              <span style={{ fontSize: 14.5, fontWeight: sel ? 800 : 600, color: sel ? 'var(--purple)' : 'var(--text-sub)' }}>{field === 'word' ? o.word : o.meaning}</span>
            </div>
          );
        })}
      </div>
      <button className="btn btn-purple" disabled={picked == null} onClick={() => onNext(list[picked]?.id === word.id || list[picked]?._id === word._id)}
        style={{ width: '100%', padding: '15px', marginTop: 8 }}>Дараагийн асуулт</button>
    </div>
  );
}

export function TypeQ({ word, typed, setTyped, revealed, onCheck, onNext }) {
  if (!word) return null;
  const correct = typed.trim().toLowerCase() === (word.word || '').toLowerCase() || typed.trim().toLowerCase() === (word.meaning || '').toLowerCase();
  return (
    <div>
      <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginTop: 6 }}>{word.meaning}</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700, marginTop: 6, marginBottom: 14 }}>Энэ үгийг бичнэ үү:</div>
      <input type="text" value={typed} onChange={e => setTyped(e.target.value)} disabled={revealed} autoCapitalize="off"
        placeholder="Хариултаа бич..." style={{
          fontSize: 18, fontWeight: 700, padding: 16, borderRadius: 14,
          border: `2px solid ${revealed ? (correct ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`,
          background: revealed ? (correct ? 'var(--green-light)' : 'var(--red-light)') : 'var(--bg-alt)', width: '100%',
        }} />
      {revealed && !correct && <div style={{ color: 'var(--green)', fontWeight: 800, marginTop: 10, fontSize: 14 }}>Зөв хариулт: {word.word}</div>}
      {!revealed ? (
        <button className="btn btn-purple" disabled={!typed.trim()} onClick={onCheck} style={{ width: '100%', padding: '15px', marginTop: 18 }}>Шалгах</button>
      ) : (
        <button className="btn btn-purple" onClick={() => onNext(correct)} style={{ width: '100%', padding: '15px', marginTop: 18 }}>Дараагийн асуулт</button>
      )}
    </div>
  );
}

// Дан-асуултын хувилбар (FillBlankGame.js-ийн цөмтэй адил, "Шалгалт" системийн
// navigator-grid чөлөөт шилжилтэд зориулав). Эцэг нь `key={word.id}`-ээр
// remount хийж асуулт солигдох бүрт дотоод төлөвийг цэвэрлэнэ.
export function FillBlankQ({ word, onNext }) {
  const [q] = useState(() => {
    const chars = [...word.front];
    const n = chars.length;
    const maskCount = n <= 1 ? 1 : Math.min(n - 1, Math.max(1, Math.round(n * 0.35)));
    const masked = new Set(shuffle(chars.map((_, i) => i)).slice(0, maskCount));
    return { ...word, chars, masked };
  });
  const [vals, setVals] = useState(() => q.chars.map((c, i) => (q.masked.has(i) ? '' : c)));
  const [conf, setConf] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const firstMasked = q.chars.findIndex((_, i) => q.masked.has(i));
    setTimeout(() => inputRefs.current[firstMasked]?.focus(), 50);
  }, []);

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
  const correct = vals.join('').toLowerCase() === q.front.toLowerCase();
  const allFilled = vals.length > 0 && vals.every(v => v);

  return (
    <div>
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
      <button onClick={conf ? () => onNext(correct) : () => setConf(true)} disabled={!allFilled} className="btn btn-purple" style={{ width: '100%' }}>
        {conf ? 'Дараах →' : 'Шалгах'}
      </button>
    </div>
  );
}

function normalizeSpeech(s) {
  return (s || '').trim().toLowerCase().replace(/[.,!?;:'"()]/g, '').replace(/\s+/g, ' ');
}

// Дан-асуултын хувилбар (PronounceGame.js-ийн цөмтэй адил). Тайлбар FillBlankQ-той
// ижил — эцэг `key={word.id}`-ээр remount хийнэ. Алгасах товч энд байхгүй —
// take-хуудасны ерөнхий "Алгасах" товч үүнийг хамарна.
export function PronounceQ({ word, speechLang, onNext }) {
  const [status, setStatus] = useState('idle'); // idle | listening | correct | wrong | error
  const [heard, setHeard]   = useState('');
  const [supported] = useState(() => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));

  function listen() {
    if (status === 'listening') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = speechLang; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setStatus('listening');
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setHeard(transcript);
      setStatus(normalizeSpeech(transcript) === normalizeSpeech(word.front) ? 'correct' : 'wrong');
    };
    rec.onerror = () => setStatus('error');
    setHeard('');
    rec.start();
  }

  if (!supported) return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>🎤</div>
      <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Энэ дасгал Chrome/Edge хөтчид л ажилладаг</h3>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Таны хөтөч дуу хүлээн авах (Speech Recognition) технологи дэмждэггүй байна.</p>
    </div>
  );

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '30px 16px 24px' }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{word.front}</div>
        {word.hint && <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 18, marginTop: 8 }}>{word.hint}</div>}
        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, marginTop: 14 }}>Энэ үгийг чангаар дуудаарай</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <button onClick={listen} disabled={status === 'listening'} style={{
          width: 96, height: 96, borderRadius: '50%', border: 'none', cursor: status === 'listening' ? 'default' : 'pointer',
          background: status === 'listening' ? 'linear-gradient(145deg,#EF4444,#DC2626)' : 'linear-gradient(145deg,#7C3AED,#6D28D9)',
          color: '#fff', fontSize: 40, boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
        }}>🎤</button>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
          {status === 'idle' && 'Дарж дуудаарай'}
          {status === 'listening' && 'Сонсож байна...'}
        </div>
        {(status === 'correct' || status === 'wrong') && (
          <div style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, fontWeight: 800, textAlign: 'center',
            background: status === 'correct' ? 'var(--green-bg)' : 'var(--red-light)',
            border: `2px solid ${status === 'correct' ? 'var(--green)' : 'var(--red)'}`,
            color: status === 'correct' ? 'var(--green-dark)' : 'var(--red)',
          }}>
            {status === 'correct' ? '🎉 Зөв дуудлаа!' : <>Сонссон нь: "{heard}" — дахин оролдоно уу</>}
          </div>
        )}
        {status === 'error' && (
          <div style={{ width: '100%', padding: '14px 16px', borderRadius: 12, fontWeight: 700, textAlign: 'center', background: 'var(--bg-alt)', color: 'var(--muted)' }}>
            Сонсож чадсангүй — дахин дарж оролдоно уу
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          {(status === 'error' || status === 'wrong') && (
            <button onClick={listen} className="btn btn-ghost" style={{ flex: 1 }}>🔄 Дахин оролдох</button>
          )}
          {(status === 'correct' || status === 'wrong') && (
            <button onClick={() => onNext(status === 'correct')} className="btn btn-purple" style={{ flex: 1 }}>Дараах →</button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MatchQ({ words, onDone }) {
  const BATCH = 4;
  const batches = useMemo(() => { const b = []; for (let i = 0; i < words.length; i += BATCH) b.push(words.slice(i, i + BATCH)); return b; }, [words]);
  const [bi, setBi] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [rights, setRights] = useState(() => shuffle(batches[0] || []));
  const [selL, setSelL] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrongFlash, setWrongFlash] = useState(null);

  useEffect(() => { setRights(shuffle(batches[bi] || [])); setSelL(null); setMatched({}); }, [bi]);

  function idOf(w) { return w._id || w.id; }

  function tapRight(r) {
    if (selL == null) return;
    const lw = (batches[bi] || [])[selL];
    if (!lw) return;
    if (idOf(lw) === idOf(r)) {
      const nm = { ...matched, [idOf(lw)]: true }; setMatched(nm); setCorrect(c => c + 1); setSelL(null);
      if (Object.keys(nm).length >= (batches[bi] || []).length) {
        const nb = bi + 1;
        if (nb >= batches.length) { setTimeout(() => onDone(correct + 1, words.length), 350); }
        else setTimeout(() => setBi(nb), 350);
      }
    } else { setWrongFlash(idOf(r)); setTimeout(() => setWrongFlash(null), 400); }
  }

  const curBatch = batches[bi] || [];
  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700, marginBottom: 16 }}>Үгийг утгатай нь холбоно уу. ({bi + 1}/{batches.length})</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {curBatch.map((w, i) => {
            const m = matched[idOf(w)]; const sel = selL === i;
            return (
              <div key={idOf(w)} onClick={() => !m && setSelL(i)} style={{
                borderRadius: 12, border: `2px solid ${m ? 'var(--green)' : sel ? 'var(--purple)' : 'var(--border)'}`,
                background: m ? 'var(--green-light)' : sel ? 'var(--purple-light)' : 'var(--bg-alt)',
                padding: 14, minHeight: 52, display: 'flex', alignItems: 'center', cursor: m ? 'default' : 'pointer',
              }}>
                <span style={{ fontSize: 14, fontWeight: (sel || m) ? 800 : 700, color: m ? 'var(--green-dark)' : sel ? 'var(--purple)' : 'var(--text)' }}>{w.word}</span>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rights.map(r => {
            const m = matched[idOf(r)]; const bad = wrongFlash === idOf(r);
            return (
              <div key={idOf(r)} onClick={() => !m && tapRight(r)} style={{
                borderRadius: 12, border: `2px solid ${m ? 'var(--green)' : bad ? 'var(--red)' : 'var(--border)'}`,
                background: m ? 'var(--green-light)' : bad ? 'var(--red-light)' : 'var(--bg-alt)',
                padding: 14, minHeight: 52, display: 'flex', alignItems: 'center', cursor: m ? 'default' : 'pointer',
              }}>
                <span style={{ fontSize: 13.5, fontWeight: m ? 800 : 700, color: m ? 'var(--green-dark)' : 'var(--text)' }}>{r.meaning}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
