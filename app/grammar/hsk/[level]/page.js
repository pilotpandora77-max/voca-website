'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import GRAMMAR, { GRAMMAR_TEST } from '@/lib/grammarData';

const COLORS = {
  1: { color: '#58CC02', bg: '#EDFFD7', shadow: '#46A800' },
  2: { color: '#1CB0F6', bg: '#DFF4FF', shadow: '#0099D4' },
  3: { color: '#CE82FF', bg: '#F4F0FF', shadow: '#A560E8' },
};

export default function HskGrammarPage({ params }) {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const level  = parseInt(params.level);
  const { color, bg, shadow } = COLORS[level] || COLORS[1];
  const lessons = GRAMMAR[level] || [];

  const testItems = GRAMMAR_TEST[level] || [];

  const topicId    = searchParams.get('topic');
  const initIdx    = topicId ? Math.max(0, lessons.findIndex(l => l.id === topicId)) : 0;
  const [phase, setPhase]         = useState(topicId ? 'lesson' : 'list');
  const [lessonIdx, setLessonIdx] = useState(initIdx);
  const [selected, setSelected]   = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore]         = useState(0);

  // Final fill-in-the-blank test state
  const [testIdx, setTestIdx]     = useState(0);
  const [testSel, setTestSel]     = useState(null);
  const [testConf, setTestConf]   = useState(false);
  const [testScore, setTestScore] = useState(0);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  const lesson = lessons[lessonIdx];

  function startLesson(idx) {
    setLessonIdx(idx); setSelected(null); setConfirmed(false); setPhase('lesson');
  }

  function startTest() {
    setTestIdx(0); setTestSel(null); setTestConf(false); setTestScore(0); setPhase('test');
  }

  function confirm() {
    if (selected === null) return;
    setConfirmed(true);
    if (selected === lesson.quiz.answer) setScore(s => s + 1);
  }

  function next() {
    if (lessonIdx + 1 >= lessons.length) {
      // Бүх хичээл дууссан — өгүүлбэр нөхөх шалгалт руу
      if (testItems.length > 0) startTest();
      else setPhase('done');
    } else {
      setLessonIdx(i => i + 1); setSelected(null); setConfirmed(false); setPhase('lesson');
    }
  }

  const testQ = testItems[testIdx];

  function confirmTest() {
    if (testSel === null) return;
    setTestConf(true);
    if (testSel === testQ.answer) setTestScore(s => s + 1);
  }

  function nextTest() {
    if (testIdx + 1 >= testItems.length) { setPhase('done'); }
    else { setTestIdx(i => i + 1); setTestSel(null); setTestConf(false); }
  }

  if (authLoad) return null;

  if (phase === 'list') return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/grammar" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <div style={{ background: bg, border: `2px solid ${color}`, borderRadius: 12, padding: '6px 16px' }}>
          <span style={{ color, fontWeight: 900, fontSize: 15 }}>HSK {level} · Дүрэм</span>
        </div>
      </div>
      <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 16 }}>📝 Сэдвүүд</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lessons.map((ls, i) => (
          <button key={ls.id} onClick={() => startLesson(i)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
            borderRadius: 16, border: `2px solid ${color}`, background: bg,
            cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: color + '22',
              border: `2px solid ${color}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15, fontWeight: 900, color, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{ls.title}</div>
              <div style={{ color, fontWeight: 700, fontSize: 13, marginTop: 2 }}>{ls.pattern}</div>
            </div>
            <span style={{ color, fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (phase === 'test') return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setPhase('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>←</button>
        <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: color, borderRadius: 10, width: `${((testIdx + 1) / testItems.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontWeight: 800, color: 'var(--muted)', fontSize: 13 }}>{testIdx + 1}/{testItems.length}</span>
      </div>

      <div style={{ background: bg, border: `2px solid ${color}`, borderRadius: 14, padding: '10px 16px', marginBottom: 18, textAlign: 'center' }}>
        <span style={{ color, fontWeight: 900, fontSize: 14 }}>✍️ Өгүүлбэр нөхөх шалгалт</span>
      </div>

      <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5, marginBottom: 14 }}>ДУТУУ ҮГИЙГ НӨХӨӨРЭЙ</div>
        <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 10, lineHeight: 1.4 }}>
          {testQ.sentence.split('___').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span style={{
                  display: 'inline-block', minWidth: 54, padding: '0 8px', margin: '0 4px',
                  borderBottom: `3px solid ${color}`,
                  color: testConf ? (testSel === testQ.answer ? 'var(--green)' : 'var(--red)') : color,
                }}>
                  {testSel !== null ? testQ.options[testSel] : ' '}
                </span>
              )}
            </span>
          ))}
        </div>
        <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>{testQ.mn}</div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {testQ.options.map((opt, i) => {
            let bg2 = 'var(--bg-alt)', border = 'var(--border)', clr = 'var(--text)';
            if (testConf) {
              if (i === testQ.answer) { bg2 = 'var(--green-bg)'; border = 'var(--green)'; clr = 'var(--green)'; }
              else if (i === testSel) { bg2 = 'var(--red-light)'; border = 'var(--red)'; clr = 'var(--red)'; }
            } else if (i === testSel) { bg2 = 'var(--blue-light)'; border = 'var(--blue)'; clr = 'var(--blue)'; }
            return (
              <button key={i} disabled={testConf} onClick={() => setTestSel(i)} style={{
                padding: '14px 16px', borderRadius: 12, border: `2px solid ${border}`,
                background: bg2, color: clr, fontWeight: 800, fontSize: 20,
                cursor: testConf ? 'default' : 'pointer', transition: 'all 0.15s',
              }}>
                {opt}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          {!testConf ? (
            <button onClick={confirmTest} disabled={testSel === null} className="btn btn-green" style={{ width: '100%' }}>ШАЛГАХ</button>
          ) : (
            <div>
              <div style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 12, fontWeight: 800,
                background: testSel === testQ.answer ? 'var(--green-bg)' : 'var(--red-light)',
                border: `2px solid ${testSel === testQ.answer ? 'var(--green)' : 'var(--red)'}`,
                color: testSel === testQ.answer ? 'var(--green)' : 'var(--red)',
              }}>
                {testSel === testQ.answer ? '🎉 Зөв!' : '❌ Зөв хариулт: ' + testQ.options[testQ.answer]}
              </div>
              <button onClick={nextTest} className="btn btn-green" style={{ width: '100%' }}>
                {testIdx + 1 >= testItems.length ? 'ДҮН ХАРАХ' : 'ДАРААХ →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (phase === 'done') {
    const totalQ = lessons.length + testItems.length;
    const totalScore = score + testScore;
    const pct = totalQ ? Math.round((totalScore / totalQ) * 100) : 0;
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '🎉' : '💪'}</div>
        <h2 style={{ fontWeight: 900, fontSize: 26, color, marginBottom: 8 }}>HSK {level} дүрэм дууслаа!</h2>
        <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>
          Хичээлийн дасгал: {score} / {lessons.length}
        </p>
        {testItems.length > 0 && (
          <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>
            Өгүүлбэр нөхөх шалгалт: {testScore} / {testItems.length}
          </p>
        )}
        <p style={{ color, fontWeight: 900, fontSize: 20, marginTop: 10 }}>Нийт {totalScore} / {totalQ} ({pct}%)</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button onClick={() => { setScore(0); setLessonIdx(0); setPhase('list'); }} style={{
            background: color, color: '#fff', border: `3px solid ${shadow}`,
            borderRadius: 14, padding: '12px 24px', fontWeight: 900, fontSize: 15, cursor: 'pointer',
          }}>
            Дахин эхлэх
          </button>
          <Link href="/grammar" style={{
            background: 'var(--bg-alt)', color: 'var(--text)',
            border: '2px solid var(--border)', borderRadius: 14,
            padding: '12px 24px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
          }}>
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => setPhase('list')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20,
        }}>←</button>
        <div style={{
          flex: 1, height: 10, background: 'var(--border)', borderRadius: 10, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: color, borderRadius: 10,
            width: `${((lessonIdx + 1) / lessons.length) * 100}%`, transition: 'width 0.3s',
          }} />
        </div>
        <span style={{ fontWeight: 800, color: 'var(--muted)', fontSize: 13 }}>
          {lessonIdx + 1}/{lessons.length}
        </span>
      </div>

      {/* Lesson content */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>{lesson.title}</h3>
        <div style={{ background: bg, border: `2px solid ${color}`, borderRadius: 12, padding: '10px 16px', marginBottom: 16 }}>
          <span style={{ fontWeight: 900, color, fontSize: 15 }}>{lesson.pattern}</span>
        </div>
        <p style={{ color: 'var(--muted)', fontWeight: 600, lineHeight: 1.6, marginBottom: 16 }}>{lesson.explanation}</p>

        <h4 style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)', letterSpacing: 0.5, marginBottom: 10 }}>ЖИШЭЭ</h4>
        {lesson.examples.map((ex, i) => (
          <div key={i} style={{
            background: 'var(--bg-alt)', borderRadius: 12, padding: '12px 16px',
            marginBottom: 8, borderLeft: `3px solid ${color}`,
          }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{ex.zh}</div>
            <div style={{ color, fontWeight: 700, marginTop: 4 }}>{ex.py}</div>
            <div style={{ color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{ex.mn}</div>
          </div>
        ))}
      </div>

      {/* Quiz */}
      <div className="card">
        <h4 style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>❓ {lesson.quiz.question}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lesson.quiz.options.map((opt, i) => {
            let bg2 = 'var(--bg-alt)', border = 'var(--border)', clr = 'var(--text)';
            if (confirmed) {
              if (i === lesson.quiz.answer) { bg2 = 'var(--green-bg)'; border = 'var(--green)'; clr = 'var(--green)'; }
              else if (i === selected) { bg2 = 'var(--red-light)'; border = 'var(--red)'; clr = 'var(--red)'; }
            } else if (i === selected) {
              bg2 = 'var(--blue-light)'; border = 'var(--blue)'; clr = 'var(--blue)';
            }
            return (
              <button key={i} disabled={confirmed} onClick={() => setSelected(i)} style={{
                padding: '12px 16px', borderRadius: 12, border: `2px solid ${border}`,
                background: bg2, color: clr, fontWeight: 700, fontSize: 15,
                cursor: confirmed ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                {opt}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          {!confirmed ? (
            <button onClick={confirm} disabled={selected === null} className="btn btn-green" style={{ width: '100%' }}>
              ШАЛГАХ
            </button>
          ) : (
            <div>
              <div style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 12, fontWeight: 800,
                background: selected === lesson.quiz.answer ? 'var(--green-bg)' : 'var(--red-light)',
                border: `2px solid ${selected === lesson.quiz.answer ? 'var(--green)' : 'var(--red)'}`,
                color: selected === lesson.quiz.answer ? 'var(--green)' : 'var(--red)',
              }}>
                {selected === lesson.quiz.answer ? '🎉 Зөв!' : '❌ Буруу — зөв хариулт: ' + lesson.quiz.options[lesson.quiz.answer]}
              </div>
              <button onClick={next} className="btn btn-green" style={{ width: '100%' }}>
                {lessonIdx + 1 >= lessons.length ? 'ДУУСГАХ' : 'ДАРААХ →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
