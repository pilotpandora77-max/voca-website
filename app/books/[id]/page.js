'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import BOOKS, { findBook } from '@/lib/books';
import { Cover } from '../page';

const TABS = ['Тойм', 'Агуулга', 'Онцлох эшлэл', 'Сэтгэгдэл', 'Тэмдэглэл'];

export default function BookDetail() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const book = findBook(id);

  const [tab, setTab] = useState('Тойм');
  const [bm, setBm]   = useState(false);
  const [note, setNote] = useState('');
  const [savedNote, setSaved] = useState('');

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    if (!book) return;
    try {
      setBm(JSON.parse(localStorage.getItem('voca_book_bm') || '[]').includes(id));
      const notes = JSON.parse(localStorage.getItem('voca_book_notes') || '{}');
      setNote(notes[id] || ''); setSaved(notes[id] || '');
    } catch {}
  }, [id]);

  if (authLoad) return null;
  if (!book) return <div style={{ padding: 40, textAlign: 'center' }}><h2>Ном олдсонгүй</h2><Link href="/books" className="btn btn-purple" style={{ marginTop: 16, textDecoration: 'none' }}>Буцах</Link></div>;

  function toggleBm() {
    try { const a = JSON.parse(localStorage.getItem('voca_book_bm') || '[]'); const n = a.includes(id) ? a.filter(x => x !== id) : [...a, id]; localStorage.setItem('voca_book_bm', JSON.stringify(n)); setBm(n.includes(id)); } catch {}
  }
  function saveNote() {
    try { const notes = JSON.parse(localStorage.getItem('voca_book_notes') || '{}'); notes[id] = note; localStorage.setItem('voca_book_notes', JSON.stringify(notes)); setSaved(note); } catch {}
  }

  const similar = (book.similar || []).map(findBook).filter(Boolean);
  const ratingDist = [65, 25, 7, 2, 1];

  return (
    <div style={{ padding: '20px 28px 48px' }}>
      <Link href="/books" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-sub)', textDecoration: 'none', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>← Буцах</Link>

      {/* Header */}
      <div style={{ display: 'flex', gap: 28, marginBottom: 26, flexWrap: 'wrap' }}>
        <div style={{ width: 220, flexShrink: 0 }}><Cover book={book} big /></div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>{book.title}</h1>
          <p style={{ fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: 12 }}>{book.desc}</p>
          <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, marginBottom: 12 }}>{book.author}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#F59E0B', fontSize: 17 }}>★</span><span style={{ fontWeight: 800 }}>{book.rating}</span> <span style={{ color: 'var(--muted)', fontSize: 13 }}>({book.reviewsCount.toLocaleString()} үнэлгээ)</span></span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>📖 Ном</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {book.tags.map(t => <span key={t} className="tag tag-purple">{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={toggleBm} className="btn btn-purple" style={{ padding: '13px 26px', fontSize: 14 }}>{bm ? '🔖 Хадгалсан' : '🏷️ Хадгалах'}</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 22, alignItems: 'start' }}>
        {/* ── Main ── */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 26, borderBottom: '1.5px solid var(--border)', marginBottom: 20, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', color: tab === t ? 'var(--purple)' : 'var(--muted)', borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5 }}>
                {t === 'Сэтгэгдэл' ? `Сэтгэгдэл (${book.reviewsCount})` : t}
              </button>
            ))}
          </div>

          {tab === 'Тойм' && (
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)', marginBottom: 12 }}>Номын тухай</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: 14.5, lineHeight: 1.7, marginBottom: 20 }}>{book.summary}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 22 }}>
                {[['👤 Зохиолч', book.author], ['📅 Хэвлэгдсэн он', book.year], ['🌐 Хэл', book.lang], ['📄 Хуудасны тоо', book.pages], ['🏷️ Төрөл', book.type], ['🔖 ISBN', book.isbn]].map(([l, v]) => (
                  <div key={l} style={{ background: '#fff', padding: '14px 16px' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{v}</div>
                  </div>
                ))}
              </div>

              {book.learn.length > 0 && <>
                <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>Юу сурах вэ?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                  {book.learn.map((l, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>✓</span><span style={{ fontSize: 14, color: 'var(--text-sub)' }}>{l}</span></div>)}
                </div>
              </>}

              {book.audience.length > 0 && <>
                <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 12 }}>Энэ ном танд тохирох уу?</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {book.audience.map((a, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--purple-light)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--purple-dark)' }}>👤 {a}</div>)}
                </div>
              </>}
            </div>
          )}

          {tab === 'Агуулга' && (
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 14 }}>Агуулга</h3>
              {book.toc.map(([t, p], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{t}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'Онцлох эшлэл' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {book.quotes.map((q, i) => (
                <div key={i} className="card" style={{ borderLeft: '3px solid var(--purple)' }}>
                  <div style={{ fontSize: 24, color: 'var(--purple-mid)', lineHeight: 1 }}>"</div>
                  <p style={{ fontSize: 15, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.6, margin: '4px 0 10px' }}>{q.replace(/^"|"$/g, '')}</p>
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>– {book.author}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'Сэтгэгдэл' && (
            <div className="card">
              <div style={{ display: 'flex', gap: 28, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{book.rating}</div>
                  <div style={{ color: '#F59E0B', fontSize: 16 }}>★★★★★</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{book.reviewsCount.toLocaleString()} үнэлгээ</div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {[5, 4, 3, 2, 1].map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)', width: 28 }}>{s} ★</span>
                      <div style={{ flex: 1, height: 7, background: 'var(--bg-alt)', borderRadius: 6, overflow: 'hidden' }}><div style={{ height: '100%', width: `${ratingDist[i]}%`, background: 'var(--purple)', borderRadius: 6 }} /></div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', width: 30, textAlign: 'right' }}>{ratingDist[i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: 'var(--bg-alt)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>Э</div>
                  <div><div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>Энхтүүл</div><div style={{ color: '#F59E0B', fontSize: 12 }}>★★★★★ · 2 долоо хоногийн өмнө</div></div>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.5 }}>Ой тогтоолтын талаар хамгийн ойлгомжтой, хэрэглэхэд хялбар номуудын нэг. Техникүүдийг шууд хэрэгжүүлээд үр дүнг нь мэдэрсэн.</p>
              </div>
            </div>
          )}

          {tab === 'Тэмдэглэл' && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>Тэмдэглэл</h3>
                {note !== savedNote && <button onClick={saveNote} className="btn btn-purple" style={{ padding: '6px 14px', fontSize: 12 }}>Хадгалах</button>}
              </div>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={5} placeholder="Энэ номын талаар өөрийн тэмдэглэлээ бичнэ үү..." style={{ width: '100%', resize: 'vertical' }} />
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* TOC */}
          {book.toc.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Агуулга</h3>
              {book.toc.slice(0, 6).map(([t, p], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 12.5, color: 'var(--text-sub)', fontWeight: 600 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{t}</span><span style={{ color: 'var(--muted)', flexShrink: 0 }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          {/* Similar */}
          {similar.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Ижил сэдэвт номууд</h3>
              {similar.map(s => (
                <Link key={s.id} href={`/books/${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', textDecoration: 'none' }}>
                  <div style={{ width: 34, height: 46, borderRadius: 6, background: s.cover.bg, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{s.author}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#F59E0B' }}>★{s.rating}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Keywords */}
          {book.keywords.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Түлхүүр үгс</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {book.keywords.map(k => <span key={k} className="tag" style={{ background: 'var(--bg-alt)', color: 'var(--text-sub)' }}>{k}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
