'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { Cover } from '../page';

const TABS = ['Тойм', 'Тэмдэглэл'];
const RICH_DEFAULTS = { rating: null, reviewsCount: 0, tags: [], learn: [], audience: [] };

export default function BookDetail() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Тойм');
  const [bm, setBm]   = useState(false);
  const [note, setNote] = useState('');
  const [savedNote, setSaved] = useState('');

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    if (authLoad || !user) return;
    api.get(`/api/books/${id}`).then(r => {
      setBook({ ...RICH_DEFAULTS, ...r.data });
      setBm(!!r.data.saved);
    }).catch(() => {}).finally(() => setLoading(false));
    try {
      const notes = JSON.parse(localStorage.getItem('voca_book_notes') || '{}');
      setNote(notes[id] || ''); setSaved(notes[id] || '');
    } catch {}
  }, [id, authLoad, user]);

  if (authLoad || loading) return null;
  if (!book) return <div style={{ padding: 40, textAlign: 'center' }}><h2>Ном олдсонгүй</h2><Link href="/books" className="btn btn-purple" style={{ marginTop: 16, textDecoration: 'none' }}>Буцах</Link></div>;

  async function toggleBm() {
    setBm(v => !v);
    try { await api.post(`/api/books/${id}/save`); } catch {}
  }
  function saveNote() {
    try { const notes = JSON.parse(localStorage.getItem('voca_book_notes') || '{}'); notes[id] = note; localStorage.setItem('voca_book_notes', JSON.stringify(notes)); setSaved(note); } catch {}
  }

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
          {book.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#F59E0B', fontSize: 17 }}>★</span><span style={{ fontWeight: 800 }}>{book.rating}</span> <span style={{ color: 'var(--muted)', fontSize: 13 }}>({book.reviewsCount.toLocaleString()} үнэлгээ)</span></span>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>📖 Ном</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {book.tags.map(t => <span key={t} className="tag tag-purple">{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={`/books/${id}/read`} className="btn btn-purple" style={{ padding: '13px 26px', fontSize: 14, textDecoration: 'none' }}>📖 Унших</Link>
            <button onClick={toggleBm} className="btn btn-ghost" style={{ padding: '13px 26px', fontSize: 14 }}>{bm ? '🔖 Хадгалсан' : '🏷️ Хадгалах'}</button>
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
                {t}
              </button>
            ))}
          </div>

          {tab === 'Тойм' && (
            <div className="card">
              <h3 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)', marginBottom: 12 }}>Номын тухай</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: 14.5, lineHeight: 1.7, marginBottom: 20 }}>{book.summary || book.desc}</p>

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
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>Дэлгэрэнгүй</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Зохиогч</span><span style={{ fontWeight: 700, color: 'var(--text)' }}>{book.author || '—'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Нэмэгдсэн</span><span style={{ fontWeight: 700, color: 'var(--text)' }}>{new Date(book.createdAt).toLocaleDateString('mn-MN')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
