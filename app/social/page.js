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
    socket.on('new-message', msg => setMessages(prev => [...prev, msg]));
    return () => socket.disconnect();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const [f, g] = await Promise.all([api.get('/api/friends'), api.get('/api/groups')]);
      setFriends(f.data);
      setGroups(g.data);
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
      roomId: activeRoom, userId: user.id,
      username: user.username, text: msgText.trim(),
      createdAt: new Date().toISOString(),
    };
    socketRef.current?.emit('send-message', { roomId: activeRoom, message: msg });
    setMessages(prev => [...prev, msg]);
    try { api.post(`/api/chat/${activeRoom}`, msg); } catch {}
    setMsgText('');
  }

  if (authLoad || loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="spinner" />
    </div>
  );

  const TABS = [
    { key: 'chat',    icon: '💬', label: 'Чат' },
    { key: 'friends', icon: '👫', label: 'Найзууд' },
    { key: 'groups',  icon: '🏘', label: 'Групп' },
  ];

  return (
    <div style={{ padding: '28px 28px 40px', maxWidth: 920, margin: '0 auto' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.5, marginBottom: 6 }}>Нийгэм</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Найзуудтайгаа хичээллэцгээе</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '9px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13.5,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            background: tab === t.key ? 'rgba(155,109,255,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${tab === t.key ? 'rgba(155,109,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: tab === t.key ? '#C4AAFF' : 'var(--muted)',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Chat */}
      {tab === 'chat' && (
        <div style={{ display: 'flex', gap: 16, height: 520 }}>
          {/* Room list */}
          <div style={{
            width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6,
            overflowY: 'auto',
          }}>
            {groups.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>
                Группд нэгдэж чат хийнэ үү
              </p>
            ) : groups.map(g => (
              <button key={g.id} onClick={() => joinRoom(g.id)} style={{
                padding: '12px 14px', borderRadius: 14, fontWeight: 700, fontSize: 14,
                border: `1px solid ${activeRoom === g.id ? 'rgba(155,109,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
                background: activeRoom === g.id ? 'rgba(155,109,255,0.15)' : 'rgba(255,255,255,0.03)',
                color: activeRoom === g.id ? '#C4AAFF' : 'var(--text-sub)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit',
              }}>
                🏘 {g.name}
              </button>
            ))}
          </div>

          {/* Chat window */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden',
            background: 'var(--bg-card)',
          }}>
            {!activeRoom ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ fontSize: 40, opacity: 0.3 }}>💬</div>
                <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>Группийн чатыг сонгоно уу</p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.map(m => {
                    const isMe = m.userId === user.id;
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                        {!isMe && (
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', fontSize: 16,
                            background: 'rgba(155,109,255,0.15)', border: '1px solid rgba(155,109,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {m.username?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div style={{ maxWidth: '70%' }}>
                          {!isMe && (
                            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 4, marginLeft: 4 }}>
                              {m.username}
                            </div>
                          )}
                          <div style={{
                            padding: '10px 14px', borderRadius: 16,
                            background: isMe ? 'linear-gradient(135deg, #9B6DFF, #7B4FE0)' : 'rgba(255,255,255,0.05)',
                            color: '#EDE9FF',
                            borderBottomRightRadius: isMe ? 4 : 16,
                            borderBottomLeftRadius: isMe ? 16 : 4,
                            border: isMe ? 'none' : '1px solid rgba(255,255,255,0.07)',
                            boxShadow: isMe ? '0 4px 16px rgba(155,109,255,0.3)' : 'none',
                          }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{m.text}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div style={{
                  padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', gap: 10, background: 'rgba(255,255,255,0.02)',
                }}>
                  <input type="text" value={msgText} onChange={e => setMsgText(e.target.value)}
                    placeholder="Мессеж бичих..."
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    style={{ flex: 1 }} />
                  <button className="btn btn-purple" onClick={sendMessage} style={{ padding: '10px 18px' }}>
                    ➤
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Friends */}
      {tab === 'friends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FriendSearch user={user} onUpdate={load} />
          <h3 style={{ fontWeight: 800, fontSize: 15, color: '#EDE9FF' }}>
            Найзуудын жагсаалт ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>👥</div>
              <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>Одоогоор найз байхгүй байна</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {friends.map(f => (
                <div key={f.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', fontSize: 22,
                    background: 'rgba(155,109,255,0.12)', border: '1px solid rgba(155,109,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {f.avatarEmoji || f.username?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#EDE9FF' }}>{f.username}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                      🔥 {f.streak} өдөр streak
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Groups */}
      {tab === 'groups' && (
        <GroupsTab groups={groups} user={user} onUpdate={load} />
      )}
    </div>
  );
}

function FriendSearch({ user, onUpdate }) {
  const [q, setQ]   = useState('');
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
      <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: 14, color: '#EDE9FF' }}>Найз нэмэх</h3>
      <form onSubmit={search} style={{ display: 'flex', gap: 10 }}>
        <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Хэрэглэгч хайх..." style={{ flex: 1 }} />
        <button type="submit" className="btn btn-purple" disabled={loading} style={{ padding: '11px 20px', fontSize: 13 }}>
          Хайх
        </button>
      </form>
      {res.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {res.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
              <span style={{ fontSize: 22 }}>{u.avatarEmoji || u.username?.[0]}</span>
              <span style={{ fontWeight: 700, flex: 1, color: '#EDE9FF', fontSize: 14 }}>{u.username}</span>
              <button className="btn btn-green" onClick={() => addFriend(u.id)} style={{ padding: '7px 16px', fontSize: 13 }}>
                + Нэмэх
              </button>
            </div>
          ))}
        </div>
      )}
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
        <button className="btn btn-purple" onClick={() => setSF(s => !s)} style={{ fontSize: 13, padding: '10px 18px' }}>
          {showForm ? '✕ Болих' : '+ Групп үүсгэх'}
        </button>
      </div>
      {showForm && (
        <div className="card anim-scale" style={{ marginBottom: 16, border: '1px solid rgba(155,109,255,0.2)' }}>
          <form onSubmit={createGroup} style={{ display: 'flex', gap: 10 }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Группийн нэр" style={{ flex: 1 }} />
            <button type="submit" className="btn btn-green" disabled={creating} style={{ padding: '11px 20px', fontSize: 14 }}>
              {creating ? '...' : 'Үүсгэх'}
            </button>
          </form>
        </div>
      )}
      {groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>🏘</div>
          <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>Групп байхгүй байна</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {groups.map(g => {
            const isMember = g.members?.includes(user.id);
            return (
              <div key={g.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, fontSize: 20,
                  background: 'rgba(155,109,255,0.1)', border: '1px solid rgba(155,109,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  🏘
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#EDE9FF' }}>{g.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                    {g.members?.length || 0} гишүүн
                  </div>
                </div>
                {isMember ? (
                  <span style={{
                    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
                    color: '#22C55E', borderRadius: 100, padding: '5px 12px', fontSize: 12, fontWeight: 800,
                  }}>
                    ✓ Гишүүн
                  </span>
                ) : (
                  <button className="btn btn-blue" onClick={() => joinGroup(g.id)} style={{ padding: '8px 16px', fontSize: 13 }}>
                    Нэгдэх
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
