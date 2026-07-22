'use client';
import { POS_ABBR_MN } from './constants';

// "Урьдчилсан харах" — цэвэр render, newWord-ийг харуулна, төлөв өөрчлөхгүй.
export default function PreviewCard({ newWord, onPlayAudio, onToggleStar }) {
  const hasContent = newWord.front || newWord.back;
  return (
    <div className="card" style={{ position: 'sticky', top: 0, background: 'var(--bg-alt)' }}>
      <h3 style={{ fontWeight: 900, fontSize: 13, color: 'var(--muted)', marginBottom: 14, letterSpacing: 0.3 }}>👁️ Урьдчилсан харах</h3>

      {!hasContent ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--muted)', fontSize: 13 }}>
          Үгээ бичихэд эндээ харагдана
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{newWord.front}</span>
            {newWord.audioUrl && (
              <button type="button" onClick={onPlayAudio} style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--purple)', cursor: 'pointer',
              }}>🔊</button>
            )}
            <button type="button" onClick={onToggleStar} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
              color: newWord.starred ? '#F59E0B' : 'var(--border)', marginLeft: 'auto',
            }}>
              {newWord.starred ? '⭐' : '☆'}
            </button>
          </div>
          {newWord.hint && <div style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700, marginBottom: 8 }}>{newWord.hint}</div>}
          {newWord.pos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
              {newWord.pos.map(p => <span key={p} className="tag tag-purple">{POS_ABBR_MN[p] || p}</span>)}
            </div>
          )}

          {newWord.back && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 3 }}>ОРЧУУЛГА</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{newWord.back}</div>
            </div>
          )}

          {newWord.example && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1.5px solid var(--border)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 3 }}>ЖИШЭЭ ӨГҮҮЛБЭР</div>
              <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>{newWord.example}</div>
              {newWord.exampleMeaning && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{newWord.exampleMeaning}</div>}
            </div>
          )}

          {newWord.level && (
            <div style={{ marginTop: 12 }}>
              <span className="tag tag-purple">{newWord.level}</span>
            </div>
          )}

          {newWord.tags.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1.5px solid var(--border)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 6 }}>ТАГ (TAGS)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {newWord.tags.map(t => (
                  <span key={t} style={{ background: 'var(--purple-light)', color: 'var(--purple)', borderRadius: 100, padding: '3px 10px', fontSize: 11.5, fontWeight: 700 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
