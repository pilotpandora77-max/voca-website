'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import PageHeader from '@/components/PageHeader';
import EN_LESSONS, { CEFR } from '@/lib/grammarEn';

const BOOK_LESSONS = EN_LESSONS.filter(l => l.book === 'essential-grammar-in-use');

export default function EssentialGrammarPage() {
  const { user, loading: authLoad } = useAuth();
  const { setLang } = useLang();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [prog, setProg] = useState({});

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  // Энэ хуудас зөвхөн Англи хэлний хичээлтэй тул course-г en болгож
  // тохируулснаар хичээлийн дэлгэрэнгүй холбоос зөв нээгдэнэ.
  useEffect(() => { setLang('en'); }, []);

  useEffect(() => {
    try { setProg(JSON.parse(localStorage.getItem('voca_grammar_prog') || '{}')); } catch {}
  }, []);

  if (authLoad) return null;

  function pctOf(id) {
    const p = prog[id] || {};
    let done = 0;
    if (p.read) done++; if (p.practice) done++; if ((p.quiz || 0) >= 60) done++; if (p.note) done++;
    return Math.round((done / 4) * 100);
  }

  const learned = BOOK_LESSONS.filter(l => pctOf(l.id) >= 75).length;
  const levels = CEFR.filter(lv => BOOK_LESSONS.some(l => l.level === lv.level));

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Essential Grammar in Use 📗" subtitle="Raymond Murphy · 4th Edition — сонгодог англи хэлний дүрмийн сурах бичгийн сэдвүүдэд тулгуурласан хичээлүүд" streak={streak} />

      <div style={{ padding: '0 28px', maxWidth: 1000, margin: '0 auto' }}>
        {/* Book hero */}
        <div className="card" style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24, background: 'linear-gradient(135deg, #EEF2FF, #fff)', border: '1.5px solid var(--purple-mid)' }}>
          <div style={{
            width: 84, height: 108, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(160deg, #1E293B, #0F172A)', color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 24px rgba(15,23,42,0.35)', padding: 8, textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, fontWeight: 900, lineHeight: 1.25 }}>Essential<br />Grammar<br />in Use</div>
            <div style={{ fontSize: 8, opacity: 0.7, marginTop: 6 }}>R. MURPHY</div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <h2 style={{ fontWeight: 900, fontSize: 19, color: 'var(--text)' }}>Essential Grammar in Use</h2>
              <span className="tag tag-purple" style={{ fontSize: 10 }}>A1–B1</span>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.55, marginBottom: 8 }}>
              Raymond Murphy-гийн бичсэн, дэлхий даяар хамгийн өргөн ашиглагддаг эхлэгч түвшний англи хэлний дүрмийн сурах бичгийн сэдвүүдийн бүтцэд тулгуурлан VOCA-гийн бэлтгэсэн {BOOK_LESSONS.length} хичээл.
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Тайлбар, жишээ, дасгал бүгд VOCA-гийн өөрийн бэлтгэсэн агуулга бөгөөд номын эх текстийг хуулбарлаагүй болно.
            </p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--purple)' }}>{learned}/{BOOK_LESSONS.length}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>Эзэмшсэн</div>
          </div>
        </div>

        {/* Levels */}
        {levels.map(lv => {
          const lessons = BOOK_LESSONS.filter(l => l.level === lv.level);
          if (lessons.length === 0) return null;
          return (
            <div key={lv.level} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: lv.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span style={{ fontSize: 14, fontWeight: 900, lineHeight: 1 }}>{lv.level}</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: lv.color, textTransform: 'uppercase', letterSpacing: 0.6 }}>{lv.name}</div>
                  <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)' }}>{lessons.length} дүрэм</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
                {lessons.map(l => {
                  const pct = pctOf(l.id);
                  return (
                    <Link key={l.id} href={`/grammar-lessons/${l.id}`} style={{ textDecoration: 'none', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: '16px', transition: 'all 0.15s', display: 'block' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = lv.color + '66'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${lv.color}1A`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${lv.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: lv.color }}>{l.icon}</div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: lv.color, background: `${lv.color}18`, borderRadius: 6, padding: '2px 7px' }}>{l.level}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>{l.title}</div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4, marginBottom: 12, minHeight: 34 }}>{l.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-alt)', borderRadius: 6, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: lv.color, borderRadius: 6 }} /></div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: pct > 0 ? lv.color : 'var(--muted)' }}>{pct}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        <Link href="/grammar-lessons" style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>← Бүх дүрмийн хичээл рүү буцах (A1–C1)</Link>
      </div>
    </div>
  );
}
