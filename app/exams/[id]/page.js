'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import ExamBuilder from '@/components/ExamBuilder';
import { examTypeMeta, TIME_LIMIT_OPTIONS } from '@/lib/examTypes';

export default function ExamDetailPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [exam, setExam]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode]     = useState('view'); // view | edit

  function load() {
    api.get(`/api/exams/${id}`).then(r => setExam(r.data)).catch(() => setExam(null)).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user, id]);

  if (authLoad || loading) return null;

  if (!exam) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
        <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginBottom: 14 }}>Шалгалт олдсонгүй</h2>
        <Link href="/exams" className="btn btn-purple" style={{ textDecoration: 'none' }}>← Шалгалтууд руу буцах</Link>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div style={{ paddingBottom: 40 }}>
        <PageHeader title="✏️ Шалгалт засах" subtitle={exam.title} />
        <div style={{ padding: '0 28px' }}>
          <ExamBuilder mode="edit" initialExam={exam} onSaved={updated => { setExam({ ...exam, ...updated }); setMode('view'); }} onCancel={() => setMode('view')} />
        </div>
      </div>
    );
  }

  async function del() {
    if (!window.confirm(`"${exam.title}" шалгалтыг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;
    await api.delete(`/api/exams/${id}`).catch(() => {});
    router.push('/exams');
  }

  const timeLabel = TIME_LIMIT_OPTIONS.find(o => o.value === exam.timeLimit)?.label || 'Хугацаагүй';

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title={`🎓 ${exam.title}`}
        actions={
          <>
            <button onClick={() => setMode('edit')} className="btn btn-ghost" style={{ padding: '9px 14px' }}>✏️ Засах</button>
            <button onClick={del} className="btn btn-ghost" style={{ padding: '9px 14px', color: 'var(--red)' }}>🗑️ Устгах</button>
          </>
        } />

      <div style={{ padding: '0 28px', maxWidth: 640 }}>
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginBottom: 16 }}>
            <Stat label="Үгийн тоо" value={exam.words.length} />
            <Stat label="Асуултын тоо" value={exam.questionCount} />
            <Stat label="Хугацаа" value={timeLabel} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {exam.questionTypes.map(t => {
              const m = examTypeMeta(t);
              return <span key={t} className="tag tag-purple" style={{ fontSize: 12 }}>{m.icon} {m.title}</span>;
            })}
          </div>
          {exam.missingWordCount > 0 && (
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16 }}>⚠️ {exam.missingWordCount} үг устсан тул шалгалтад ороогүй байна.</div>
          )}
          <button onClick={() => router.push(`/exams/${id}/take`)} className="btn btn-purple" style={{ width: '100%', padding: '14px' }} disabled={!exam.words.length}>
            ▶ Шалгалт эхлүүлэх
          </button>
        </div>

        <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>Өмнөх оролдлогууд</h3>
        {exam.attempts.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Одоогоор оролдоогүй байна.</p>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {exam.attempts.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{new Date(a.createdAt).toLocaleString('mn-MN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{a.correctCount} зөв · {a.wrongCount} буруу · {a.skippedCount} алгассан</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 16, color: a.scorePct >= 80 ? 'var(--green)' : a.scorePct >= 50 ? 'var(--purple)' : 'var(--red)' }}>{a.scorePct}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>{label}</div>
    </div>
  );
}
