'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const TABS = ['Бүгд', 'Англи хэл', 'Хятад хэл', 'Япон хэл', 'Солонгос хэл', 'IELTS', 'TOEIC', 'HSK', 'TOPIK', 'Бага анги', 'Дунд анги', 'Ахлах анги'];
const TAB_ICONS = {
  'Англи хэл': '🇬🇧', 'Хятад хэл': '🇨🇳', 'Япон хэл': '🇯🇵', 'Солонгос хэл': '🇰🇷',
  IELTS: '🎓', TOEIC: '🎓', HSK: '汉', TOPIK: '한', 'Бага анги': '🎒', 'Дунд анги': '📗', 'Ахлах анги': '📕',
};

export function Cover({ book, height = 150, fontSize = 15 }) {
  return (
    <div style={{
      height, background: book.color || '#7C3AED', color: book.fg || '#FFFFFF',
      display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '10px 14px', borderRadius: '14px 14px 0 0', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ fontWeight: 900, fontSize, lineHeight: 1.3 }}>{book.title}</div>
    </div>
  );
}

export default function CourseBooksPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('Бүгд');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/course-books').then(r => setBooks(r.data)).catch(() => {}).finally(() => setLoading(false));
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
    }
  }, [authLoad, user]);

  if (authLoad || loading) return null;

  const filtered  = tab === 'Бүгд' ? books : books.filter(b => (b.tags || []).includes(tab));
  const featured  = filtered.slice(0, 5);
  const started   = books.filter(b => b.currentPage > 0);
  const continuing = [...started].sort((a, b) => new Date(b.lastReadAt || 0) - new Date(a.lastReadAt || 0)).slice(0, 4);
  const newest    = [...books].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const tagCounts = TABS.slice(1).map(t => ({ tag: t, count: books.filter(b => (b.tags || []).includes(t)).length }));

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Дасгалын номын сан 📚" subtitle="Өөрт тохирох дасгалын номоо сонгон, дадлагаа ахиулаарай." streak={streak} />

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20, alignItems: 'start' }}>
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 22, borderBottom: '1.5px solid var(--border)', marginBottom: 20, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap',
                color: tab === t ? 'var(--purple)' : 'var(--muted)',
                borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5,
              }}>{t}</button>
            ))}
          </div>

          {/* Featured */}
          <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Онцлох дасгалын номууд</h3>
          {featured.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Одоогоор ном алга.</p>}
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6, marginBottom: 26 }}>
            {featured.map(b => (
              <div key={b.id} className="card" style={{ padding: 0, overflow: 'hidden', flex: '0 0 220px' }}>
                <Link href={`/course-books/${b.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <Cover book={b} />
                  <div style={{ padding: '12px 14px 0' }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 8 }}>{b.author || '—'}</div>
                    {(b.tags || [])[0] && <span className="tag tag-purple" style={{ fontSize: 10, marginBottom: 10, display: 'inline-block' }}>{b.tags[0]}</span>}
                    {b.currentPage > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 700, marginTop: 6, marginBottom: 6 }}>📖 {b.currentPage}-р хуудаснаас</div>
                    )}
                  </div>
                </Link>
                <div style={{ padding: '0 14px 14px' }}>
                  <Link href={b.currentPage > 0 ? `/course-books/${b.id}/read` : `/course-books/${b.id}`} className="btn btn-purple" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center', fontSize: 12.5, padding: '8px', marginTop: 8 }}>
                    {b.currentPage > 0 ? '▶ Үргэлжлүүлэх' : 'Нээх →'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Category grid */}
          <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Ангиллаар үзэх</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 26 }}>
            {tagCounts.map(({ tag, count }) => (
              <button key={tag} onClick={() => setTab(tag)} className="card" style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: tab === tag ? '1.5px solid var(--purple)' : undefined,
                fontFamily: 'inherit', textAlign: 'left', padding: '12px 14px',
              }}>
                <span style={{ fontSize: 20 }}>{TAB_ICONS[tag]}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--text)' }}>{tag}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{count} ном</div>
                </div>
              </button>
            ))}
          </div>

          {/* Continue reading */}
          {continuing.length > 0 && (
            <>
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Сүүлд үргэлжлүүлсэн</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
                {continuing.map(b => (
                  <Link key={b.id} href={`/course-books/${b.id}/read`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '10px 14px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: b.color || '#7C3AED', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.currentPage}-р хуудас</div>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700 }}>▶</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Newest */}
          <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Шинээр нэмэгдсэн</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {newest.map(b => (
              <Link key={b.id} href={`/course-books/${b.id}`} className="card" style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', position: 'relative' }}>
                <span className="tag tag-purple" style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, zIndex: 1 }}>Шинэ</span>
                <Cover book={b} height={100} fontSize={12.5} />
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{b.author || '—'}</div>
                </div>
              </Link>
            ))}
            {newest.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Одоогоор ном алга.</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>Миний ахиц</h3>
            {[['Идэвхтэй ном', started.length], ['Одоогийн цуврал', `${streak} өдөр`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>{l}</span>
                <span style={{ color: 'var(--text)', fontWeight: 800 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
