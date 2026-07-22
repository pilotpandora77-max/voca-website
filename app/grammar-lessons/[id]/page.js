'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import { getGrammar } from '@/lib/grammar';

function speak(t) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

const TABS = ['Тайлбар', 'Жишээ', 'Дасгал', 'Тест', 'Тэмдэглэл'];

export default function LessonDetail() {
  const { user, loading: authLoad } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const { id } = useParams();
  const LESSONS = getGrammar(lang).lessons;
  const lesson = LESSONS.find(l => l.id === id);
  const idx = LESSONS.findIndex(l => l.id === id);

  const [tab, setTab]   = useState('Тайлбар');
  const [exTab, setExTab] = useState(null);
  const [prog, setProg] = useState({});
  const [note, setNote] = useState('');
  const [savedNote, setSaved] = useState('');

  useEffect(() => { if (!authLoad && !user) router.push('/login'); }, [authLoad, user]);

  useEffect(() => {
    if (!lesson) return;
    try {
      const all = JSON.parse(localStorage.getItem('voca_grammar_prog') || '{}');
      setProg(all[id] || {});
      const notes = JSON.parse(localStorage.getItem('voca_grammar_notes') || '{}');
      setNote(notes[id] || ''); setSaved(notes[id] || '');
    } catch {}
    setExTab(Object.keys(lesson.examples)[0]);
    // mark read
    update({ read: true });
  }, [id]);

  if (authLoad) return null;
  if (!lesson) return <div style={{ padding: 40, textAlign: 'center' }}><h2>Хичээл олдсонгүй</h2><Link href="/grammar-lessons" className="btn btn-purple" style={{ marginTop: 16, textDecoration: 'none' }}>Буцах</Link></div>;

  function update(patch) {
    try {
      const all = JSON.parse(localStorage.getItem('voca_grammar_prog') || '{}');
      all[id] = { ...(all[id] || {}), ...patch };
      localStorage.setItem('voca_grammar_prog', JSON.stringify(all));
      setProg(all[id]);
    } catch {}
  }
  function saveNote() {
    try { const notes = JSON.parse(localStorage.getItem('voca_grammar_notes') || '{}'); notes[id] = note; localStorage.setItem('voca_grammar_notes', JSON.stringify(notes)); setSaved(note); update({ note: true }); } catch {}
  }

  const prev = idx > 0 ? LESSONS[idx - 1] : null;
  const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;
  const related = (lesson.related || []).map(rid => LESSONS.find(l => l.id === rid)).filter(Boolean);

  // completion
  let done = 0;
  if (prog.read) done++; if (prog.practice) done++; if ((prog.quiz || 0) >= 60) done++; if (prog.note) done++;
  const pct = Math.round((done / 4) * 100);

  const steps = [
    ['Видео үзсэн', prog.read ? '4/4' : '0/4', !!prog.read],
    ['Дасгал хийсэн', prog.practice ? `${lesson.practice.length}/${lesson.practice.length}` : `0/${lesson.practice.length}`, !!prog.practice],
    ['Тест өгсөн', prog.quiz ? `${Math.round((prog.quiz / 100) * lesson.quiz.length)}/${lesson.quiz.length}` : `0/${lesson.quiz.length}`, (prog.quiz || 0) >= 60],
    ['Тэмдэглэл бичсэн', prog.note ? '1/1' : '0/1', !!prog.note],
  ];

  return (
    <div style={{ padding: '20px 28px 40px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        <Link href="/lessons" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Хичээлүүд</Link> ›
        <Link href="/grammar-lessons" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Дүрмийн хичээл</Link> ›
        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{lesson.title}</span>
      </div>

      <div className="responsive-sidebar" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 22, alignItems: 'start' }}>
        {/* ── Main ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '24px 26px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', borderBottom: '1.5px solid var(--border)' }}>
            <div style={{ width: 84, height: 84, borderRadius: 18, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: 'var(--purple)', flexShrink: 0 }}>{lesson.icon}</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{lesson.title}</h1>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple)', background: 'var(--purple-light)', borderRadius: 6, padding: '2px 8px' }}>{lesson.level}</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 8 }}>{lesson.desc}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
                <span>🕐 {lesson.time}</span><span>🎬 Видео хичээл</span><span>📝 {lesson.practice.length + lesson.quiz.length} дасгал</span>
              </div>
            </div>
            <Ring pct={pct} sub="Дуссан" />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 28, padding: '0 26px', borderBottom: '1.5px solid var(--border)', overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', color: tab === t ? 'var(--purple)' : 'var(--muted)', borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5 }}>{t}</button>
            ))}
          </div>

          <div style={{ padding: '24px 26px' }}>
            {/* ── Тайлбар ── */}
            {tab === 'Тайлбар' && (
              <div>
                <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 10 }}>1. Тайлбар</h3>
                <p style={{ fontSize: 14.5, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 18 }}>{lesson.definition}</p>

                <div style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--green-dark)', marginBottom: 10 }}>✓ Хэзээ ашиглах вэ?</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {lesson.useCases.map((u, i) => <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--text-sub)' }}><span style={{ color: 'var(--green)' }}>✓</span> {u}</div>)}
                  </div>
                </div>

                <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>2. Бүтэц</h3>
                <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 600 }}>
                    <thead>
                      <tr style={{ background: 'var(--purple-light)' }}>
                        {['Хэлбэр', 'Батлах өгүүлбэр', 'Сөрөг өгүүлбэр', 'Асуух өгүүлбэр'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 800, color: 'var(--purple-dark)', borderBottom: '1.5px solid var(--border)' }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {lesson.structure.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '11px 14px', fontWeight: 800, color: 'var(--text)' }}>{r.form}</td>
                          <td style={{ padding: '11px 14px', color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: hl(r.pos, 'var(--text)') }} />
                          <td style={{ padding: '11px 14px', color: 'var(--red)' }}>{r.neg}</td>
                          <td style={{ padding: '11px 14px', color: 'var(--blue)' }}>{r.q}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {lesson.note && (
                  <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: 'var(--blue-light)', borderRadius: 12, marginBottom: 24 }}>
                    <span style={{ color: 'var(--blue)', fontSize: 16 }}>ℹ️</span>
                    <span style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.5 }}>{lesson.note}</span>
                  </div>
                )}

                {lesson.mistakes?.length > 0 && (
                  <>
                    <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>3. Түгээмэл алдаа</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {lesson.mistakes.map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 12, flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--red)', fontWeight: 700, textDecoration: 'line-through' }}>❌ {m[0]}</span>
                          <span style={{ color: 'var(--muted)' }}>→</span>
                          <span style={{ color: 'var(--green-dark)', fontWeight: 700 }}>✅ {m[1]}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)', width: '100%' }}>{m[2]}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Жишээ ── */}
            {tab === 'Жишээ' && (
              <div>
                <div style={{ display: 'flex', gap: 18, borderBottom: '1.5px solid var(--border)', marginBottom: 16 }}>
                  {Object.keys(lesson.examples).map(k => (
                    <button key={k} onClick={() => setExTab(k)} style={{ padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13.5, color: exTab === k ? 'var(--purple)' : 'var(--muted)', borderBottom: exTab === k ? '2px solid var(--purple)' : '2px solid transparent', marginBottom: -1.5 }}>{k}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(lesson.examples[exTab] || []).map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 12 }}>
                      <button onClick={() => speak(e.en)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--purple)' }}>🔊</button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600 }}>{e.en}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{e.mn}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Дасгал ── */}
            {tab === 'Дасгал' && <PracticeTab lesson={lesson} onDone={() => update({ practice: true })} />}

            {/* ── Тест ── */}
            {tab === 'Тест' && <QuizTab lesson={lesson} onDone={score => update({ quiz: score })} />}

            {/* ── Тэмдэглэл ── */}
            {tab === 'Тэмдэглэл' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>Тэмдэглэл</h3>
                  {note !== savedNote && <button onClick={saveNote} className="btn btn-purple" style={{ padding: '6px 14px', fontSize: 12 }}>Хадгалах</button>}
                </div>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={5} placeholder="Энэ дүрмийн талаар өөрийн тэмдэглэлээ бичнэ үү..." style={{ width: '100%', resize: 'vertical' }} />
              </div>
            )}
          </div>

          {/* Prev/Next */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 26px', borderTop: '1.5px solid var(--border)' }}>
            <button onClick={() => prev && router.push(`/grammar-lessons/${prev.id}`)} disabled={!prev} className="btn btn-ghost" style={{ opacity: prev ? 1 : 0.4 }}>← Өмнөх хичээл</button>
            <button onClick={() => next && router.push(`/grammar-lessons/${next.id}`)} disabled={!next} className="btn btn-purple" style={{ opacity: next ? 1 : 0.4 }}>Дараагийн хичээл →</button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>Таны ахиц</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Ring pct={pct} small />
              <div style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 700 }}>{done}/4 алхам</div>
            </div>
            {steps.map(([l, v, ok]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>{l}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{v}</span>
                <span style={{ fontSize: 14, color: ok ? 'var(--green)' : 'var(--border)' }}>{ok ? '✅' : '⚪'}</span>
              </div>
            ))}
          </div>

          {related.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>Холбогдох хичээлүүд</h3>
              {related.map(r => (
                <Link key={r.id} href={`/grammar-lessons/${r.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 600 }}>{r.title}</span>
                  <span style={{ color: 'var(--muted)' }}>›</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function hl(s) { return s.replace(/(plays|studies)/g, '<b style="color:#7C3AED">$1</b>'); }

function Ring({ pct, sub, small }) {
  const size = small ? 70 : 84, r = small ? 28 : 34, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-alt)" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--purple)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 0.5s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: small ? 16 : 18, fontWeight: 900, color: 'var(--purple)' }}>{pct}%</span>
        {sub && <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700 }}>{sub}</span>}
      </div>
    </div>
  );
}

function PracticeTab({ lesson, onDone }) {
  const [i, setI] = useState(0); const [sel, setSel] = useState(null); const [conf, setConf] = useState(false); const [done, setDoneState] = useState(false); const [score, setScore] = useState(0);
  const Q = lesson.practice[i];
  function pick(k) { if (conf) return; setSel(k); setConf(true); if (k === Q.answer) setScore(s => s + 1); }
  function next() { if (i + 1 >= lesson.practice.length) { setDoneState(true); onDone(); } else { setI(i + 1); setSel(null); setConf(false); } }
  if (done) return <div style={{ textAlign: 'center', padding: 30 }}><div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div><h3 style={{ fontWeight: 900, fontSize: 20, color: 'var(--purple)' }}>{score} / {lesson.practice.length}</h3><p style={{ color: 'var(--muted)', marginTop: 8 }}>Дасгал дууслаа!</p></div>;
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 12 }}>Дасгал {i + 1}/{lesson.practice.length}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 18, textAlign: 'center', padding: '16px', background: 'var(--bg-alt)', borderRadius: 12 }}>{Q.q}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Q.options.map((o, k) => {
          let bg = 'var(--bg-alt)', bd = 'var(--border)', cl = 'var(--text)';
          if (conf) { if (k === Q.answer) { bg = 'var(--green-bg)'; bd = 'var(--green)'; cl = 'var(--green-dark)'; } else if (k === sel) { bg = 'var(--red-light)'; bd = 'var(--red)'; cl = 'var(--red)'; } }
          return <button key={k} disabled={conf} onClick={() => pick(k)} style={{ padding: '13px 16px', borderRadius: 12, border: `2px solid ${bd}`, background: bg, color: cl, fontWeight: 700, fontSize: 15, cursor: conf ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>{o}</button>;
        })}
      </div>
      {conf && <button onClick={next} className="btn btn-purple" style={{ width: '100%', marginTop: 16 }}>{i + 1 >= lesson.practice.length ? 'Дуусгах' : 'Дараах →'}</button>}
    </div>
  );
}

function QuizTab({ lesson, onDone }) {
  const [i, setI] = useState(0); const [sel, setSel] = useState(null); const [conf, setConf] = useState(false); const [done, setDoneState] = useState(false); const [score, setScore] = useState(0);
  const Q = lesson.quiz[i];
  function pick(k) { if (conf) return; setSel(k); setConf(true); if (k === Q.answer) setScore(s => s + 1); }
  function next() { if (i + 1 >= lesson.quiz.length) { const pc = Math.round(((score) / lesson.quiz.length) * 100); setDoneState(true); onDone(pc); } else { setI(i + 1); setSel(null); setConf(false); } }
  if (done) { const pc = Math.round((score / lesson.quiz.length) * 100); return <div style={{ textAlign: 'center', padding: 30 }}><div style={{ fontSize: 48, marginBottom: 10 }}>{pc >= 90 ? '🏆' : pc >= 60 ? '🎉' : '💪'}</div><h3 style={{ fontWeight: 900, fontSize: 22, color: 'var(--purple)' }}>{score} / {lesson.quiz.length} ({pc}%)</h3>{pc >= 90 && <p style={{ color: 'var(--green)', fontWeight: 700, marginTop: 8 }}>Дүрэм эзэмшсэн! 🎓</p>}<button onClick={() => location.reload()} className="btn btn-ghost" style={{ marginTop: 14 }}>Дахин</button></div>; }
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 12 }}>Тест {i + 1}/{lesson.quiz.length}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 18, textAlign: 'center', padding: '16px', background: 'var(--bg-alt)', borderRadius: 12 }}>{Q.q}</div>
      <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Q.options.map((o, k) => {
          let bg = 'var(--bg-alt)', bd = 'var(--border)', cl = 'var(--text)';
          if (conf) { if (k === Q.answer) { bg = 'var(--green-bg)'; bd = 'var(--green)'; cl = 'var(--green-dark)'; } else if (k === sel) { bg = 'var(--red-light)'; bd = 'var(--red)'; cl = 'var(--red)'; } }
          return <button key={k} disabled={conf} onClick={() => pick(k)} style={{ padding: '13px', borderRadius: 12, border: `2px solid ${bd}`, background: bg, color: cl, fontWeight: 800, fontSize: 15, cursor: conf ? 'default' : 'pointer', fontFamily: 'inherit' }}>{o}</button>;
        })}
      </div>
      {conf && <button onClick={next} className="btn btn-purple" style={{ width: '100%', marginTop: 16 }}>{i + 1 >= lesson.quiz.length ? 'Дүн харах' : 'Дараах →'}</button>}
    </div>
  );
}
