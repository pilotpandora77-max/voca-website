'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
  }, [authLoad, user]);

  if (authLoad) return null;

  const sec = IELTS_SECTIONS.find(s => s.id === active);

  return (
    <div style={{ paddingBottom: 48 }}>
      <PageHeader title="IELTS бэлтгэл 🎓" subtitle="Олон улсын англи хэлний шалгалтад дөрвөн ур чадвараар бэлтгэ." streak={streak} />

      <div style={{ padding: '0 28px', maxWidth: 1000, margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          <button onClick={() => setActive('overview')} style={tabStyle(active === 'overview', '#7C3AED')}>📋 Тойм</button>
          {IELTS_SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={tabStyle(active === s.id, s.color)}>{s.icon} {s.name.split(' ')[0]}</button>
          ))}
          <button onClick={() => setActive('vocab')} style={tabStyle(active === 'vocab', '#EC4899')}>💎 Үгсийн сан</button>
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
                <button key={s.id} onClick={() => setActive(s.id)} style={{ textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: 18, fontFamily: 'inherit', transition: 'all 0.15s' }}
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

            {/* Practice */}
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
      <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>🧪 Шалгах дасгал</h3>
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
