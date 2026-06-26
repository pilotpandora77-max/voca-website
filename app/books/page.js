'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import BOOKS, { BOOK_CATEGORIES, READING_TIPS, READING_BENEFITS } from '@/lib/books';

export default function BooksPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [bm, setBm]         = useState([]);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
    try { setBm(JSON.parse(localStorage.getItem('voca_book_bm') || '[]')); } catch {}
  }, [authLoad, user]);

  if (authLoad) return null;

  function toggleBm(e, id) {
    e.preventDefault(); e.stopPropagation();
    setBm(prev => { const n = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]; localStorage.setItem('voca_book_bm', JSON.stringify(n)); return n; });
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Номын танилцуулга 📖" subtitle="Ой тогтоолт, гүн төвлөрөл, оюу ухааны хөгжлийг дэмжих шилдэг номууд" streak={streak} />

      <div style={{ padding: '0 28px' }}>
        {/* Category banners */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {BOOK_CATEGORIES.map(c => (
            <a key={c.id} href={`#${c.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 16, background: `${c.color}0E`, border: `1.5px solid ${c.color}28` }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${c.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{c.icon}</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 15, color: c.color }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>{c.desc}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Sections */}
        {BOOK_CATEGORIES.map(c => {
          const books = BOOKS.filter(b => b.cat === c.id);
          return (
            <div key={c.id} id={c.id} style={{ marginBottom: 34, scrollMarginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontWeight: 900, fontSize: 18, color: c.color }}>{c.name}ын номууд</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {books.map(b => (
                  <Link key={b.id} href={`/books/${b.id}`} style={{ textDecoration: 'none', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: 16, transition: 'all 0.16s', display: 'block' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = c.color + '55'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <Cover book={b} />
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)', marginTop: 12, lineHeight: 1.3 }}>{b.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>{b.author}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <span style={{ color: '#F59E0B' }}>★</span>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)' }}>{b.rating}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.45, marginBottom: 10, minHeight: 50 }}>{b.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button onClick={e => toggleBm(e, b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: bm.includes(b.id) ? 'var(--purple)' : 'var(--muted)' }}>{bm.includes(b.id) ? '🔖' : '🏷️'}</button>
                      <span style={{ fontSize: 12.5, color: 'var(--purple)', fontWeight: 800 }}>Дэлгэрэнгүй →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* Benefits */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'linear-gradient(135deg, var(--purple-light), var(--purple-soft))', border: '1.5px solid var(--purple-mid)', marginBottom: 22 }}>
          <div style={{ fontSize: 52 }}>📖</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--purple-dark)', marginBottom: 10 }}>Ном уншихын ашиг</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 18px' }}>
              {READING_BENEFITS.map(b => <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}><span style={{ color: 'var(--green)' }}>✓</span> {b}</div>)}
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 180 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--purple-dark)', fontStyle: 'italic', lineHeight: 1.4 }}>"Нэг ном бол мянган туршлага."</p>
            <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700 }}>– Эзоп</span>
          </div>
        </div>

        {/* Tips */}
        <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Унших зөвлөмж</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {READING_TIPS.map(t => (
            <div key={t.title} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{t.icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Cover({ book, big }) {
  const h = big ? 300 : 150;
  return (
    <div style={{ height: h, borderRadius: 12, background: book.cover.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 12px', textAlign: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ fontWeight: 900, fontSize: big ? 22 : 14, color: book.cover.fg, lineHeight: 1.2, letterSpacing: 0.3, textTransform: 'uppercase' }}>{book.title}</div>
      <div style={{ width: 30, height: 2, background: book.cover.fg, opacity: 0.5, margin: big ? '14px 0' : '8px 0' }} />
      <div style={{ fontSize: big ? 13 : 10, color: book.cover.fg, opacity: 0.85, fontWeight: 600 }}>{book.author}</div>
    </div>
  );
}
