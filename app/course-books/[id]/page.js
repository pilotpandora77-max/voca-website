'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { Cover } from '../page';

export default function CourseBookDetail() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bm, setBm]   = useState(false);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    if (authLoad || !user) return;
    api.get(`/api/course-books/${id}`).then(r => {
      setBook(r.data);
      setBm(!!r.data.saved);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, authLoad, user]);

  if (authLoad || loading) return null;
  if (!book) return <div style={{ padding: 40, textAlign: 'center' }}><h2>Ном олдсонгүй</h2><Link href="/course-books" className="btn btn-purple" style={{ marginTop: 16, textDecoration: 'none' }}>Буцах</Link></div>;

  async function toggleBm() {
    setBm(v => !v);
    try { await api.post(`/api/course-books/${id}/save`); } catch {}
  }

  return (
    <div style={{ padding: '20px 28px 48px' }}>
      <Link href="/course-books" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-sub)', textDecoration: 'none', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>← Буцах</Link>

      <div style={{ display: 'flex', gap: 28, marginBottom: 26, flexWrap: 'wrap' }}>
        <div style={{ width: 220, flexShrink: 0 }}><Cover book={book} height={220} fontSize={19} /></div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>{book.title}</h1>
          {book.desc && <p style={{ fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: 12 }}>{book.desc}</p>}
          <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, marginBottom: 12 }}>{book.author}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {(book.tags || []).map(t => <span key={t} className="tag tag-purple">{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={`/course-books/${id}/read`} className="btn btn-purple" style={{ padding: '13px 26px', fontSize: 14, textDecoration: 'none' }}>
              📖 {book.currentPage > 1 ? 'Үргэлжлүүлэх' : 'Унших'}
            </Link>
            <button onClick={toggleBm} className="btn btn-ghost" style={{ padding: '13px 26px', fontSize: 14 }}>{bm ? '🔖 Хадгалсан' : '🏷️ Хадгалах'}</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 300 }}>
        <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>Дэлгэрэнгүй</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Зохиогч</span><span style={{ fontWeight: 700, color: 'var(--text)' }}>{book.author || '—'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Нэмэгдсэн</span><span style={{ fontWeight: 700, color: 'var(--text)' }}>{new Date(book.createdAt).toLocaleDateString('mn-MN')}</span></div>
        </div>
      </div>
    </div>
  );
}
