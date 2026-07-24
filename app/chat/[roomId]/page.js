'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoomPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId;

  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [lockedError, setLockedError] = useState('');
  const socketRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { if (!authLoad && !user) router.push('/login'); }, [authLoad, user]);

  // dm_<a>_<b>-с найзын ID-г гаргаж, нэрийг нь бэлэн /api/friends/user/:id-ээс авна
  // (title дамжуулах useSearchParams-ыг Suspense шаардлагаас зайлсхийхийн тулд).
  useEffect(() => {
    if (!user || !roomId?.startsWith('dm_')) return;
    const otherId = roomId.slice(3).split('_').find(id => id !== user.id);
    if (otherId) api.get(`/api/friends/user/${otherId}`).then(r => setFriend(r.data)).catch(() => {});
  }, [user, roomId]);

  useEffect(() => {
    if (!user || !roomId) return;
    loadMessages();
    const socket = io(BASE, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join-room', roomId);
    socket.on('new-message', msg => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      scrollEnd();
    });
    return () => socket.disconnect();
  }, [user, roomId]);

  function scrollEnd() { setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 60); }

  async function loadMessages() {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/chat/${roomId}`);
      setMessages(data);
      setLockedError('');
      setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 100);
    } catch (e) {
      if (e.response?.status === 403) setLockedError(e.response?.data?.error || 'Энэ боломж таны багцад байхгүй байна');
    }
    setLoading(false);
  }

  async function send() {
    const t = text.trim();
    if (!t) return;
    setText('');
    const tempId = `tmp_${Date.now()}`;
    const optimistic = { id: tempId, userId: user.id, username: user.username, type: 'text', text: t, createdAt: new Date().toISOString(), status: 'sending' };
    setMessages(prev => [...prev, optimistic]);
    scrollEnd();
    try {
      const { data } = await api.post(`/api/chat/${roomId}`, { type: 'text', text: t });
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data, status: 'sent' } : m));
      socketRef.current?.emit('send-message', { roomId, message: data });
    } catch {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
    }
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );
  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderBottom: '1.5px solid var(--border)' }}>
        <button onClick={() => router.push('/friends')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-sub)' }}>←</button>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
          {friend?.avatarEmoji || friend?.username?.[0]?.toUpperCase() || '💬'}
        </div>
        <div style={{ fontWeight: 900, fontSize: 15.5, color: 'var(--text)' }}>{friend?.username || 'Чат'}</div>
      </div>

      {lockedError ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 30 }}>
          <div style={{ fontSize: 42 }}>🔒</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', textAlign: 'center' }}>{lockedError}</div>
          <button className="btn btn-purple" onClick={() => router.push('/pricing')}>✨ Багц авах</button>
        </div>
      ) : (
        <>
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600, marginTop: 40 }}>💬 Эхний мессежээ бичээрэй!</div>
            )}
            {messages.map(m => {
              const mine = m.userId === user.id;
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '60%', padding: '10px 14px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: mine ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'var(--bg-alt)',
                    color: mine ? '#fff' : 'var(--text)', opacity: m.status === 'sending' ? 0.6 : 1,
                  }}>
                    <div style={{ fontSize: 14, lineHeight: 1.4 }}>{m.text}</div>
                    <div style={{ fontSize: 10, marginTop: 3, opacity: 0.7, textAlign: 'right' }}>
                      {fmtTime(m.createdAt)}{m.status === 'failed' ? ' · илгээгдсэнгүй' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, padding: '14px 28px', borderTop: '1.5px solid var(--border)' }}>
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Мессеж бичих..." style={{
                flex: 1, border: '1.5px solid var(--border)', borderRadius: 14, padding: '11px 16px',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }} />
            <button onClick={send} disabled={!text.trim()} className="btn btn-purple" style={{ padding: '10px 20px' }}>Илгээх</button>
          </div>
        </>
      )}
    </div>
  );
}
