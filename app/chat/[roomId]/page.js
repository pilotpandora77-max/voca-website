'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import MessageBubble from '@/components/chat/MessageBubble';
import ShareModal from '@/components/chat/ShareModal';
import DuelCard from '@/components/chat/DuelCard';
import ProfilePanel from '@/components/chat/ProfilePanel';
import StudyTogether from '@/components/chat/StudyTogether';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ChatRoomPage() {
  const { user, loading: authLoad, refreshUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId;
  const isDm = roomId?.startsWith('dm_');
  const otherId = isDm ? roomId.slice(3).split('_').find(id => id !== user?.id) : null;

  const [friend, setFriend] = useState(null);
  const [groupTitle, setGroupTitle] = useState(null);
  const [online, setOnline] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [lockedError, setLockedError] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [studyInvite, setStudyInvite] = useState(null);
  const [partnerProgress, setPartnerProgress] = useState(null);
  const socketRef = useRef(null);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => { if (!authLoad && !user) router.push('/login'); }, [authLoad, user]);

  useEffect(() => {
    if (!user || !roomId) return;
    if (isDm && otherId) {
      api.get(`/api/friends/user/${otherId}`).then(r => setFriend(r.data)).catch(() => {});
    } else if (roomId.startsWith('group_')) {
      const gid = roomId.slice(6);
      api.get('/api/groups').then(r => setGroupTitle(r.data.find(g => g.id === gid)?.name || 'Групп')).catch(() => {});
    }
  }, [user, roomId]);

  useEffect(() => {
    if (!isDm || !otherId) return;
    function checkPresence() { api.get(`/api/chat/presence?ids=${otherId}`).then(r => setOnline(!!r.data[otherId])).catch(() => {}); }
    checkPresence();
    const t = setInterval(checkPresence, 15000);
    return () => clearInterval(t);
  }, [isDm, otherId]);

  useEffect(() => {
    if (!user || !roomId) return;
    loadMessages();
    const socket = io(BASE, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join-room', roomId);
    socket.emit('identify', { userId: user.id });
    socket.on('new-message', msg => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      scrollEnd();
      if (msg.userId !== user.id) markRead();
    });
    socket.on('typing', ({ userId: uid, username }) => { if (uid !== user.id) setTypingUser(username); });
    socket.on('stop-typing', ({ userId: uid }) => { if (uid !== user.id) setTypingUser(null); });
    socket.on('study-invite', payload => { if (payload.fromId !== user.id) setStudyInvite(payload); });
    socket.on('study-progress', payload => { if (payload.userId !== user.id) setPartnerProgress(payload); });
    socket.on('messages-read', ({ readerId }) => {
      if (readerId === user.id) return;
      setMessages(prev => prev.map(m => (m.userId === user.id && !(m.readBy || []).includes(readerId))
        ? { ...m, readBy: [...(m.readBy || []), readerId] } : m));
    });
    return () => socket.disconnect();
  }, [user, roomId]);

  function scrollEnd() { setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 60); }

  async function markRead() {
    if (!isDm) return;
    try { await api.post(`/api/chat/${roomId}/read`); } catch {}
  }

  async function loadMessages() {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/chat/${roomId}`);
      setMessages(data);
      setLockedError('');
      setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 100);
      markRead();
    } catch (e) {
      if (e.response?.status === 403) setLockedError(e.response?.data?.error || 'Энэ боломж таны багцад байхгүй байна');
    }
    setLoading(false);
  }

  function handleTextChange(v) {
    setText(v);
    socketRef.current?.emit('typing', { roomId, userId: user.id, username: user.username });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socketRef.current?.emit('stop-typing', { roomId, userId: user.id }), 1500);
  }

  async function sendPayload(body) {
    const tempId = `tmp_${Date.now()}`;
    const optimistic = { id: tempId, userId: user.id, username: user.username, createdAt: new Date().toISOString(), status: 'sending', reactions: {}, readBy: [], ...body };
    setMessages(prev => [...prev, optimistic]);
    scrollEnd();
    try {
      const { data } = await api.post(`/api/chat/${roomId}`, body);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data, status: 'sent' } : m));
      socketRef.current?.emit('send-message', { roomId, message: data });
    } catch {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
    }
  }

  async function send() {
    const t = text.trim();
    if (!t) return;
    setText('');
    clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit('stop-typing', { roomId, userId: user.id });
    const replyTo = replyTarget ? { id: replyTarget.id, username: replyTarget.username, text: replyTarget.text, type: replyTarget.type } : undefined;
    setReplyTarget(null);
    await sendPayload({ type: 'text', text: t, replyTo });
  }

  async function react(messageId, emoji) {
    try {
      const { data } = await api.post(`/api/chat/${roomId}/react`, { messageId, emoji });
      setMessages(prev => prev.map(m => m.id === messageId ? data : m));
    } catch {}
  }

  async function pin(messageId, pinVal) {
    try {
      const { data } = await api.post(`/api/chat/${roomId}/pin`, { messageId, pin: pinVal });
      setMessages(prev => prev.map(m => (m.id === data.id ? data : (pinVal ? { ...m, pinned: false } : m))));
    } catch {}
  }

  async function report(messageId) {
    const reason = window.prompt('Энэ мессежийг ямар шалтгаанаар мэдэгдэж байна?');
    if (reason == null) return;
    try { await api.post(`/api/chat/${roomId}/report`, { messageId, reason }); alert('Мэдэгдэл илгээгдлээ'); } catch {}
  }

  async function saveWord(messageId) {
    try { await api.post(`/api/chat/${roomId}/save-word`, { messageId }); alert('Үг хадгалагдлаа!'); }
    catch (e) { alert(e.response?.data?.error || 'Алдаа гарлаа'); }
  }
  async function saveDeck(messageId) {
    try {
      const { data } = await api.post(`/api/chat/${roomId}/save-deck`, { messageId });
      alert(`${data.addedCount} үг хадгалагдлаа!`);
    } catch (e) { alert(e.response?.data?.error || 'Алдаа гарлаа'); }
  }

  async function toggleMute() {
    try {
      await api.post(`/api/chat/${roomId}/${user.mutedRooms?.includes(roomId) ? 'unmute' : 'mute'}`);
      await refreshUser();
    } catch {}
  }

  async function blockUser() {
    if (!otherId || !window.confirm('Энэ хэрэглэгчийг блоклох үү? Та хоёулаа найз/дагалт харилцаагаа алдана.')) return;
    try { await api.post('/api/friends/block', { userId: otherId }); router.push('/friends'); } catch {}
  }

  async function startChallenge() {
    try {
      const { data } = await api.post(`/api/chat/${roomId}/challenge`);
      setMessages(prev => [...prev, data.message]);
      socketRef.current?.emit('send-message', { roomId, message: data.message });
      scrollEnd();
    } catch (e) { alert(e.response?.data?.error || 'Дуэль эхлүүлэхэд алдаа гарлаа'); }
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>
  );
  if (!user) return null;

  const title = isDm ? (friend?.username || 'Чат') : (groupTitle || 'Групп');
  const avatarEmoji = isDm ? (friend?.avatarEmoji || friend?.username?.[0]?.toUpperCase() || '💬') : '👥';
  const pinnedMsg = messages.find(m => m.pinned);
  const lastMineId = [...messages].reverse().find(m => m.userId === user.id)?.id;
  const isMuted = !!user.mutedRooms?.includes(roomId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderBottom: '1.5px solid var(--border)' }}>
        <button onClick={() => router.push('/chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-sub)' }}>←</button>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
            {avatarEmoji}
          </div>
          {isDm && online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 15.5, color: 'var(--text)' }}>{title}</div>
          <div style={{ fontSize: 11.5, color: typingUser ? 'var(--purple)' : 'var(--muted)', fontWeight: 700 }}>
            {typingUser ? `${typingUser} бичиж байна...` : isDm ? (online ? 'Онлайн' : '') : ''}
          </div>
        </div>
        {isDm && otherId && (
          <button onClick={() => setPanelOpen(true)} title="Профайл" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 19, color: 'var(--text-sub)' }}>ℹ️</button>
        )}
      </div>

      {pinnedMsg && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '8px 28px', background: 'var(--purple-light)', fontSize: 12.5, fontWeight: 700, color: 'var(--purple)' }}>
          <span>📌 {pinnedMsg.type === 'text' ? pinnedMsg.text : 'Наасан мессеж'}</span>
          <button onClick={() => pin(pinnedMsg.id, false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple)', fontSize: 14 }}>×</button>
        </div>
      )}

      {lockedError ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 30 }}>
          <div style={{ fontSize: 42 }}>🔒</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', textAlign: 'center' }}>{lockedError}</div>
          <button className="btn btn-purple" onClick={() => router.push('/pricing')}>✨ Багц авах</button>
        </div>
      ) : (
        <>
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600, marginTop: 40 }}>💬 Эхний мессежээ бичээрэй!</div>
            )}
            {messages.map(m => {
              const mine = m.userId === user.id;
              if (m.type === 'duel') {
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <DuelCard message={m} userId={user.id} mine={mine} />
                  </div>
                );
              }
              return (
                <MessageBubble
                  key={m.id} m={m} mine={mine}
                  showReadReceipt={isDm && mine && m.id === lastMineId}
                  read={isDm && (m.readBy || []).includes(otherId)}
                  onReply={setReplyTarget} onPin={pin} onReact={react} onReport={report}
                  onSaveWord={saveWord} onSaveDeck={saveDeck}
                />
              );
            })}
          </div>

          {isDm && (
            <StudyTogether
              invite={studyInvite}
              onDismissInvite={() => setStudyInvite(null)}
              partnerProgress={partnerProgress}
              onInviteEmit={() => socketRef.current?.emit('study-invite', { roomId, fromId: user.id, fromUsername: user.username })}
              onProgress={(index, total) => socketRef.current?.emit('study-progress', { roomId, userId: user.id, username: user.username, index, total })}
            />
          )}

          {replyTarget && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '8px 28px', background: 'var(--bg-alt)', fontSize: 12.5 }}>
              <span style={{ color: 'var(--text-sub)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                ↩ {replyTarget.username}: {replyTarget.type === 'text' ? replyTarget.text : 'Мессеж'}
              </span>
              <button onClick={() => setReplyTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>×</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, padding: '14px 28px', borderTop: '1.5px solid var(--border)', alignItems: 'center' }}>
            <button title="Үг/Багц хуваалцах" onClick={() => setShareOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>📖</button>
            {isDm && (
              <button title="Дуэлд урих" onClick={startChallenge} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>⚔️</button>
            )}
            <input value={text} onChange={e => handleTextChange(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Мессеж бичих..." style={{
                flex: 1, border: '1.5px solid var(--border)', borderRadius: 14, padding: '11px 16px',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }} />
            <button onClick={send} disabled={!text.trim()} className="btn btn-purple" style={{ padding: '10px 20px' }}>Илгээх</button>
          </div>
        </>
      )}

      {shareOpen && (
        <ShareModal
          onClose={() => setShareOpen(false)}
          onSendWord={payload => sendPayload({ type: 'word', payload })}
          onSendDeck={payload => sendPayload({ type: 'deck', payload })}
        />
      )}
      {panelOpen && isDm && otherId && (
        <ProfilePanel
          otherId={otherId} messages={messages} muted={isMuted}
          onToggleMute={toggleMute} onBlock={blockUser} onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
