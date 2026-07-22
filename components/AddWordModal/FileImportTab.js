'use client';
import { useState, useRef } from 'react';
import api from '@/lib/api';
import { AI_LANGS } from './constants';

const SKIP_REASON_MN = {
  malformed: 'алдаатай мөр', duplicate: 'давхцсан', 'plan-limit': 'багцын хязгаарт хүрсэн',
  'ai-limit': 'AI-ийн өдрийн хязгаарт хүрсэн', 'ai-unavailable': 'AI ажиллахгүй байна', 'ai-failed': 'AI боловсруулж чадсангүй',
};

// .txt/.csv файлаас олон үгийг нэг дор оруулна. Meaning дутуу мөрүүдийг backend
// GPT-4o-оор автоматаар баяжуулна.
export default function FileImportTab({ aiLang, setAiLang, targetGroup, onAdded }) {
  const [file, setFile] = useState(null);
  const [lineCount, setLineCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setResult(null);
    if (!f) { setFile(null); setLineCount(0); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result || '').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      setLineCount(lines.length);
    };
    reader.readAsText(f);
  }

  async function doImport() {
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('lang', aiLang);
      fd.append('group', targetGroup);
      const { data } = await api.post('/api/words/bulk-import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      if (data.addedCount > 0) onAdded?.();
    } catch (e) {
      alert(e.response?.data?.error || 'Файл импортлоход алдаа гарлаа.');
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {AI_LANGS.map(l => (
          <button key={l.code} type="button" onClick={() => { setAiLang(l.code); setFile(null); setLineCount(0); setResult(null); }} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
            border: `1.5px solid ${aiLang === l.code ? 'var(--purple)' : 'var(--border)'}`,
            background: aiLang === l.code ? 'var(--purple-light)' : 'var(--bg-alt)',
            color: aiLang === l.code ? 'var(--purple)' : 'var(--text-sub)',
          }}>
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ background: 'var(--bg-alt)', marginBottom: 14 }}>
        <p style={{ fontSize: 12.5, color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 0 }}>
          <strong>Файлын формат:</strong> мөр бүрт нэг үг. <code>үг</code>, эсвэл <code>үг,утга</code>, эсвэл <code>үг,утга,жишээ өгүүлбэр</code>.
          Утга дутуу мөрүүдийг AI автоматаар бөглөнө. Хамгийн ихдээ 40 мөр.
        </p>
      </div>

      <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-light" style={{ padding: '8px 14px', fontSize: 12.5, marginBottom: 8 }}>
        📁 Файл сонгох
      </button>
      <input ref={fileRef} type="file" accept=".txt,.csv" onChange={onFileChange} style={{ display: 'none' }} />
      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16 }}>
        {file ? `${file.name} — ${lineCount} мөр олдлоо` : 'Файл сонгогдоогүй'}
      </div>

      <button className="btn btn-purple" onClick={doImport} disabled={!file || busy} style={{ width: '100%' }}>
        {busy ? 'AI-аар баяжуулж байна…' : 'Импортлох'}
      </button>

      {result && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--purple)', marginBottom: 6 }}>
            ✓ {result.addedCount} үг нэмэгдлээ{result.skipped.length ? `, ${result.skipped.length} алгассан` : ''}
          </div>
          {result.cappedCount > 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{result.cappedCount} мөр 40-ийн хязгаараас давсан тул орсонгүй.</div>}
          {result.skipped.length > 0 && (
            <div style={{ marginTop: 8, maxHeight: 160, overflowY: 'auto' }}>
              {result.skipped.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--muted)', padding: '3px 0' }}>
                  {s.word || `мөр ${s.index + 1}`} — {SKIP_REASON_MN[s.reason] || s.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
