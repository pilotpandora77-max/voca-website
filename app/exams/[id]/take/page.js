'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import api from '@/lib/api';
import useStudyPing from '@/lib/useStudyPing';
import { shuffle, FlashQ, ChoiceQ, TypeQ, FillBlankQ, PronounceQ } from '@/components/exercises/WordQuestions';
import { examTypeMeta } from '@/lib/examTypes';

function norm(w) { return { ...w, front: w.word, back: w.meaning, hint: w.reading }; }

function buildSession(exam) {
  const pool  = shuffle(exam.words).slice(0, Math.min(exam.questionCount, exam.words.length));
  const cycle = shuffle(pool.map((_, i) => exam.questionTypes[i % exam.questionTypes.length]));
  return pool.map((word, i) => ({ qId: word.id, word, type: cycle[i] }));
}

function statusColor(status, current) {
  if (current) return { bg: 'var(--purple)', color: '#fff', border: 'var(--purple)' };
  if (status === 'correct') return { bg: 'var(--green-bg)', color: 'var(--green-dark)', border: 'var(--green)' };
  if (status === 'wrong')   return { bg: 'var(--red-light)', color: 'var(--red)', border: 'var(--red)' };
  if (status === 'skipped') return { bg: '#FEF3C7', color: '#B45309', border: '#F59E0B' };
  return { bg: '#fff', color: 'var(--muted)', border: 'var(--border)' };
}

function gradeFor(pct) {
  if (pct >= 90) return { label: 'Гайхалтай!', emoji: '🏆', color: '#22C55E' };
  if (pct >= 75) return { label: 'Маш сайн',   emoji: '⭐', color: '#3B82F6' };
  if (pct >= 60) return { label: 'Сайн',       emoji: '👍', color: '#F59E0B' };
  if (pct >= 40) return { label: 'Дунд зэрэг', emoji: '📚', color: '#FB923C' };
  return          { label: 'Дахин хичээе',   emoji: '💪', color: '#EF4444' };
}

export default function ExamTakePage() {
  const { user, loading: authLoad } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const { id } = useParams();

  const [exam, setExam]       = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase]     = useState('intro'); // intro | running | done

  const [session, setSession] = useState([]);
  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked]     = useState(null);
  const [typed, setTyped]       = useState('');
  const [elapsed, setElapsed]   = useState(0);
  const [result, setResult]     = useState(null);
  const [examXp, setExamXp]     = useState(null);
  const startRef = useRef(0);

  useStudyPing(phase === 'running');

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get(`/api/exams/${id}`).then(r => setExam(r.data)).catch(() => setExam(null)).finally(() => setLoading(false));
      api.get('/api/words').then(r => setAllWords(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    }
  }, [authLoad, user, id]);

  // finishRef ЯГ сүүлийн render-ийн session/answers-г хардаг байх ёстой тул
  // interval callback-с шууд `finish()`-г биш `finishRef.current()`-г дуудна —
  // эс тэгвэл timer-ийн closure эхлэл үеийн хоосон `answers`-тай "хөлдчихнө".
  const finishRef = useRef();
  useEffect(() => { finishRef.current = finish; });

  useEffect(() => {
    if (phase !== 'running') return;
    const iv = setInterval(() => {
      const e = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(e);
      if (exam?.timeLimit && e >= exam.timeLimit * 60) finishRef.current();
    }, 1000);
    return () => clearInterval(iv);
  }, [phase, exam?.timeLimit]);

  useEffect(() => { setRevealed(false); setPicked(null); setTyped(''); }, [idx]);

  function start() {
    setSession(buildSession(exam));
    setAnswers({});
    setIdx(0);
    setElapsed(0);
    startRef.current = Date.now();
    setPhase('running');
  }

  function advance() { setIdx(i => Math.min(i + 1, session.length - 1)); }

  function recordAnswer(correct) {
    const qId = session[idx].qId;
    const nextAnswers = { ...answers, [qId]: correct ? 'correct' : 'wrong' };
    setAnswers(nextAnswers);
    if (idx === session.length - 1) finish(nextAnswers);
    else advance();
  }
  function skip() {
    const qId = session[idx].qId;
    const nextAnswers = { ...answers, [qId]: 'skipped' };
    setAnswers(nextAnswers);
    if (idx === session.length - 1) finish(nextAnswers);
    else advance();
  }

  function finish(answersOverride) {
    const finalAnswers = { ...(answersOverride || answers) };
    session.forEach(q => { if (!finalAnswers[q.qId]) finalAnswers[q.qId] = 'skipped'; });

    const correctCount = session.filter(q => finalAnswers[q.qId] === 'correct').length;
    const wrongCount    = session.filter(q => finalAnswers[q.qId] === 'wrong').length;
    const skippedCount  = session.filter(q => finalAnswers[q.qId] === 'skipped').length;
    const perType = {};
    session.forEach(q => {
      const st = finalAnswers[q.qId];
      if (st === 'correct' || st === 'wrong') {
        perType[q.type] = perType[q.type] || { correct: 0, answered: 0 };
        perType[q.type].answered++;
        if (st === 'correct') perType[q.type].correct++;
      }
    });
    const missedWordIds = session.filter(q => finalAnswers[q.qId] !== 'correct').map(q => q.qId);
    const totalTimeSec = Math.floor((Date.now() - startRef.current) / 1000);

    setAnswers(finalAnswers);
    setResult({ correctCount, wrongCount, skippedCount, perType, missedWordIds, totalTimeSec });
    setPhase('done');

    api.post(`/api/exams/${id}/attempts`, { correctCount, wrongCount, skippedCount, totalTimeSec, perType, missedWordIds }).catch(() => {});
    api.post('/api/stats/exam', { correct: correctCount, total: correctCount + wrongCount + skippedCount }).then(({ data }) => setExamXp(data)).catch(() => {});
    api.post('/api/streak/checkin').catch(() => {});
  }

  function exitConfirm() {
    if (phase === 'running' && !window.confirm('Шалгалтаас гарах уу? Явц хадгалагдахгүй.')) return;
    router.push(`/exams/${id}`);
  }

  if (authLoad || loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>;

  if (!exam || !exam.words.length) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
        <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Шалгалт эхлүүлэх боломжгүй</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>Энэ шалгалтад одоогоор ашиглах үг алга байна.</p>
        <button onClick={() => router.push(`/exams/${id}`)} className="btn btn-purple">← Шалгалт руу буцах</button>
      </div>
    );
  }

  // ── Intro ─────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 28px' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎓</div>
          <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--text)', marginBottom: 6 }}>{exam.title}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 18 }}>{exam.words.length} үг · {exam.questionCount} асуулт{exam.timeLimit ? ` · ${exam.timeLimit} мин` : ''}</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 26 }}>
            {exam.questionTypes.map(t => {
              const m = examTypeMeta(t);
              return <span key={t} className="tag tag-purple" style={{ fontSize: 12 }}>{m.icon} {m.title}</span>;
            })}
          </div>
          <button onClick={start} className="btn btn-purple" style={{ width: '100%', padding: '15px' }}>▶ Шалгалт эхлүүлэх</button>
          <button onClick={() => router.push(`/exams/${id}`)} className="btn btn-ghost" style={{ width: '100%', marginTop: 10, padding: '13px' }}>Болих</button>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────
  if (phase === 'done') {
    const total = result.correctCount + result.wrongCount + result.skippedCount || 1;
    const pct = Math.round((result.correctCount / total) * 100);
    const grade = gradeFor(pct);
    const mm = String(Math.floor(result.totalTimeSec / 60)).padStart(2, '0');
    const ss = String(result.totalTimeSec % 60).padStart(2, '0');
    const typeKeys = Object.keys(result.perType);
    const missedWords = session.filter(q => result.missedWordIds.includes(q.qId));

    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>Шалгалт дууслаа! 🎉</h1>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 100, border: `1.5px solid ${grade.color}55`,
          background: grade.color + '18', padding: '10px 18px', marginTop: 14,
        }}>
          <span style={{ fontSize: 20 }}>{grade.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: grade.color }}>{grade.label}</span>
        </div>
        {!!examXp?.xp && (
          <div style={{ marginTop: 10 }}>
            <span style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)', borderRadius: 100, padding: '9px 16px', fontWeight: 800, fontSize: 13.5, display: 'inline-block' }}>
              🎉 +{examXp.xp} XP нэмэгдлээ!
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', margin: '26px 0' }}>
          <svg width={190} height={190}>
            <circle cx={95} cy={95} r={78} stroke="var(--border)" strokeWidth={14} fill="none" />
            <circle cx={95} cy={95} r={78} stroke="var(--purple)" strokeWidth={14} fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 78} strokeDashoffset={2 * Math.PI * 78 * (1 - pct / 100)}
              transform="rotate(-90 95 95)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            <text x={95} y={92} textAnchor="middle" fontSize={40} fontWeight={900} fill="var(--text)">{pct}%</text>
            <text x={95} y={116} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--muted)">{result.correctCount} / {total} зөв</text>
          </svg>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { ic: '✅', c: '#10B981', v: result.correctCount, l: 'Зөв' },
            { ic: '❌', c: '#EF4444', v: result.wrongCount, l: 'Буруу' },
            { ic: '⏭️', c: '#F59E0B', v: result.skippedCount, l: 'Алгассан' },
            { ic: '⏱️', c: '#3B82F6', v: `${mm}:${ss}`, l: 'Хугацаа' },
          ].map((x, i) => (
            <div key={i} className="card" style={{ flex: 1, textAlign: 'center', padding: '14px 6px' }}>
              <div style={{ fontSize: 18 }}>{x.ic}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: x.c, marginTop: 4 }}>{x.v}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>{x.l}</div>
            </div>
          ))}
        </div>

        {typeKeys.length > 0 && (
          <div className="card" style={{ textAlign: 'left', marginBottom: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Төрөл тус бүрийн үзүүлэлт</div>
            {typeKeys.length >= 3 ? <TypeRadar perType={result.perType} /> : <TypeBars perType={result.perType} />}
          </div>
        )}

        {missedWords.length > 0 && (
          <div className="card" style={{ textAlign: 'left', marginBottom: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>Алдсан үгс ({missedWords.length})</div>
            {missedWords.map((q, i) => (
              <div key={q.qId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{q.word.word}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{q.word.meaning}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-purple" onClick={start} style={{ width: '100%', padding: '15px' }}>🔁 Дахин өгөх</button>
        <button className="btn btn-ghost" onClick={() => router.push(`/exams/${id}`)} style={{ width: '100%', marginTop: 10, padding: '13px' }}>← Буцах</button>
      </div>
    );
  }

  // ── Running ───────────────────────────────────────────────────
  const cur = session[idx];
  const speechLang = lang === 'en' ? 'en-US' : 'zh-CN';
  const distractorPool = exam.words.length >= 4 ? exam.words : allWords;
  const remaining = exam.timeLimit ? Math.max(0, exam.timeLimit * 60 - elapsed) : elapsed;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const meta = examTypeMeta(cur.type);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 24px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={exitConfirm} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text)', fontFamily: 'inherit' }}>✕</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{meta.icon} {meta.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{idx + 1} / {session.length}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: exam.timeLimit && remaining <= 30 ? 'var(--red)' : 'var(--muted)', minWidth: 22, textAlign: 'right' }}>
          {(exam.timeLimit || elapsed > 0) ? `${mm}:${ss}` : ''}
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        {cur.type === 'flashcard' && <FlashQ word={cur.word} revealed={revealed} onReveal={() => setRevealed(true)} onAnswer={recordAnswer} />}
        {cur.type === 'choice'    && <ChoiceQ word={cur.word} all={distractorPool} field="meaning" prompt="Энэ үгийн утга юу вэ?" picked={picked} setPicked={setPicked} onNext={recordAnswer} />}
        {cur.type === 'listen'    && <ChoiceQ word={cur.word} all={distractorPool} field="word" prompt="Дуу сонсоод зөв хариултыг сонгоно уу." listen picked={picked} setPicked={setPicked} onNext={recordAnswer} />}
        {cur.type === 'writing'   && <TypeQ word={cur.word} typed={typed} setTyped={setTyped} revealed={revealed} onCheck={() => setRevealed(true)} onNext={recordAnswer} />}
        {cur.type === 'fill'      && <FillBlankQ key={cur.qId} word={norm(cur.word)} onNext={recordAnswer} />}
        {cur.type === 'pronounce' && <PronounceQ key={cur.qId} word={norm(cur.word)} speechLang={speechLang} onNext={recordAnswer} />}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button onClick={skip} className="btn btn-ghost" style={{ flex: 1 }}>⏭️ Алгасах</button>
        <button onClick={finish} className="btn btn-ghost" style={{ flex: 1, color: 'var(--red)' }}>Шалгалтаа дуусгах</button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {session.map((q, i) => {
          const c = statusColor(answers[q.qId], i === idx);
          return (
            <button key={q.qId} onClick={() => setIdx(i)} style={{
              width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${c.border}`, background: c.bg, color: c.color,
              fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}>{i + 1}</button>
          );
        })}
      </div>
    </div>
  );
}

function TypeBars({ perType }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(perType).map(([key, v]) => {
        const m = examTypeMeta(key);
        const pct = v.answered ? Math.round((v.correct / v.answered) * 100) : 0;
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, marginBottom: 5 }}>
              <span>{m.icon} {m.title}</span>
              <span style={{ color: 'var(--muted)' }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--purple)', borderRadius: 8 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TypeRadar({ perType }) {
  const entries = Object.entries(perType);
  const n = entries.length;
  const cx = 90, cy = 90, R = 62;
  const pts = (radiusScale) => entries.map(([, v], i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = R * radiusScale;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
  const dataPts = entries.map(([, v], i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const pct = v.answered ? v.correct / v.answered : 0;
    const r = R * pct;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
  const outline = pts(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={180} height={180}>
        {[0.33, 0.66, 1].map(s => (
          <polygon key={s} points={pts(s).map(p => p.join(',')).join(' ')} fill="none" stroke="var(--border)" strokeWidth={1} />
        ))}
        {outline.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="var(--border)" strokeWidth={1} />
        ))}
        <polygon points={dataPts.map(p => p.join(',')).join(' ')} fill="var(--purple)" fillOpacity={0.35} stroke="var(--purple)" strokeWidth={2} />
        {entries.map(([key], i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const lx = cx + (R + 20) * Math.cos(angle), ly = cy + (R + 20) * Math.sin(angle);
          return <text key={key} x={lx} y={ly} textAnchor="middle" fontSize={16}>{examTypeMeta(key).icon}</text>;
        })}
      </svg>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
        {entries.map(([key, v]) => (
          <span key={key} style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>
            {examTypeMeta(key).icon} {v.answered ? Math.round((v.correct / v.answered) * 100) : 0}%
          </span>
        ))}
      </div>
    </div>
  );
}
