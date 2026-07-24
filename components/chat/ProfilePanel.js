'use client';
import { useState, useEffect } from 'react';
import api, { uploadUrl } from '@/lib/api';

export default function ProfilePanel({ otherId, messages, muted, onToggleMute, onBlock, onClose }) {
  const [p, setP] = useState(null);

  useEffect(() => {
    if (!otherId) return;
    api.get(`/api/social/profile/${otherId}`).then(r => setP(r.data)).catch(() => {});
  }, [otherId]);

  const media = messages.filter(m => m.type === 'image' || m.type === 'video' || m.type === 'file');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,10,30,0.35)' }} />
      <div style={{
        position: 'relative', width: 340, maxWidth: '92vw', height: '100%', background: '#fff',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.15)', padding: 22, overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted)', float: 'right' }}>×</button>

        {!p ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{
                width: 74, height: 74, borderRadius: '50%', background: 'var(--purple-light)',
                border: '2px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, margin: '0 auto 10px',
              }}>
                {p.avatarEmoji || p.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)' }}>{p.username} {p.isPremium ? '👑' : ''}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>Level {p.level}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['⚡', p.xp, 'XP'], ['🔥', p.streak, 'Цуваа'], ['📖', p.wordCount, 'Үг']].map(([e, v, l]) => (
                <div key={l} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '8px 10px', textAlign: 'center', minWidth: 62 }}>
                  <div style={{ fontSize: 14 }}>{e}</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: 'var(--text)' }}>{v ?? 0}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)', fontWeight: 700 }}>{l}</div>
                </div>
              ))}
            </div>

            {p.badges?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 16 }}>
                {p.badges.map(b => (
                  <span key={b.id} title={b.desc} style={{ background: 'var(--purple-light)', borderRadius: 100, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, color: 'var(--purple)' }}>
                    {b.emoji} {b.name}
                  </span>
                ))}
              </div>
            )}

            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-sub)', marginBottom: 8 }}>🖼️ Хуваалцсан медиа</div>
              {media.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Медиа алга байна.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {media.map(m => (
                    <a key={m.id} href={uploadUrl(m.mediaUrl)} target="_blank" rel="noopener noreferrer" style={{
                      display: 'block', width: '100%', aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                      background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {m.type === 'image' ? (
                        <img src={uploadUrl(m.mediaUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : m.type === 'video' ? (
                        <span style={{ fontSize: 22 }}>🎥</span>
                      ) : (
                        <span style={{ fontSize: 22 }}>📎</span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 22 }}>
              <button className="btn btn-ghost" onClick={onToggleMute}>{muted ? '🔔 Дуу нээх' : '🔕 Дуугүй болгох'}</button>
              <button onClick={onBlock} style={{
                background: 'none', border: 'none', color: '#EF4444', fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
              }}>
                🚫 Блоклох
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
