'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
function fileUrl(p) { return p?.startsWith('http') ? p : API_BASE + p; }

export default function CourseBookReader() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [book, setBook]         = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [page, setPage]         = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selection, setSelection] = useState(null); // { text, x, y }
  const [aiReply, setAiReply]   = useState(null);
  const [aiError, setAiError]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast]       = useState('');
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    if (authLoad || !user) return;
    Promise.all([
      api.get(`/api/course-books/${id}`),
      api.get(`/api/course-books/${id}/progress`),
    ]).then(([b, p]) => {
      setBook(b.data);
      setPage(p.data.currentPage || 1);
      setBookmarks(p.data.bookmarks || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, authLoad, user]);

  function showToast(t) { setToast(t); setTimeout(() => setToast(''), 2500); }

  function goToPage(n) {
    const clamped = Math.max(1, Math.min(numPages || n, n));
    setPage(clamped);
    setAiReply(null); setAiError(false); setSelection(null);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.put(`/api/course-books/${id}/progress`, { page: clamped });
        if (data.earnedXp) showToast(`+${data.earnedXp} XP 📖`);
      } catch {}
    }, 600);
  }

  async function toggleBookmark() {
    try {
      const { data } = await api.post(`/api/course-books/${id}/bookmark`, { page });
      setBookmarks(data.bookmarks);
    } catch {}
  }

  function onMouseUp() {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || text.length < 2) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top });
    setAiReply(null); setAiError(false);
  }

  async function explainSelection() {
    if (!selection) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/api/course-books/explain', { text: selection.text });
      setAiReply(data.reply); setAiError(false);
    } catch (e) {
      setAiReply(e.response?.data?.error || 'Алдаа гарлаа'); setAiError(true);
    }
    setAiLoading(false);
  }

  async function addToFlashcard() {
    if (!selection || !aiReply || aiError) return;
    try {
      await api.post('/api/words', { word: selection.text, meaning: aiReply, group: book?.title || 'Ном' });
      showToast('Үгийн санд нэмэгдлээ ✅');
      setSelection(null); setAiReply(null);
    } catch {
      showToast('Алдаа гарлаа');
    }
  }

  if (authLoad || loading) return null;
  if (!book) return <div style={{ padding: 40, textAlign: 'center' }}><h2>Ном олдсонгүй</h2></div>;

  const isBookmarked = bookmarks.includes(page);

  return (
    <div style={{ padding: '16px 28px 40px', maxWidth: 900, margin: '0 auto' }} onMouseUp={onMouseUp}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Link href={`/course-books/${id}`} style={{ color: 'var(--text-sub)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>← Буцах</Link>
        <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</h2>
        <button onClick={toggleBookmark} title="Энэ хуудсыг тэмдэглэх" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>{isBookmarked ? '⭐' : '☆'}</button>
      </div>

      {numPages && (
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', background: 'var(--purple)', width: `${(page / numPages) * 100}%`, transition: 'width 0.2s' }} />
        </div>
      )}

      <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 12, position: 'relative', overflow: 'auto', maxHeight: '70vh' }}>
        <Document file={fileUrl(book.pdfUrl)} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<div style={{ padding: 60, color: 'var(--muted)' }}>Уншиж байна...</div>}>
          <Page pageNumber={page} width={600} renderAnnotationLayer renderTextLayer />
        </Document>

        {selection && (
          <div style={{
            position: 'fixed', left: selection.x, top: Math.max(10, selection.y - 10), transform: 'translate(-50%, -100%)',
            background: '#fff', border: '1.5px solid var(--purple-mid)', borderRadius: 12, padding: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 50, maxWidth: 280, width: 'max-content',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>"{selection.text.slice(0, 60)}"</div>
              <button onClick={() => { setSelection(null); setAiReply(null); setAiError(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13 }}>✕</button>
            </div>
            {aiReply && <div style={{ fontSize: 12.5, color: aiError ? '#dc2626' : 'var(--text-sub)', marginBottom: 8, whiteSpace: 'pre-wrap', maxWidth: 260 }}>{aiReply}</div>}
            {(!aiReply || aiError) && (
              <button onClick={explainSelection} disabled={aiLoading} className="btn btn-purple" style={{ width: '100%', fontSize: 12, padding: '7px', marginBottom: 6 }}>
                {aiLoading ? '...' : aiError ? '🔁 Дахин оролдох' : '🤖 AI тайлбар'}
              </button>
            )}
            <button onClick={addToFlashcard} disabled={!aiReply || aiError} className="btn btn-ghost" style={{ width: '100%', fontSize: 12, padding: '7px', opacity: (aiReply && !aiError) ? 1 : 0.5 }}>➕ Үгийн санд нэмэх</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 16 }}>
        <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="btn btn-ghost">← Өмнөх</button>
        <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 14 }}>{page} / {numPages || '—'}</span>
        <button onClick={() => goToPage(page + 1)} disabled={!!numPages && page >= numPages} className="btn btn-ghost">Дараах →</button>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--text)', color: '#fff', padding: '10px 20px', borderRadius: 100, fontWeight: 700, fontSize: 13, zIndex: 100 }}>{toast}</div>
      )}
    </div>
  );
}
