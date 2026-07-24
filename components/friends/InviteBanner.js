'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

// ?ref=<userId> холбоосоор ирсэн үед харагдана. useSearchParams() ашигладаг тул
// эцэг компонент (friends/page.js) үүнийг Suspense-ээр ороосон байх ЁСТОЙ
// (Next.js prerender үед үгүй бол build алдаа өгнө — /pricing-д олдсон адил асуудал).
export default function InviteBanner({ myId }) {
  const searchParams = useSearchParams();
  const refId = searchParams.get('ref');
  const [inviter, setInviter] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!refId || refId === myId) return;
    api.get(`/api/friends/user/${refId}`).then(r => setInviter(r.data)).catch(() => {});
  }, [refId, myId]);

  if (!refId || refId === myId || !inviter) return null;

  async function accept() {
    try {
      await api.post('/api/friends/request', { toUserId: refId });
      setSent(true);
    } catch (e) {
      alert(e.response?.data?.error || 'Хүсэлт илгээхэд алдаа гарлаа');
    }
  }

  return (
    <div style={{
      margin: '0 0 16px', padding: '14px 18px', borderRadius: 14, background: 'var(--purple-light)',
      border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 22 }}>🤝</span>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
        <b>{inviter.username}</b> таныг найзаараа урьж байна!
      </span>
      {sent ? (
        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--green)' }}>Хүсэлт илгээгдлээ ✓</span>
      ) : (
        <button className="btn btn-purple" onClick={accept} style={{ padding: '8px 16px', fontSize: 12.5 }}>+ Найз нэмэх</button>
      )}
    </div>
  );
}
