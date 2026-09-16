'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

// Найзын "🔗 Хуваалцах" товчоор үүсгэсэн линк дээр ирдэг хуудас — эхлээд
// үгсийн урьдчилсан харагдац (нэвтрэлт шаардлагагүй), дараа нь "Импорт хийх"
// дарвал тухайн хэрэглэгчийн "Үгс" хуудсанд шинэ бүлэг болж нэмэгдэнэ.
export default function ImportSharedGroupPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const { shareId } = useParams();

  const [preview, setPreview] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/shared-groups/${shareId}`)
      .then(({ data }) => setPreview(data))
      .catch(() => setNotFound(true));
  }, [shareId]);

  async function doImport() {
    if (!user) { router.push('/login'); return; }
    setImporting(true); setError('');
    try {
      const { data } = await api.post(`/api/shared-groups/${shareId}/import`);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Импорт хийхэд алдаа гарлаа');
    } finally {
      setImporting(false);
    }
  }

  if (notFound) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
        <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Холбоос олдсонгүй</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>Энэ линк хүчингүй болсон эсвэл буруу байна.</p>
        <Link href="/vocab" className="btn btn-purple" style={{ textDecoration: 'none' }}>← Үгс рүү буцах</Link>
      </div>
    );
  }

  if (!preview || authLoad) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>;
  }

  if (result) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontWeight: 900, fontSize: 19, color: 'var(--text)', marginBottom: 8 }}>Импорт амжилттай!</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 6 }}>
            <b style={{ color: 'var(--text)' }}>{result.addedCount}</b> үг “<b style={{ color: 'var(--text)' }}>{result.groupName}</b>” бүлэг болж нэмэгдлээ.
          </p>
          {result.skipped > 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 12.5, marginBottom: 18 }}>({result.skipped} үг давхцсан эсвэл багцын хязгаараас давсан тул алгассан)</p>
          )}
          <Link href="/vocab" className="btn btn-purple" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 10 }}>Үгс рүү очих →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 24px' }}>
      <div className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>{preview.icon || '📁'}</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{preview.ownerName} хуваалцсан үгийн бүлэг</p>
        <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--text)', marginBottom: 6 }}>{preview.groupName}</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>{preview.count} үг</p>

        <div style={{ textAlign: 'left', background: 'var(--bg-alt)', borderRadius: 14, padding: 14, marginBottom: 22 }}>
          {preview.words.map((w, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{w.word}</span>
              <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{w.meaning}</span>
            </div>
          ))}
          {preview.count > preview.words.length && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>… мөн бусад {preview.count - preview.words.length} үг</p>
          )}
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button onClick={doImport} disabled={importing} className="btn btn-purple" style={{ width: '100%', padding: 15 }}>
          {importing ? 'Импорт хийж байна…' : user ? '📥 Миний Үгс рүү импорт хийх' : 'Нэвтэрч, импорт хийх'}
        </button>
      </div>
    </div>
  );
}
