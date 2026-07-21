'use client';
import { useState } from 'react';
import api from '@/lib/api';

const MINUTE_OPTIONS = [10, 20, 30, 60];

// Хэрэглэгчийн өөрөө тохируулсан "Хэл сурах зорилго" (Профайл хуудас). exam-specific
// (HSK/IELTS зэрэг) стандартад холбоогүй — зөвхөн хэрэглэгчийн сонгосон тоо.
export default function GoalSettingsModal({ initial, onSaved, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [targetWords, setTargetWords] = useState(initial?.targetWords || 500);
  const [dailyWordTarget, setDailyWordTarget] = useState(initial?.dailyWordTarget || 20);
  const [dailyReviewTarget, setDailyReviewTarget] = useState(initial?.dailyReviewTarget || 20);
  const [dailyExerciseTarget, setDailyExerciseTarget] = useState(initial?.dailyExerciseTarget || 3);
  const [dailyMinutes, setDailyMinutes] = useState(initial?.dailyMinutes || 20);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const { data } = await api.patch('/api/auth/profile', {
        goalTitle: title,
        goalTargetWords: targetWords,
        dailyWordTarget, dailyReviewTarget, dailyExerciseTarget, dailyMinutes,
      });
      onSaved(data);
    } catch (e2) {
      setError(e2?.response?.data?.error || 'Хадгалахад алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,30,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: '28px 30px', maxHeight: '88vh', overflowY: 'auto' }}>
        <h2 style={{ fontWeight: 900, fontSize: 19, color: 'var(--text)', marginBottom: 4 }}>🎯 Зорилго тохируулах</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 20 }}>Өөрийн тоогоо оруулж, өдөр бүрийн зорилгоо тодорхойлоорой.</p>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Зорилгын нэр (заавал биш)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ж: HSK 5 болох" maxLength={60} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Нийт цээжлэх үгийн тоо</label>
            <input type="number" min={50} max={20000} value={targetWords} onChange={e => setTargetWords(Number(e.target.value))} required />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Өдөрт шинэ үг</label>
              <input type="number" min={1} value={dailyWordTarget} onChange={e => setDailyWordTarget(Number(e.target.value))} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Өдөрт давталт</label>
              <input type="number" min={1} value={dailyReviewTarget} onChange={e => setDailyReviewTarget(Number(e.target.value))} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>Өдөрт дасгал</label>
              <input type="number" min={1} value={dailyExerciseTarget} onChange={e => setDailyExerciseTarget(Number(e.target.value))} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Өдөрт хэдэн минут</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {MINUTE_OPTIONS.map(m => (
                <button type="button" key={m} onClick={() => setDailyMinutes(m)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
                  border: `1.5px solid ${dailyMinutes === m ? 'var(--purple)' : 'var(--border)'}`,
                  background: dailyMinutes === m ? 'var(--purple-light)' : '#fff', color: dailyMinutes === m ? 'var(--purple)' : 'var(--text-sub)',
                }}>{m} мин</button>
              ))}
            </div>
          </div>
          {error && <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onCancel} className="btn btn-ghost" style={{ flex: 1 }}>Болих</button>
            <button type="submit" disabled={saving} className="btn btn-purple" style={{ flex: 1 }}>{saving ? 'Хадгалж байна...' : 'Хадгалах'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
