'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { findCategory } from '@/lib/courses';

function speak(t) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
function loadProg() { try { return JSON.parse(localStorage.getItem('voca_learn_progress') || '{}'); } catch { return {}; } }
function loadFav() { try { return JSON.parse(localStorage.getItem('voca_learn_fav') || '[]'); } catch { return []; } }

const TABS = ['Үгс', 'Сураглах', 'Тест хийх', 'Тэмдэглэл'];
const DAYS = ['Да', 'Мя', 'Лх', 'Пу', 'Ба', 'Бя', 'Ня'];

export default function CategoryPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const { cat } = useParams();
  const category = findCategory(cat);

  const [tab, setTab]   = useState('Үгс');
  const [q, setQ]       = useState('');
  const [prog, setProg] = useState({});
  const [fav, setFav]   = useState([]);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    setProg(loadProg()); setFav(loadFav());
  }, [authLoad, user]);

  if (authLoad) return null;
  if (!category) return <div style={{ padding: 40, textAlign: 'center' }}><h2>Ангилал олдсонгүй</h2><Link href="/learn" className="btn btn-purple" style={{ marginTop: 16, textDecoration: 'none' }}>Буцах</Link></div>;

  const catProg = prog[category.id] || {};
  const learnedCount = Object.values(catProg).filter(w => w.learned).length;
  const masteredCount = Object.values(catProg).filter(w => w.rating === 'known').length;
  const learningCount = Object.values(catProg).filter(w => w.learned && w.rating !== 'known').length;
  const notCount = category.words.length - masteredCount - learningCount;
  const pct = Math.round((masteredCount / category.words.length) * 100);

  function toggleFav(wid) {
    const key = `${category.id}:${wid}`;
    setFav(prev => {
      const next = prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key];
      localStorage.setItem('voca_learn_fav', JSON.stringify(next));
      return next;
    });
  }

  const filtered = category.words.filter(w => !q || w.word.toLowerCase().includes(q.toLowerCase()) || w.mn.includes(q));

  return (
    <div style={{ padding: '24px 28px 48px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20, alignItems: 'start' }}>
      <div>
        {/* Back */}
        <Link href="/learn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-sub)', textDecoration: 'none', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>← Буцах</Link>

        {/* Header card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ width: 110, height: 110, borderRadius: 18, background: `${category.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, flexShrink: 0 }}>{category.emoji}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>{category.name}</h1>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>{category.desc}</p>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>Таны ахиц: <span style={{ color: category.color }}>{pct}%</span> ({masteredCount}/{category.words.length} үг)</div>
            <div style={{ height: 8, background: 'var(--bg-alt)', borderRadius: 6, overflow: 'hidden', maxWidth: 360 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: category.color, borderRadius: 6 }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 30, borderBottom: '1.5px solid var(--border)', marginBottom: 18 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 800, fontSize: 14, color: tab === t ? 'var(--purple)' : 'var(--muted)',
              borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5,
            }}>{t}</button>
          ))}
        </div>

        {/* ── Үгс ── */}
        {tab === 'Үгс' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Үг хайх..." style={{ flex: 1, maxWidth: 320 }} />
              <button onClick={() => { const r = category.words[Math.floor(Math.random() * category.words.length)]; router.push(`/learn/${category.id}/${r.id}`); }}
                className="btn btn-ghost" style={{ padding: '10px 16px' }}>🔀 Санамсаргүй</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(word => {
                const isFav = fav.includes(`${category.id}:${word.id}`);
                const st = catProg[word.id];
                return (
                  <div key={word.id} onClick={() => router.push(`/learn/${category.id}/${word.id}`)} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-mid)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${category.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{word.emoji || '🔤'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{word.word}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>[{word.ipa}]</span>
                        {st?.rating === 'known' && <span style={{ fontSize: 11 }}>✅</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{word.mn}{word.examples[0] ? ` · ${word.examples[0].en}` : ''}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); speak(word.word); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--purple)' }}>🔊</button>
                    <button onClick={e => { e.stopPropagation(); toggleFav(word.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: isFav ? '#F59E0B' : 'var(--border)' }}>{isFav ? '⭐' : '☆'}</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Сураглах ── */}
        {tab === 'Сураглах' && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎧</div>
            <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Үг бүрийг дараалан сурцгаая</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Эхний үгээс эхлээд жишээ, дуудлага, синонимтай нь дэлгэрэнгүй сур.</p>
            <Link href={`/learn/${category.id}/${category.words[0].id}`} className="btn btn-purple" style={{ textDecoration: 'none', padding: '12px 28px' }}>Эхлэх →</Link>
          </div>
        )}

        {/* ── Тест ── */}
        {tab === 'Тест хийх' && <QuizTab category={category} />}

        {/* ── Тэмдэглэл ── */}
        {tab === 'Тэмдэглэл' && <NotesTab category={category} />}
      </div>

      {/* ── Sidebar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Progress ring */}
        <div className="card">
          <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>Ахицын тойм</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Ring pct={pct} color={category.color} sub={`${masteredCount}/${category.words.length} үг`} />
          </div>
          {[['Мэддэг', masteredCount, '#22C55E'], ['Сурч байгаа', learningCount, '#F59E0B'], ['Сураагүй', notCount, '#9CA3AF']].map(([l, n, c]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{n}</span>
            </div>
          ))}
          <Link href={`/learn/${category.id}/${category.words[0].id}`} className="btn btn-purple" style={{ width: '100%', marginTop: 12, textDecoration: 'none' }}>Суралцах</Link>
        </div>

        {/* Tip */}
        <div className="card">
          <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>Зөвлөгөө 💡</h3>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.55 }}>Шинэ үгсийг тогтмол давтаж байвал илүү сайн тогтооно. Жишээ өгүүлбэртэй нь хамт сур.</p>
        </div>
      </div>
    </div>
  );
}

function Ring({ pct, color, sub }) {
  const r = 46, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-alt)" strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 0.6s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{pct}%</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{sub}</span>
      </div>
    </div>
  );
}

function QuizTab({ category }) {
  const words = category.words;
  const [questions] = useState(() => {
    const shuffle = a => [...a].sort(() => Math.random() - 0.5);
    return shuffle(words).slice(0, Math.min(8, words.length)).map(correct => {
      const opts = shuffle([correct, ...shuffle(words.filter(w => w.id !== correct.id)).slice(0, 3)]);
      return { word: correct, opts, answer: opts.indexOf(correct) };
    });
  });
  const [i, setI] = useState(0); const [sel, setSel] = useState(null); const [conf, setConf] = useState(false); const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  if (words.length < 4) return <div className="card" style={{ textAlign: 'center', padding: 30 }}><p style={{ color: 'var(--muted)' }}>Тест хийхэд дор хаяж 4 үг хэрэгтэй.</p></div>;
  if (done) return (
    <div className="card" style={{ textAlign: 'center', padding: 36 }}>
      <div style={{ fontSize: 50, marginBottom: 10 }}>{score / questions.length >= 0.7 ? '🎉' : '💪'}</div>
      <h3 style={{ fontWeight: 900, fontSize: 22, color: 'var(--purple)', marginBottom: 16 }}>{score} / {questions.length}</h3>
      <button onClick={() => location.reload()} className="btn btn-purple" style={{ padding: '11px 24px' }}>Дахин</button>
    </div>
  );
  const Q = questions[i];
  function pick(k) { if (conf) return; setSel(k); setConf(true); if (k === Q.answer) setScore(s => s + 1); }
  function next() { if (i + 1 >= questions.length) setDone(true); else { setI(i + 1); setSel(null); setConf(false); } }
  return (
    <div className="card">
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 8 }}>{i + 1}/{questions.length}</div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--text)' }}>{Q.word.word}</div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>[{Q.word.ipa}]</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginTop: 10 }}>Зөв орчуулгыг сонго</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Q.opts.map((o, k) => {
          let bg = 'var(--bg-alt)', bd = 'var(--border)', cl = 'var(--text)';
          if (conf) { if (k === Q.answer) { bg = 'var(--green-bg)'; bd = 'var(--green)'; cl = 'var(--green-dark)'; } else if (k === sel) { bg = 'var(--red-light)'; bd = 'var(--red)'; cl = 'var(--red)'; } }
          return <button key={k} disabled={conf} onClick={() => pick(k)} style={{ padding: '14px', borderRadius: 12, border: `2px solid ${bd}`, background: bg, color: cl, fontWeight: 800, fontSize: 15, cursor: conf ? 'default' : 'pointer', fontFamily: 'inherit' }}>{o.mn}</button>;
        })}
      </div>
      {conf && <button onClick={next} className="btn btn-purple" style={{ width: '100%', marginTop: 14 }}>{i + 1 >= questions.length ? 'Дүн' : 'Дараах →'}</button>}
    </div>
  );
}

function NotesTab({ category }) {
  const [notes, setNotes] = useState({});
  useEffect(() => { try { setNotes(JSON.parse(localStorage.getItem('voca_word_notes') || '{}')); } catch {} }, []);
  const entries = category.words.map(w => ({ w, note: notes[`${category.id}:${w.id}`] })).filter(e => e.note);
  if (entries.length === 0) return <div className="card" style={{ textAlign: 'center', padding: 30 }}><div style={{ fontSize: 40, marginBottom: 10 }}>📝</div><p style={{ color: 'var(--muted)' }}>Одоогоор тэмдэглэл алга. Үгийн дэлгэрэнгүй хуудаснаас тэмдэглэл нэмээрэй.</p></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.map(({ w, note }) => (
        <div key={w.id} className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{w.word} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>· {w.mn}</span></div>
          <div style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.5 }}>{note}</div>
        </div>
      ))}
    </div>
  );
}
