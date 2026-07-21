'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import ExamBuilder from '@/components/ExamBuilder';
import { examTypeMeta } from '@/lib/examTypes';

export default function ExamsPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [exams, setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode]     = useState('list'); // list | builder
  const [streak, setStreak] = useState(0);

  function load() {
    api.get('/api/exams').then(r => setExams(r.data)).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      load();
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
    }
  }, [authLoad, user]);

  if (authLoad || loading) return null;

  if (mode === 'builder') {
    return (
      <div style={{ paddingBottom: 40 }}>
        <PageHeader title="🎓 Шинэ шалгалт" subtitle="Өөрийн үгсээр нэртэй шалгалт үүсгэ." streak={streak} />
        <div style={{ padding: '0 28px' }}>
          <ExamBuilder mode="create" onSaved={exam => router.push(`/exams/${exam.id}`)} onCancel={() => setMode('list')} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="🎓 Шалгалт" subtitle="Өөрийн нэртэй шалгалтуудаа хадгалж, дахин дахин өг." streak={streak}
        actions={<button onClick={() => setMode('builder')} className="btn btn-purple" style={{ padding: '9px 16px' }}>+ Шинэ шалгалт</button>} />

      <div style={{ padding: '0 28px' }}>
        {exams.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🎓</div>
            <h3 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)', marginBottom: 8 }}>Одоогоор шалгалт үүсгээгүй байна</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>Өөрийн үгсийн сангаас сонгож, анхны нэртэй шалгалтаа үүсгээрэй.</p>
            <button onClick={() => setMode('builder')} className="btn btn-purple">+ Шинэ шалгалт үүсгэх</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {exams.map(e => (
              <Link key={e.id} href={`/exams/${e.id}`} className="card" style={{ textDecoration: 'none', padding: 18, display: 'block' }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {e.questionTypes.slice(0, 4).map(t => <span key={t} style={{ fontSize: 15 }}>{examTypeMeta(t).icon}</span>)}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>{e.wordCount} үг · {e.questionCount} асуулт</div>
                {e.lastAttempt ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 100, background: 'var(--purple-light)', color: 'var(--purple)', fontWeight: 800, fontSize: 12.5 }}>
                    Сүүлийн оноо: {e.lastAttempt.scorePct}%
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>Одоогоор өгөөгүй</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
