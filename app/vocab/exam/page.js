'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import useStudyPing from '@/lib/useStudyPing';
import { shuffle, FlashQ, ChoiceQ, TypeQ, MatchQ } from '@/components/exercises/WordQuestions';

const DEFAULT_GROUP = 'Ерөнхий';
const COUNTS = [10, 20, 9999];
const TIMES  = [5, 10, 9999];
// Matching өөрөө багц (batch) дотроо ажилладаг тул "асуулт бүрд холих" биш
// "хэсэг бүрд өөр төрөл" загвар — апп дээрхтэй адил дараалал.
const EXAM_ORDER = [
  { key: 'flash',  title: 'Флэшкарт',        icon: '🗂️', color: '#34D399' },
  { key: 'choice', title: 'Сонголттой тест', icon: '📝', color: '#60A5FA' },
  { key: 'listen', title: 'Дуут сонсох тест',icon: '🎧', color: '#A855F7' },
  { key: 'type',   title: 'Үг бичих тест',   icon: '⌨️', color: '#FB923C' },
  { key: 'match',  title: 'Холбох тест',     icon: '🔗', color: '#F472B6' },
];

async function saveMastery(word, rating) {
  const now = Date.now();
  const oldM = word.mastery ?? 0;
  let newM, nextReview;
  if (rating === 'again') { newM = 0; nextReview = new Date(now + 30 * 60 * 1000).toISOString(); }
  else { newM = Math.min(oldM + 1, 2); const days = newM === 1 ? 1 : newM === 2 ? 7 : 0.5; nextReview = new Date(now + days * 86400 * 1000).toISOString(); }
  const rc = (word.reviewCount || 0) + 1;
  try { await api.patch(`/api/words/${word._id || word.id}`, { mastery: newM, nextReview, reviewCount: rc }); } catch {}
}

function gradeFor(pct) {
  if (pct >= 90) return { label: 'Гайхалтай!', emoji: '🏆', color: '#22C55E' };
  if (pct >= 75) return { label: 'Маш сайн',   emoji: '⭐', color: '#3B82F6' };
  if (pct >= 60) return { label: 'Сайн',       emoji: '👍', color: '#F59E0B' };
  if (pct >= 40) return { label: 'Дунд зэрэг', emoji: '📚', color: '#FB923C' };
  return          { label: 'Дахин хичээе',   emoji: '💪', color: '#EF4444' };
}

export default function VocabExamPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [count, setCount]       = useState(20);
  const [time, setTime]         = useState(10);

  const [started, setStarted]   = useState(false);
  const [segments, setSegments] = useState([]);
  const [segIdx, setSegIdx]     = useState(0);
  const [type, setType]         = useState('flash');
  const [words, setWords]       = useState([]);
  const [idx, setIdx]           = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked]     = useState(null);
  const [typed, setTyped]       = useState('');
  const [known, setKnown]       = useState(0);
  const [wrong, setWrong]       = useState(0);
  const [missed, setMissed]     = useState([]);
  const [done, setDone]         = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const [streakMsg, setStreakMsg] = useState('');
  const [examXp, setExamXp]     = useState(null);
  const startRef = useRef(0);
  const timerRef = useRef(null);

  useStudyPing(started && !done);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/words').then(({ data }) => setAllWords(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [authLoad, user]);

  useEffect(() => {
    if (!started || done) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(e);
      if (time < 9999 && e >= time * 60) finish();
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, done]);

  useEffect(() => {
    if (!done) return;
    api.post('/api/streak/checkin').then(({ data }) => setStreakMsg(data?.message || '')).catch(() => {});
    api.post('/api/stats/exam', { correct: known, total: known + wrong }).then(({ data }) => setExamXp(data)).catch(() => {});
  }, [done]);

  function beginExam() {
    const pool = shuffle(allWords).slice(0, count >= 9999 ? allWords.length : count);
    const n = EXAM_ORDER.length;
    const per = Math.max(1, Math.floor(pool.length / n));
    const segs = EXAM_ORDER.map((t, i) => ({
      type: t.key,
      words: pool.slice(i * per, i === n - 1 ? pool.length : (i + 1) * per),
    })).filter(sg => sg.words.length > 0);
    setSegments(segs); setSegIdx(0);
    setWords(segs[0].words); setType(segs[0].type);
    setIdx(0); setKnown(0); setWrong(0); setMissed([]); setRevealed(false); setPicked(null); setTyped(''); setDone(false);
    setStarted(true); startRef.current = Date.now(); setElapsed(0); setStreakMsg(''); setExamXp(null);
  }

  function finish() { clearInterval(timerRef.current); setElapsed(Math.floor((Date.now() - startRef.current) / 1000)); setDone(true); }

  function nextSegmentOrFinish() {
    const nb = segIdx + 1;
    if (nb < segments.length) {
      setSegIdx(nb); setWords(segments[nb].words); setType(segments[nb].type);
      setIdx(0); setRevealed(false); setPicked(null); setTyped('');
    } else {
      finish();
    }
  }

  async function answer(correct) {
    const cur = words[idx];
    if (correct) setKnown(k => k + 1); else { setWrong(w => w + 1); setMissed(m => [...m, cur]); }
    saveMastery(cur, correct ? 'good' : 'again');
    const nx = idx + 1;
    if (nx >= words.length) { nextSegmentOrFinish(); return; }
    setIdx(nx); setRevealed(false); setPicked(null); setTyped('');
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );

  // ── Intro / settings ──────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 28px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <button onClick={() => router.push('/vocab')} style={{
            color: 'var(--muted)', textDecoration: 'none', fontSize: 18, cursor: 'pointer',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-alt)', borderRadius: 10, border: '1px solid var(--border)', fontFamily: 'inherit',
          }}>←</button>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>🎓 Нэгдсэн шалгалт</h1>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>Бүх бүлгийн үгсээр</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>
            Флэшкарт, Сонголттой тест, Дуут сонсох тест, Үг бичих тест, Холбох тест — бүх төрлийн даалгавар дараалан холилдоно. Дуусахад нэмэлт XP авна.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAM_ORDER.map(t => (
              <span key={t.key} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 100,
                background: t.color + '18', border: `1px solid ${t.color}44`, color: t.color,
                padding: '6px 12px', fontSize: 12, fontWeight: 800,
              }}>{t.icon} {t.title}</span>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 10 }}>Тохиргоо</h2>
          {[
            { label: 'Үгийн тоо', value: count >= 9999 ? `Бүгд (${allWords.length})` : `${count} үг`, onClick: () => setCount(c => COUNTS[(COUNTS.indexOf(c) + 1) % COUNTS.length]) },
            { label: 'Хугацаа', value: time >= 9999 ? 'Хязгааргүй' : `${time} минут`, onClick: () => setTime(t => TIMES[(TIMES.indexOf(t) + 1) % TIMES.length]) },
          ].map((r, i) => (
            <button key={r.label} onClick={r.onClick} style={{
              display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              background: 'none', border: 'none', borderTopWidth: i > 0 ? 1 : 0, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--purple)' }}>{r.value} ›</span>
            </button>
          ))}
        </div>

        <button className="btn btn-purple" disabled={allWords.length < 5} onClick={beginExam} style={{ width: '100%', padding: '15px', fontSize: 15 }}>
          {allWords.length < 5 ? 'Хамгийн багадаа 5 үг хэрэгтэй' : 'Шалгалт эхлүүлэх'}
        </button>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────
  if (done) {
    const total = known + wrong || words.length;
    const pct = total ? Math.round((known / total) * 100) : 0;
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0'), ss = String(elapsed % 60).padStart(2, '0');
    const grade = gradeFor(pct);
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 28px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', marginTop: 10 }}>Шалгалт дууслаа! 🎉</h1>
        <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>Сайхан ажиллаа.</p>

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
        {!!streakMsg && (
          <div style={{ marginTop: 10 }}>
            <span style={{ background: '#FEF3C7', color: '#B45309', borderRadius: 100, padding: '9px 16px', fontWeight: 800, fontSize: 13.5, display: 'inline-block' }}>
              {streakMsg}
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
            <text x={95} y={116} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--muted)">{known} / {total} зөв</text>
          </svg>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          {[{ ic: '✅', c: '#10B981', v: known, l: 'Зөв хариулт' }, { ic: '❌', c: '#EF4444', v: wrong, l: 'Буруу хариулт' }, { ic: '⏱️', c: '#3B82F6', v: `${mm}:${ss}`, l: 'Хугацаа' }].map((x, i) => (
            <div key={i} className="card" style={{ flex: 1, textAlign: 'center', padding: '16px 10px' }}>
              <div style={{ fontSize: 20 }}>{x.ic}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: x.c, marginTop: 4 }}>{x.v}</div>
              <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>{x.l}</div>
            </div>
          ))}
        </div>

        {missed.length > 0 && (
          <div className="card" style={{ textAlign: 'left', marginTop: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>Алдсан үгс ({missed.length})</div>
            {missed.map((w, i) => (
              <div key={(w._id || w.id) + '-' + i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{w.word}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{w.meaning}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-purple" onClick={beginExam} style={{ width: '100%', marginTop: 20, padding: '15px' }}>Дахин шалгалт өгөх</button>
        <button className="btn btn-ghost" onClick={() => router.push('/vocab')} style={{ width: '100%', marginTop: 10, padding: '13px' }}>Буцах</button>
      </div>
    );
  }

  // ── Running exam ─────────────────────────────────────────────
  const cur = words[idx];
  const total = words.length;
  const typeMeta = EXAM_ORDER.find(t => t.key === type);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 24px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => router.push('/vocab')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text)', fontFamily: 'inherit' }}>✕</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{typeMeta?.icon} {typeMeta?.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{idx + 1} / {total} · {segIdx + 1}/{segments.length} үе шат</div>
        </div>
        <div style={{ width: 22 }} />
      </div>
      <div style={{ height: 8, background: 'var(--border)', borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${(idx / total) * 100}%`, background: 'var(--purple)', borderRadius: 5, transition: 'width 0.25s' }} />
      </div>

      {type === 'flash'  && <FlashQ word={cur} revealed={revealed} onReveal={() => setRevealed(true)} onAnswer={answer} />}
      {type === 'choice' && <ChoiceQ word={cur} all={allWords} field="meaning" prompt="Энэ үгийн утга юу вэ?" picked={picked} setPicked={setPicked} onNext={answer} />}
      {type === 'listen' && <ChoiceQ word={cur} all={allWords} field="word" prompt="Дуу сонсоод зөв хариултыг сонгоно уу." listen picked={picked} setPicked={setPicked} onNext={answer} />}
      {type === 'type'   && <TypeQ word={cur} typed={typed} setTyped={setTyped} revealed={revealed} onCheck={() => setRevealed(true)} onNext={answer} />}
      {type === 'match'  && <MatchQ words={words} onDone={(ok, tot) => { setKnown(k => k + ok); setWrong(w => w + (tot - ok)); nextSegmentOrFinish(); }} />}
    </div>
  );
}
