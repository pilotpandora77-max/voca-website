'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const TABS = ['Бүх төрлүүд', 'Үг цээжлэх', 'Ойлгох', 'Ярих', 'Сонсох', 'Бичих', 'Дүрмийн хичээл'];

const LESSONS = [
  { id: 'flashcard', title: 'Флаш карт', icon: '🃏', bg: '#EDE9FF', desc: 'Шинэ үгсийг карт ашиглан хялбар бөгөөд хурдан цээжил.', time: '5–15 мин', skills: ['Үг цээжлэх'], href: '/vocab/practice' },
  { id: 'choice', title: 'Сонголттой тест', icon: '✅', bg: '#ECFDF5', desc: 'Олон сонголттой асуултаар ойлголтоо шалгаарай.', time: '5–15 мин', skills: ['Ойлгох'], href: '/games' },
  { id: 'fill', title: 'Дутуу үг нөхөх', icon: '🅰️', bg: '#FEF3C7', desc: 'Өгүүлбэр дэх дутуу үгийг нөхөж ой тогтоолтоо бататгаарай.', time: '5–15 мин', skills: ['Ойлгох'], href: '/grammar-lessons' },
  { id: 'pronounce', title: 'Дуудлага дасгал', icon: '🎙️', bg: '#EFF6FF', desc: 'Үгээ зөв дуудаж, дуудлага сайжруулаарай.', time: '5–15 мин', skills: ['Ярих', 'Сонсох'], href: '/learn' },
  { id: 'listen', title: 'Сонсох дасгал', icon: '🎧', bg: '#FEF2F2', desc: 'Сонсох ойлгох чадвараа дээшлүүлээрэй.', time: '5–15 мин', skills: ['Сонсох'], href: '/games' },
  { id: 'conversation', title: 'Ярилцлагын дасгал', icon: '💬', bg: '#EFF6FF', desc: 'Бодит яриаг жишээ сонсоод, асуултад хариулаарай.', time: '10–20 мин', skills: ['Ярих', 'Сонсох'], href: '/reel' },
  { id: 'reading', title: 'Унших ойлгох', icon: '📖', bg: '#F8F5FF', desc: 'Богино текст уншиж, ойлголтын асуултад хариулаарай.', time: '10–20 мин', skills: ['Ойлгох'], href: '/books' },
  { id: 'writing', title: 'Бичих дасгал', icon: '✏️', bg: '#F5F0FF', desc: 'Өгүүлбэр зохиож, бичих чадвараа хөгжүүлээрэй.', time: '10–20 мин', skills: ['Бичих'], href: '/hanzi' },
];

const GRAMMAR_PREVIEW = [
  { title: 'Present Simple Tense', level: 'A1', pct: 72, done: '7/10 хичээл', color: '#7C3AED' },
  { title: 'Past Simple Tense', level: 'A1', pct: 45, done: '5/11 хичээл', color: '#3B82F6' },
  { title: 'Present Continuous Tense', level: 'A2', pct: 20, done: '2/10 хичээл', color: '#F59E0B' },
  { title: 'Countable & Uncountable Nouns', level: 'A2', pct: 0, done: '0/8 хичээл', color: '#9CA3AF' },
];

const BENEFITS = [
  { icon: '🧠', title: 'Ой тогтоолт сайжирна', desc: 'Янз бүрийн аргаар давтах нь мэдээллийг бат бэх тогтооно.' },
  { icon: '🎯', title: 'Ойлголт гүнзгийрнэ', desc: 'Олон төрлийн дасгал нь ойлголтыг бататгаж, практикт ашиглахад тусална.' },
  { icon: '📈', title: 'Бүх ур чадвар тэнцвэртэй хөгжинө', desc: 'Сонсох, ярих, унших, бичих зэрэг бүх чадварыг зэрэг хөгжүүл.' },
  { icon: '🏆', title: 'Урам зориг нэмэгдэнэ', desc: 'Янз бүрийн сорилтууд нь суралцахад илүү сонирхолтой болгоно.' },
];

const TODAY_PLAN = [
  { id: 'flashcard', title: 'Флаш карт', time: '10–15 мин', icon: '🃏' },
  { id: 'choice', title: 'Сонголттой тест', time: '10–15 мин', icon: '✅' },
  { id: 'pronounce', title: 'Дуудлага дасгал', time: '10 мин', icon: '🎙️' },
];

export default function LessonsPage() {
  const { user, loading: authLoad } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [stats, setStats]   = useState(null);
  const [tab, setTab]       = useState('Бүх төрлүүд');
  // Дүрмийн систем хэлээр автоматаар солигдоно
  const grammarHref = '/grammar-lessons';

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
      api.get('/api/stats').then(r => setStats(r.data)).catch(() => {});
    }
  }, [authLoad, user]);

  if (authLoad) return null;

  const filtered = tab === 'Бүх төрлүүд' ? LESSONS
    : tab === 'Дүрмийн хичээл' ? []
    : LESSONS.filter(l => l.skills.includes(tab) || (tab === 'Үг цээжлэх' && l.skills.includes('Үг цээжлэх')));

  const learnPct = Math.min(95, 40 + (stats?.reviewCount || 0) + (stats?.wordCount || 0));

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Хичээлүүдийн төрөл" subtitle="Өөрт тохирох хичээлийн төрлөө сонгон, үр дүнтэйгээр суралцаарай." streak={streak} />

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 24, borderBottom: '1.5px solid var(--border)', marginBottom: 20, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, color: tab === t ? 'var(--purple)' : 'var(--muted)', borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5 }}>
                {t}{t === 'Дүрмийн хичээл' && <span className="tag tag-purple" style={{ fontSize: 9 }}>Шинэ</span>}
              </button>
            ))}
          </div>

          {/* Lesson grid */}
          {tab !== 'Дүрмийн хичээл' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
              {filtered.map(l => (
                <div key={l.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 110, background: l.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>{l.icon}</div>
                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 5 }}>{l.title}</div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-sub)', lineHeight: 1.45, marginBottom: 12, flex: 1 }}>{l.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>
                      <span>🕐 {l.time}</span>
                      <span>📊 {l.skills.join(', ')}</span>
                    </div>
                    <Link href={l.href} className="btn btn-light" style={{ textDecoration: 'none', fontSize: 13, padding: '8px', textAlign: 'center', justifyContent: 'center' }}>Эхлэх →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* IELTS banner */}
          <Link href="/ielts" style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
            <div style={{ borderRadius: 18, padding: '22px 26px', background: 'linear-gradient(120deg,#7c3aed,#5b21b6)', color: '#fff', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', fontSize: 110, opacity: 0.15 }}>🎓</div>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>🎓</div>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 19 }}>IELTS бэлтгэл</h3>
                  <span style={{ background: '#fcd34d', color: '#5b21b6', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 900 }}>ШИНЭ</span>
                </div>
                <p style={{ fontSize: 13.5, opacity: 0.9, lineHeight: 1.5 }}>Listening · Reading · Writing · Speaking — дөрвөн ур чадвараар бэлтгэ. Зөвлөгөө, асуултын төрөл, дасгал, академик үгсийн сан.</p>
              </div>
              <span style={{ background: '#fff', color: 'var(--purple)', borderRadius: 12, padding: '11px 22px', fontWeight: 800, fontSize: 14, flexShrink: 0, position: 'relative' }}>Бэлтгэж эхлэх →</span>
            </div>
          </Link>

          {/* Grammar section */}
          <div className="card" style={{ border: '1.5px solid var(--purple-mid)', background: 'linear-gradient(135deg, var(--purple-soft), #fff)', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--purple)' }}>Дүрмийн хичээл</h3>
                  <span className="tag tag-purple" style={{ fontSize: 10 }}>Шинэ</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: 14 }}>Дүрмээ ойлгох, жишээ болон дасгал хийснээр бататгаарай.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                  {['Тодорхой тайлбар', 'Жишээ өгүүлбэр', 'Дасгал ба тест', 'Түвшин ахих систем'].map(x => (
                    <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}><span style={{ color: 'var(--green)' }}>✓</span> {x}</div>
                  ))}
                </div>
                <Link href={grammarHref} className="btn btn-purple" style={{ textDecoration: 'none', padding: '11px 20px' }}>Дүрмийн хичээл рүү →</Link>
              </div>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>Санал болгож буй дүрмүүд</span>
                  <Link href={grammarHref} style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>Бүгдийг харах →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {GRAMMAR_PREVIEW.map(g => (
                    <Link key={g.title} href={grammarHref} style={{ textDecoration: 'none', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3 }}>{g.title}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: g.color, background: `${g.color}18`, borderRadius: 5, padding: '1px 5px', flexShrink: 0 }}>{g.level}</span>
                      </div>
                      <MiniRing pct={g.pct} color={g.color} />
                      <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>{g.done}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>Яагаад янз бүрийн төрлөөр суралцах хэрэгтэй вэ?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {BENEFITS.map(b => (
              <div key={b.title} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)', marginBottom: 2 }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.4 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Learning status */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>Таны суралцах байдал</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <Ring pct={learnPct} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>7 хоногийн ахиц</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Ямар сайн байнаа! 👏</div>
            {[['Сурсан үг', stats?.wordCount || 0], ['Дуусгасан хичээл', stats?.reviewCount || 0], ['Одоогийн цуврал', `${streak} өдөр`], ['Дараагийн зорилго', '900 үг']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>{l}</span>
                <span style={{ color: 'var(--text)', fontWeight: 800 }}>{v}</span>
              </div>
            ))}
            <Link href="/streak" className="btn btn-light" style={{ width: '100%', marginTop: 12, textDecoration: 'none', justifyContent: 'center' }}>Дэлгэрэнгүй харах</Link>
          </div>

          {/* Today plan */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Өнөөдрийн төлөвлөгөө</h3>
            {TODAY_PLAN.map((p, i) => {
              const done = i < 2;
              const l = LESSONS.find(x => x.id === p.id);
              return (
                <Link key={p.id} href={l?.href || '#'} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', textDecoration: 'none', borderBottom: i < TODAY_PLAN.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.time}</div>
                  </div>
                  <span style={{ fontSize: 16, color: done ? 'var(--green)' : 'var(--border)' }}>{done ? '✅' : '⚪'}</span>
                </Link>
              );
            })}
          </div>

          {/* Most used */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Хамгийн их ашиглагддаг</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {LESSONS.slice(0, 6).map(l => (
                <Link key={l.id} href={l.href} className="tag tag-purple" style={{ textDecoration: 'none' }}>{l.title}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ring({ pct }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 88, height: 88 }}>
      <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--bg-alt)" strokeWidth="8" />
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--purple)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'var(--purple)' }}>{pct}%</div>
    </div>
  );
}
function MiniRing({ pct, color }) {
  const r = 18, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 50, height: 50, margin: '0 auto' }}>
      <svg width="50" height="50" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="25" cy="25" r={r} fill="none" stroke="var(--bg-alt)" strokeWidth="5" />
        <circle cx="25" cy="25" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'var(--text)' }}>{pct}%</div>
    </div>
  );
}
