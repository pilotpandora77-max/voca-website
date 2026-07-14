'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const DEFAULT_GROUP = 'Ерөнхий';

function PrintContent() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const groupName = params.get('group') || DEFAULT_GROUP;

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const printed = useRef(false);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    if (!user) return;
    api.get('/api/words').then(({ data }) => {
      const all = Array.isArray(data) ? data : [];
      setWords(all.filter(w => (w.group || DEFAULT_GROUP) === groupName));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, groupName]);

  useEffect(() => {
    if (loading || printed.current) return;
    printed.current = true;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [loading]);

  if (authLoad || loading) return null;

  const today = new Date().toLocaleDateString('mn-MN');

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px', fontFamily: 'inherit' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '8px 14px',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#374151',
        }}>← Буцах</button>
        <button onClick={() => window.print()} style={{
          background: '#7C3AED', border: 'none', borderRadius: 10, padding: '9px 18px', color: '#fff',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer',
        }}>🖨️ Хэвлэх / PDF татах</button>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 2, color: '#111' }}>📁 {groupName}</h1>
      <p style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 20 }}>{words.length} үг · {today} · voca</p>

      {words.length === 0 ? (
        <p style={{ color: '#6B7280', fontSize: 14 }}>Энэ бүлэгт үг алга.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr>
              {['#', 'Үг', 'Дуудлага', 'Монгол утга', 'Англи утга'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #111', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {words.map((w, i) => (
              <tr key={w._id || w.id || i} style={{ pageBreakInside: 'avoid' }}>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #E5E7EB', color: '#9CA3AF' }}>{i + 1}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #E5E7EB', fontWeight: 800, color: '#111' }}>{w.front || w.word || ''}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #E5E7EB', color: '#7C3AED' }}>{w.hint || w.reading || ''}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #E5E7EB', color: '#111' }}>{w.back || w.meaning || ''}</td>
                <td style={{ padding: '8px 10px', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>{w.meaningEn || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 16mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

export default function VocabPrintPage() {
  return (
    <Suspense fallback={null}>
      <PrintContent />
    </Suspense>
  );
}
