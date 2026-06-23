'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { io } from 'socket.io-client';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SocialPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  const [tab, setTab]           = useState('chat');
  const [friends, setFriends]   = useState([]);
  const [groups, setGroups]     = useState([]);
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms]       = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [msgText, setMsgText]   = useState('');
  const [loading, setLoading]   = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) load();
  }, [authLoad, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const socket = io(BASE);
    socketRef.current = socket;
    socket.on('new-message', msg => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const [f, g, r] = await Promise.all([
        api.get('/api/friends'),
        api.get('/api/groups'),
        api.get('/api/chat/rooms').catch(() => ({ data: [] })),
      ]);
      setFriends(f.data);
      setGroups(g.data);
      setRooms(r.data);
    } catch {}
    setLoading(false);
  }

  async function joinRoom(roomId) {
    setActiveRoom(roomId);
    socketRef.current?.emit('join-room', roomId);
    try {
      const { data } = await api.get(`/api/chat/${roomId}`);
      setMessages(data);
    } catch { setMessages([]); }
  }

  function sendMessage() {
    if (!msgText.trim() || !activeRoom) return;
    const msg = {
      id: Date.now().toString(),
      roomId: activeRoom,
      userId: user.id,
      username: user.username,
      text: msgText.trim(),
      createdAt: new Date().toISOString(),
    };
    socketRef.current?.emit('send-message', { roomId: activeRoom, message: msg });
    setMessages(prev => [...prev, msg]);
    try { api.post(`/api/chat/${activeRoom}`, msg); } catch {}
    setMsgText('');
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ fontSize: 40 }}>⏳</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>👥 Нийгэм</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['chat', 'friends', 'groups'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer',
            background: tab === t ? 'var(--green-bg)' : 'var(--bg-alt)',
            border: `2px solid ${tab === t ? 'var(--green)' : 'var(--border)'}`,
            color: tab === t ? 'var(--green)' : 'var(--muted)',
          }}>
            {t === 'chat' ? '💬 Чат' : t === 'friends' ? '👫 Найзууд' : '🏘 Групп'}
          </button>
        ))}
      </div>

      {tab === 'friends' && (
        <div>
          <FriendSearch user={user} friends={friends} onUpdate={load} />
          <h3 style={{ fontWeight: 800, marginBottom: 12, marginTop: 20 }}>Найзуудын жагсаалт ({friends.length})</h3>
          {friends.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
              <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Одоогоор найз байхгүй байна</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {friends.map(f => (
                <div key={f.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 28 }}>{f.avatarEmoji || f.username?.[0]}</span>
                  <div>
                    <div style={{ fontWeight: 800 }}>{f.username}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>🔥 {f.streak} өдөр streak</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'groups' && (
        <GroupsTab groups={groups} user={user} onUpdate={load} />
      )}

      {tab === 'chat' && (
        <div style={{ display: 'flex', gap: 16, height: 500 }}>
          <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
            {groups.map(g => (
              <button key={g.id} onClick={() => joinRoom(g.id)} style={{
                padding: '12px 14px', borderRadius: 14, fontWeight: 800, fontSize: 14,
                border: `2px solid ${activeRoom === g.id ? 'var(--blue)' : 'var(--border)'}`,
                background: activeRoom === g.id ? 'var(--blue-light)' : 'var(--bg-alt)',
                color: activeRoom === g.id ? 'var(--blue)' : 'var(--text)',
                cursor: 'pointer', textAlign: 'left',
              }}>
                🏘 {g.name}
              </button>
            ))}
            {groups.length === 0 && (
              <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 13, padding: '8px 0' }}>
                Группд нэгдэж чат хийнэ үү
              </p>
            )}
          </div>

          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            border: '2px solid var(--border)', borderRadius: 16, overflow: 'hidden',
          }}>
            {!activeRoom ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Группийн чатыг сонгоно уу</p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {messages.map(m => {
                    const isMe = m.userId === user.id;
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '70%', padding: '10px 14px', borderRadius: 16,
                          background: isMe ? 'var(--blue)' : 'var(--bg-alt)',
                          color: isMe ? '#fff' : 'var(--text)',
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 4,
                        }}>
                          {!isMe && <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 4, opacity: 0.7 }}>{m.username}</div>}
                          <div style={{ fontWeight: 600 }}>{m.text}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div style={{ padding: '12px 16px', borderTop: '2px solid var(--border)', display: 'flex', gap: 8 }}>
                  <input type="text" value={msgText} onChange={e => setMsgText(e.target.value)}
                    placeholder="Мессеж бичих..." style={{ flex: 1 }}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                  <button className="btn btn-blue" onClick={sendMessage} style={{ padding: '10px 18px' }}>
                    ➤
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FriendSearch({ user, friends, onUpdate }) {
  const [q, setQ]     = useState('');
  const [res, setRes] = useState([]);
  const [loading, setL] = useState(false);

  async function search(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setL(true);
    try {
      const { data } = await api.get(`/api/friends/search?q=${encodeURIComponent(q)}`);
      setRes(data.filter(u => u.id !== user.id));
    } catch { setRes([]); }
    setL(false);
  }

  async function addFriend(id) {
    try { await api.post(`/api/friends/${id}`); onUpdate(); setRes([]); setQ(''); }
    catch {}
  }

  return (
    <div className="card">
      <h3 style={{ fontWeight: 800, marginBottom: 12 }}>Найз нэмэх</h3>
      <form onSubmit={search} style={{ display: 'flex', gap: 8 }}>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Хэрэглэгч хайх..." />
        <button type="submit" className="btn btn-blue" disabled={loading} style={{ whiteSpace: 'nowrap', padding: '10px 16px' }}>
          Хайх
        </button>
      </form>
      {res.map(u => (
        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: 24 }}>{u.avatarEmoji || u.username?.[0]}</span>
          <span style={{ fontWeight: 700, flex: 1 }}>{u.username}</span>
          <button className="btn btn-green" onClick={() => addFriend(u.id)} style={{ padding: '6px 14px', fontSize: 13 }}>
            + Нэмэх
          </button>
        </div>
      ))}
    </div>
  );
}

function GroupsTab({ groups, user, onUpdate }) {
  const [name, setName]   = useState('');
  const [creating, setC]  = useState(false);
  const [showForm, setSF] = useState(false);

  async function createGroup(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setC(true);
    try { await api.post('/api/groups', { name }); setName(''); setSF(false); onUpdate(); }
    catch {}
    setC(false);
  }

  async function joinGroup(id) {
    try { await api.post(`/api/groups/${id}/join`); onUpdate(); }
    catch {}
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-green" onClick={() => setSF(s => !s)} style={{ padding: '10px 18px', fontSize: 14 }}>
          + Групп үүсгэх
        </button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--green-bg)', borderColor: 'var(--green)' }}>
          <form onSubmit={createGroup} style={{ display: 'flex', gap: 10 }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Группийн нэр" />
            <button type="submit" className="btn btn-green" disabled={creating} style={{ whiteSpace: 'nowrap', padding: '10px 18px' }}>
              {creating ? '...' : 'Үүсгэх'}
            </button>
          </form>
        </div>
      )}
      {groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏘</div>
          <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Групп байхгүй байна</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {groups.map(g => {
            const isMember = g.members?.includes(user.id);
            return (
              <div key={g.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>🏘 {g.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>
                    {g.members?.length || 0} гишүүн
                  </div>
                </div>
                {!isMember && (
                  <button className="btn btn-blue" onClick={() => joinGroup(g.id)} style={{ padding: '8px 16px', fontSize: 13 }}>
                    Нэгдэх
                  </button>
                )}
                {isMember && (
                  <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: 13 }}>✓ Гишүүн</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
