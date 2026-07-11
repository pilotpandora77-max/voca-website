'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { IELTS_OVERVIEW, IELTS_SECTIONS, IELTS_VOCAB } from '@/lib/ielts';

function speak(t) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export default function IeltsPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [active, setActive] = useState('overview');
  const [lessonId, setLessonId] = useState(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
  }, [authLoad, user]);

  if (authLoad) return null;

  const sec = IELTS_SECTIONS.find(s => s.id === active);

  function goSection(id) { setActive(id); setLessonId(null); }

  return (
    <div style={{ paddingBottom: 48 }}>
      <PageHeader title="IELTS бэлтгэл 🎓" subtitle="Олон улсын англи хэлний шалгалтад дөрвөн ур чадвараар бэлтгэ." streak={streak} />

      <div style={{ padding: '0 28px', maxWidth: 1000, margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          <button onClick={() => goSection('overview')} style={tabStyle(active === 'overview', '#7C3AED')}>📋 Тойм</button>
          {IELTS_SECTIONS.map(s => (
            <button key={s.id} onClick={() => goSection(s.id)} style={tabStyle(active === s.id, s.color)}>{s.icon} {s.name.split(' ')[0]}</button>
          ))}
          <button onClick={() => goSection('vocab')} style={tabStyle(active === 'vocab', '#EC4899')}>💎 Үгсийн сан</button>
        </div>

        {/* Overview */}
        {active === 'overview' && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)', marginBottom: 10 }}>IELTS гэж юу вэ?</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: 14.5, lineHeight: 1.7 }}>{IELTS_OVERVIEW.desc}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
              {IELTS_SECTIONS.map(s => (
                <button key={s.id} onClick={() => goSection(s.id)} style={{ textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: 18, fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '66'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{s.format.split('·')[0]}</div>
                </button>
              ))}
            </div>
            {/* Band guide */}
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>Band оноо (1–9)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                {IELTS_OVERVIEW.bands.map(b => (
                  <div key={b.band} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-alt)', borderRadius: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{b.band}</div>
                    <div><div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{b.label}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section detail */}
        {sec && (
          <div>
            <div className="card" style={{ marginBottom: 16, borderLeft: `4px solid ${sec.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: `${sec.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{sec.icon}</div>
                <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--text)' }}>{sec.name}</h2>
              </div>
              <div style={{ padding: '12px 16px', background: `${sec.color}10`, borderRadius: 12, fontSize: 13.5, color: 'var(--text)', fontWeight: 600 }}>📋 {sec.format}</div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sec.sections.map((s, i) => <div key={i} style={{ fontSize: 13.5, color: 'var(--text-sub)', display: 'flex', gap: 8 }}><span style={{ color: sec.color }}>▸</span> {s}</div>)}
              </div>
            </div>

            {/* Tips */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>💡 Зөвлөгөө</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sec.tips.map((t, i) => <div key={i} style={{ display: 'flex', gap: 10 }}><span style={{ width: 22, height: 22, borderRadius: '50%', background: `${sec.color}22`, color: sec.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span><span style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5 }}>{t}</span></div>)}
              </div>
            </div>

            {/* Question types */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>📝 Асуултын төрөл</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sec.qtypes.map((q, i) => <span key={i} style={{ padding: '7px 13px', background: 'var(--bg-alt)', borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: 'var(--text)', border: '1.5px solid var(--border)' }}>{q}</span>)}
              </div>
            </div>

            {/* Useful phrases */}
            {sec.phrases?.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>🗣️ Хэрэгтэй хэллэгүүд</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sec.phrases.map(([label, ph], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-alt)', borderRadius: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: sec.color, width: 110, flexShrink: 0 }}>{label}</span>
                      <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text)' }}>{ph}</span>
                      <button onClick={() => speak(ph.replace(/…/g, ''))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: sec.color }}>🔊</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deep lessons: Listening / Reading */}
            {sec.lessons?.length > 0 && (
              <LessonHub sec={sec} lessonId={lessonId} setLessonId={setLessonId} />
            )}

            {/* Writing: model essays */}
            {sec.id === 'writing' && <WritingModels sec={sec} />}

            {/* Speaking: parts */}
            {sec.id === 'speaking' && <SpeakingContent sec={sec} />}

            {/* Quick practice (band-basics quiz) */}
            <IeltsPractice sec={sec} />
          </div>
        )}

        {/* Vocab */}
        {active === 'vocab' && (
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>IELTS-д түгээмэл академик үгс</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Эссэ, ярианд ашиглах өндөр түвшний үгс.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {IELTS_VOCAB.map(([w, ipa, mn]) => (
                <div key={w} onClick={() => speak(w)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 12, cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{w}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>[{ipa}] · {mn}</div>
                  </div>
                  <span style={{ color: 'var(--purple)', fontSize: 16 }}>🔊</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function tabStyle(active, color) {
  return { padding: '9px 16px', borderRadius: 100, fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', border: active ? 'none' : '1.5px solid var(--border)', background: active ? color : '#fff', color: active ? '#fff' : 'var(--text-sub)' };
}

// ── Listening / Reading lesson hub ──────────────────────────────
function LessonHub({ sec, lessonId, setLessonId }) {
  const lesson = sec.lessons.find(l => l.id === lessonId);

  if (!lesson) {
    return (
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>📚 Гүнзгий хичээлүүд</h3>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>Бодит IELTS шиг текст/скрипт дээр суурилсан дасгал бүхий хичээлүүд.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sec.lessons.map((l, i) => (
            <button key={l.id} onClick={() => setLessonId(l.id)} style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = sec.color + '66'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${sec.color}18`, color: sec.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{l.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{l.tag}</div>
              </div>
              <span style={{ color: sec.color, fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <button onClick={() => setLessonId(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', marginBottom: 10, padding: 0, fontFamily: 'inherit' }}>← Хичээлийн жагсаалт</button>
      <h3 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>{lesson.title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 16 }}>{lesson.intro}</p>

      {sec.id === 'listening' && <ListeningScript lesson={lesson} color={sec.color} />}
      {sec.id === 'reading' && <ReadingPassage lesson={lesson} color={sec.color} />}

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1.5px solid var(--border)' }}>
        <h4 style={{ fontWeight: 900, fontSize: 14.5, color: 'var(--text)', marginBottom: 12 }}>🧪 Асуултууд</h4>
        {lesson.headingOptions
          ? <HeadingMatch lesson={lesson} color={sec.color} />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lesson.questions.map((q, i) => (
                <QuestionItem key={i} q={q} index={i} color={sec.color} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

function ListeningScript({ lesson, color }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ padding: '14px 16px', background: 'var(--bg-alt)', borderRadius: 12 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: show ? 12 : 0 }}>
        <button onClick={() => speak(lesson.script.replace(/\n/g, ' '))} className="btn btn-purple" style={{ fontSize: 12.5, padding: '8px 14px' }}>🔊 Тоглуулах</button>
        <button onClick={() => setShow(s => !s)} className="btn btn-ghost" style={{ fontSize: 12.5, padding: '8px 14px' }}>{show ? 'Скрипт нуух' : 'Скрипт харах'}</button>
      </div>
      {show && <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{lesson.script}</p>}
    </div>
  );
}

function ReadingPassage({ lesson, color }) {
  const [show, setShow] = useState(true);
  return (
    <div style={{ padding: '14px 16px', background: 'var(--bg-alt)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: show ? 12 : 0 }}>
        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>📄 {lesson.passageTitle}</span>
        <button onClick={() => setShow(s => !s)} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>{show ? 'Нуух' : 'Харах'}</button>
      </div>
      {show && (
        lesson.passageParagraphs
          ? lesson.passageParagraphs.map(p => (
              <p key={p.label} style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: 10 }}><b style={{ color }}>{p.label}.</b> {p.text}</p>
            ))
          : <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{lesson.passage}</p>
      )}
    </div>
  );
}

function QuestionItem({ q, index, color }) {
  const [checked, setChecked] = useState(false);
  const [val, setVal] = useState('');
  const [selected, setSelected] = useState(null);

  const isTFNG = typeof q.answer === 'string' && ['T', 'F', 'NG'].includes(q.answer);

  if (isTFNG) {
    const opts = [['T', 'True'], ['F', 'False'], ['NG', 'Not Given']];
    return (
      <div>
        <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>{index + 1}. {q.q}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {opts.map(([k, label]) => {
            let bg = 'var(--bg-alt)', bd = 'var(--border)', cl = 'var(--text)';
            if (checked) { if (k === q.answer) { bg = 'var(--green-bg)'; bd = 'var(--green)'; cl = 'var(--green-dark)'; } else if (k === selected) { bg = 'var(--red-light)'; bd = 'var(--red)'; cl = 'var(--red)'; } }
            return <button key={k} disabled={checked} onClick={() => { setSelected(k); setChecked(true); }} style={{ padding: '8px 14px', borderRadius: 10, border: `2px solid ${bd}`, background: bg, color: cl, fontWeight: 700, fontSize: 12.5, cursor: checked ? 'default' : 'pointer', fontFamily: 'inherit' }}>{label}</button>;
          })}
        </div>
      </div>
    );
  }

  if (q.type === 'mc') {
    return (
      <div>
        <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>{index + 1}. {q.q}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {q.options.map((o, k) => {
            let bg = 'var(--bg-alt)', bd = 'var(--border)', cl = 'var(--text)';
            if (checked) { if (k === q.answer) { bg = 'var(--green-bg)'; bd = 'var(--green)'; cl = 'var(--green-dark)'; } else if (k === selected) { bg = 'var(--red-light)'; bd = 'var(--red)'; cl = 'var(--red)'; } }
            return <button key={k} disabled={checked} onClick={() => { setSelected(k); setChecked(true); }} style={{ textAlign: 'left', padding: '9px 13px', borderRadius: 10, border: `2px solid ${bd}`, background: bg, color: cl, fontWeight: 600, fontSize: 12.5, cursor: checked ? 'default' : 'pointer', fontFamily: 'inherit' }}>{o}</button>;
          })}
        </div>
      </div>
    );
  }

  // gap fill
  const correct = checked && val.trim().toLowerCase() === String(q.answer).toLowerCase();
  return (
    <div>
      <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>{index + 1}. {q.q}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={val} disabled={checked} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && setChecked(true)}
          placeholder="Хариултаа бич..." style={{ padding: '9px 13px', borderRadius: 10, border: `2px solid ${checked ? (correct ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`, fontSize: 13, fontFamily: 'inherit', width: 200 }} />
        {!checked
          ? <button onClick={() => setChecked(true)} className="btn btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }}>Шалгах</button>
          : <span style={{ fontSize: 12.5, fontWeight: 700, color: correct ? 'var(--green-dark)' : 'var(--red)' }}>{correct ? '✅ Зөв' : `❌ Зөв хариулт: ${q.answer}`}</span>}
      </div>
    </div>
  );
}

function HeadingMatch({ lesson, color }) {
  const [sel, setSel] = useState({});
  const [checked, setChecked] = useState(false);
  const score = lesson.questions.filter((q, i) => sel[i] === q.answer).length;
  return (
    <div>
      <div style={{ marginBottom: 14, padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 6 }}>ГАРЧГИЙН СОНГОЛТ</div>
        {lesson.headingOptions.map((h, i) => <div key={i} style={{ fontSize: 12.5, color: 'var(--text-sub)', marginBottom: 3 }}>{String.fromCharCode(105 + i)}. {h}</div>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lesson.questions.map((q, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', width: 90 }}>{q.q}</span>
            <select value={sel[i] ?? ''} disabled={checked} onChange={e => setSel(s => ({ ...s, [i]: Number(e.target.value) }))}
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12.5, fontFamily: 'inherit' }}>
              <option value="" disabled>Сонгох…</option>
              {lesson.headingOptions.map((h, k) => <option key={k} value={k}>{String.fromCharCode(105 + k)}. {h}</option>)}
            </select>
            {checked && <span style={{ fontSize: 15 }}>{sel[i] === q.answer ? '✅' : '❌'}</span>}
          </div>
        ))}
      </div>
      {!checked
        ? <button onClick={() => setChecked(true)} className="btn btn-purple" style={{ marginTop: 14 }}>Шалгах</button>
        : <div style={{ marginTop: 14, fontWeight: 800, fontSize: 14, color }}>{score} / {lesson.questions.length} зөв</div>}
    </div>
  );
}

// ── Writing model essays ────────────────────────────────────────
function WritingModels({ sec }) {
  return (
    <>
      <EssayGallery title="✍️ Task 1 · Загвар хариулт" items={sec.task1} color={sec.color} />
      <EssayGallery title="📑 Task 2 · Загвар эссэ (Band 9)" items={sec.task2} color={sec.color} />
    </>
  );
}

function EssayGallery({ title, items, color }) {
  const [openId, setOpenId] = useState(null);
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(it => {
          const open = openId === it.id;
          return (
            <div key={it.id} style={{ border: '1.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <button onClick={() => setOpenId(open ? null : it.id)} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: open ? `${color}0d` : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{it.title}</span>
                <span style={{ fontSize: 13, color }}>{open ? '▲' : '▼'}</span>
              </button>
              {open && (
                <div style={{ padding: '4px 16px 18px' }}>
                  <p style={{ fontSize: 12.5, color: 'var(--text-sub)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 12 }}>&ldquo;{it.prompt}&rdquo;</p>

                  <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 6 }}>БҮТЭЦ</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                    {it.structure.map((s, i) => <div key={i} style={{ fontSize: 12.5, color: 'var(--text-sub)', display: 'flex', gap: 8 }}><span style={{ color }}>▸</span>{s}</div>)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)' }}>ЗАГВАР ХАРИУЛТ</span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: '#fff', background: color, borderRadius: 6, padding: '2px 7px' }}>Band {it.band}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{it.words} үг</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-line', background: 'var(--bg-alt)', padding: '14px 16px', borderRadius: 12 }}>{it.model}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Speaking content ────────────────────────────────────────────
function SpeakingContent({ sec }) {
  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>1️⃣ Part 1 · Жишээ асуулт & хариулт</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sec.part1.map((qa, i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: sec.color }}>Q:</span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, flex: 1 }}>{qa.q}</span>
                <button onClick={() => speak(qa.q)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🔊</button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)' }}>A:</span>
                <span style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{qa.a}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>2️⃣ Part 2 · Cue Cards & Загвар хариулт</h3>
        <CueCards cards={sec.part2} color={sec.color} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>3️⃣ Part 3 · Гүнзгий хэлэлцүүлэг</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sec.part3.map((qa, i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: sec.color }}>Q:</span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, flex: 1 }}>{qa.q}</span>
                <button onClick={() => speak(qa.q)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🔊</button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)' }}>A:</span>
                <span style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{qa.a}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CueCards({ cards, color }) {
  const [openId, setOpenId] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cards.map(c => {
        const open = openId === c.id;
        return (
          <div key={c.id} style={{ border: '1.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <button onClick={() => setOpenId(open ? null : c.id)} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: open ? `${color}0d` : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{c.title}</span>
              <span style={{ fontSize: 13, color }}>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div style={{ padding: '4px 16px 18px' }}>
                <div style={{ padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 10, marginBottom: 12 }}>
                  {c.cue.map((line, i) => <div key={i} style={{ fontSize: 12.5, color: 'var(--text-sub)', marginBottom: 3 }}>• {line}</div>)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)' }}>ЗАГВАР ХАРИУЛТ</span>
                  <button onClick={() => speak(c.model)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🔊</button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-line', background: 'var(--bg-alt)', padding: '14px 16px', borderRadius: 12 }}>{c.model}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function IeltsPractice({ sec }) {
  const [i, setI] = useState(0); const [sel, setSel] = useState(null); const [conf, setConf] = useState(false); const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  if (!sec.practice?.length) return null;
  const Q = sec.practice[i];
  if (done) return (
    <div className="card" style={{ textAlign: 'center', padding: 30 }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>{score === sec.practice.length ? '🏆' : '🎉'}</div>
      <h3 style={{ fontWeight: 900, fontSize: 20, color: sec.color }}>{score} / {sec.practice.length}</h3>
      <button onClick={() => { setI(0); setSel(null); setConf(false); setScore(0); setDone(false); }} className="btn btn-ghost" style={{ marginTop: 12 }}>Дахин</button>
    </div>
  );
  function pick(k) { if (conf) return; setSel(k); setConf(true); if (k === Q.answer) setScore(s => s + 1); }
  function next() { if (i + 1 >= sec.practice.length) setDone(true); else { setI(i + 1); setSel(null); setConf(false); } }
  return (
    <div className="card">
      <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>🧪 Дүрмийн шалгах дасгал</h3>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 12 }}>{i + 1}/{sec.practice.length}</div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>{Q.q}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Q.options.map((o, k) => {
          let bg = 'var(--bg-alt)', bd = 'var(--border)', cl = 'var(--text)';
          if (conf) { if (k === Q.answer) { bg = 'var(--green-bg)'; bd = 'var(--green)'; cl = 'var(--green-dark)'; } else if (k === sel) { bg = 'var(--red-light)'; bd = 'var(--red)'; cl = 'var(--red)'; } }
          return <button key={k} disabled={conf} onClick={() => pick(k)} style={{ padding: '12px 16px', borderRadius: 12, border: `2px solid ${bd}`, background: bg, color: cl, fontWeight: 700, fontSize: 14, cursor: conf ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>{o}</button>;
        })}
      </div>
      {conf && <button onClick={next} className="btn btn-purple" style={{ width: '100%', marginTop: 14 }}>{i + 1 >= sec.practice.length ? 'Дүн' : 'Дараах →'}</button>}
    </div>
  );
}
