'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

function relTime(iso) {
  if (!iso) return 'одоо';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'одоо';
  if (d < 3600) return `${Math.floor(d / 60)} минутын өмнө`;
  if (d < 86400) return `${Math.floor(d / 3600)} цагийн өмнө`;
  return `${Math.floor(d / 86400)} өдрийн өмнө`;
}

export default function AnnouncementsPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/news').then(r => setItems(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [authLoad, user]);

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Бүх мэдэгдэл" subtitle="Админаас нийтэлсэн бүх зарлалын түүх" />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 28px' }}>
        <button onClick={() => router.push('/social')} style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 800, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          ← Нийгэм рүү буцах
        </button>

        {loading && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Ачааллаж байна...</div>}
        {!loading && items.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Мэдэгдэл алга.</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(n => (
            <div key={n.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', borderLeft: `4px solid ${n.color || '#1CB0F6'}` }}>
              <span style={{ fontSize: 22 }}>{n.emoji || '📢'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>{n.body}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{relTime(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
