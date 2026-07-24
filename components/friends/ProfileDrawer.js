'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

// Найз хайх/жагсаалтын карт дээр дарахад баруунаас гарч ирэх дэлгэрэнгүй панель.
export default function ProfileDrawer({ userId, onClose, onChanged, onBlock }) {
  const { user: me } = useAuth();
  const router = useRouter();
  const [p, setP] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setP(null);
    api.get(`/api/social/profile/${userId}`).then(r => setP(r.data)).catch(() => {});
  }, [userId]);

  async function sendRequest() {
    setBusy(true);
    try {
      await api.post('/api/friends/request', { toUserId: userId });
      setP(v => ({ ...v, relationship: 'pending_sent' }));
      onChanged?.();
    } catch (e) {
      alert(e.response?.data?.error || 'Хүсэлт илгээхэд алдаа гарлаа');
    }
    setBusy(false);
  }

  async function toggleFollow() {
    setBusy(true);
    try {
      if (p.following) await api.delete(`/api/friends/follow/${userId}`);
      else await api.post('/api/friends/follow', { userId });
      setP(v => ({ ...v, following: !v.following }));
      onChanged?.();
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setBusy(false);
  }

  function openChat() {
    const roomId = 'dm_' + [me.id, userId].sort().join('_');
    router.push(`/chat/${roomId}`);
  }

  if (!userId) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,10,30,0.35)' }} />
      <div style={{
        position: 'relative', width: 360, maxWidth: '92vw', height: '100%', background: '#fff',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.15)', padding: 24, overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted)', float: 'right' }}>×</button>

        {!p ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{
                width: 78, height: 78, borderRadius: '50%', background: 'var(--purple-light)',
                border: '2px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 34, margin: '0 auto 10px',
              }}>
                {p.avatarEmoji || p.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)' }}>{p.username} {p.isPremium ? '👑' : ''}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>Level {p.level} · Нийт #{p.rank}-р байр</div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginVertical: 16, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['⚡', p.xp, 'XP'], ['🔥', p.streak, 'Цуваа'], ['📖', p.wordCount, 'Үг'], ['🤝', p.friendCount, 'Найз']].map(([e, v, l]) => (
                <div key={l} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '8px 10px', textAlign: 'center', minWidth: 62 }}>
                  <div style={{ fontSize: 14 }}>{e}</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: 'var(--text)' }}>{v ?? 0}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)', fontWeight: 700 }}>{l}</div>
                </div>
              ))}
            </div>

            {p.mutualCount > 0 && (
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--purple)', fontWeight: 700, marginBottom: 10 }}>
                🤝 {p.mutualCount} нийтлэг найзтай
              </div>
            )}

            {p.badges?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
                {p.badges.map(b => (
                  <span key={b.id} title={b.desc} style={{ background: 'var(--purple-light)', borderRadius: 100, padding: '4px 10px', fontSize: 11.5, fontWeight: 700, color: 'var(--purple)' }}>
                    {b.emoji} {b.name}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {p.relationship === 'friends' ? (
                <button className="btn btn-purple" onClick={openChat}>💬 Зурвас бичих</button>
              ) : p.relationship === 'pending_sent' ? (
                <button className="btn btn-light" disabled>⏳ Хүсэлт хүлээгдэж байна</button>
              ) : p.relationship === 'pending_received' ? (
                <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, textAlign: 'center', padding: '10px 0' }}>
                  Танд энэ хэрэглэгчээс хүсэлт ирсэн байна — "Хүсэлтүүд" табаас зөвшөөрнө үү.
                </div>
              ) : (
                <button className="btn btn-purple" onClick={sendRequest} disabled={busy}>+ Найз нэмэх</button>
              )}
              <button className="btn btn-ghost" onClick={toggleFollow} disabled={busy}>
                {p.following ? '✓ Дагаж байна' : '+ Дагах'}
              </button>
              {onBlock && (
                <button onClick={() => { onBlock(p); onClose(); }} style={{
                  background: 'none', border: 'none', color: '#EF4444', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
                }}>
                  🚫 Блоклох
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
