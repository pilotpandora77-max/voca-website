'use client';
import { useState } from 'react';
import { Progress, Result } from './ExerciseUI';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function normalizeSpeech(s) {
  return (s || '').trim().toLowerCase().replace(/[.,!?;:'"()]/g, '').replace(/\s+/g, ' ');
}

export default function PronounceGame({ words, onExit, speechLang, exitLabel }) {
  const ROUNDS = Math.min(10, words.length);
  const [questions] = useState(() => shuffle(words).slice(0, ROUNDS));
  const [idx, setIdx]       = useState(0);
  const [status, setStatus] = useState('idle'); // idle | listening | correct | wrong | error
  const [heard, setHeard]   = useState('');
  const [score, setScore]   = useState(0);
  const [done, setDone]     = useState(false);
  const [supported] = useState(() => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const q = questions[idx];

  function listen() {
    if (status === 'listening') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = speechLang; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setStatus('listening');
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setHeard(transcript);
      const ok = normalizeSpeech(transcript) === normalizeSpeech(q.front);
      if (ok) setScore(s => s + 1);
      setStatus(ok ? 'correct' : 'wrong');
    };
    rec.onerror = () => setStatus('error');
    setHeard('');
    rec.start();
  }
  function next() {
    if (idx + 1 >= questions.length) setDone(true);
    else { setIdx(i => i + 1); setStatus('idle'); setHeard(''); }
  }

  if (done) return <Result score={score} total={questions.length} onExit={onExit} onRetry={() => location.reload()} exitLabel={exitLabel} />;

  if (!supported) return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>🎤</div>
      <h3 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Энэ дасгал Chrome/Edge хөтчид л ажилладаг</h3>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Таны хөтөч дуу хүлээн авах (Speech Recognition) технологи дэмждэггүй байна.</p>
      <button onClick={onExit} className="btn btn-purple">← Буцах</button>
    </div>
  );

  return (
    <div className="card">
      <Progress idx={idx} total={questions.length} />
      <div style={{ textAlign: 'center', padding: '30px 16px 24px' }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{q.front}</div>
        {q.hint && <div style={{ color: 'var(--purple)', fontWeight: 700, fontSize: 18, marginTop: 8 }}>{q.hint}</div>}
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
            <button onClick={next} className="btn btn-purple" style={{ flex: 1 }}>
              {idx + 1 >= questions.length ? 'Дүн харах' : 'Дараах →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
