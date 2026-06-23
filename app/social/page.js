'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const CHANNELS = [
  { id: 'general',   icon: '#', label: 'general',          unread: 3 },
  { id: 'study',     icon: '#', label: 'суралцах-хэсэг',   unread: 0 },
  { id: 'vocab',     icon: '#', label: 'үг-санал-болгох',  unread: 1 },
  { id: 'grammar',   icon: '#', label: 'дүрэм-асуулт',     unread: 0 },
  { id: 'culture',   icon: '#', label: 'хятад-соёл',       unread: 0 },
  { id: 'voice1',    icon: '🔊', label: 'Яриа дасгал 1',   unread: 0, voice: true },
  { id: 'voice2',    icon: '🔊', label: 'Яриа дасгал 2',   unread: 0, voice: true },
];

const DEMO_MSGS = [
  { id: 1, user: 'Болд',    avatar: '🐻', color: '#7C3AED', time: '10:23', text: '你好 хэрхэн гарна вэ? Цэнхэр байгаа л даа', reactions: [{ emoji: '😂', count: 3 }, { emoji: '👍', count: 2 }] },
  { id: 2, user: 'Сарнай',  avatar: '🌸', color: '#EF4444', time: '10:24', text: 'nǐ hǎo гэж унших, 2-р өнгөний аялга! Ийм байна: nǐ', reactions: [{ emoji: '🙏', count: 5 }] },
  { id: 3, user: 'Ганбаяр', avatar: '🦊', color: '#F59E0B', time: '10:26', text: 'Манай бүлэгт нэгдэх үү? Өдөр бүр дасгал хийдэг 🎯', card: { type: 'group', title: 'HSK 1 бүлэг', desc: '15 гишүүн · Өдөр бүр 19:00', action: 'Нэгдэх' } },
  { id: 4, user: 'Мөнхзул', avatar: '⭐', color: '#10B981', time: '10:28', text: '学 тэмдэгтийн зурааслалыг дараах байдлаар хийнэ:', reactions: [{ emoji: '❤️', count: 7 }, { emoji: '👏', count: 4 }] },
  { id: 5, user: 'Болд',    avatar: '🐻', color: '#7C3AED', time: '10:30', text: 'Баярлалаа хүн бүр! 谢谢大家 🙏', reactions: [{ emoji: '🥰', count: 6 }] },
];

const ACTIVE_USERS = [
  { name: 'Болд',    avatar: '🐻', color: '#7C3AED', status: 'online',  activity: 'Flashcard давтаж байна' },
  { name: 'Сарнай',  avatar: '🌸', color: '#EF4444', status: 'online',  activity: 'Толь бичиг ашиглаж байна' },
  { name: 'Ганбаяр', avatar: '🦊', color: '#F59E0B', status: 'online',  activity: 'Тест хийж байна' },
  { name: 'Мөнхзул', avatar: '⭐', color: '#10B981', status: 'away',    activity: 'Ханз бичиж байна' },
  { name: 'Дорж',    avatar: '🦁', color: '#3B82F6', status: 'online',  activity: 'Reel үзэж байна' },
  { name: 'Оюунаа',  avatar: '🌺', color: '#8B5CF6', status: 'away',    activity: '5 минутын өмнө идэвхтэй байсан' },
];

const TOP_ACTIVE = [
  { rank: 1, name: 'Сарнай',  avatar: '🌸', color: '#EF4444', xp: 1240, badge: '🥇' },
  { rank: 2, name: 'Ганбаяр', avatar: '🦊', color: '#F59E0B', xp: 1105, badge: '🥈' },
  { rank: 3, name: 'Мөнхзул', avatar: '⭐', color: '#10B981', xp: 980,  badge: '🥉' },
];

function StatusCircle({ status }) {
  return (
    <span style={{
      position: 'absolute', bottom: 0, right: 0,
      width: 10, height: 10, borderRadius: '50%',
      background: status === 'online' ? '#10B981' : '#F59E0B',
      border: '2px solid #fff',
    }} />
  );
}

export default function SocialPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [channel, setChannel] = useState('general');
  const [msgs, setMsgs]       = useState(DEMO_MSGS);
  const [input, setInput]     = useState('');
  const [sending, setSend]    = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  function sendMsg(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    const newMsg = {
      id: Date.now(), user: user?.username || 'Та', avatar: user?.avatarEmoji || '😊',
      color: '#7C3AED', time: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }),
      text, reactions: [],
    };
    setMsgs(m => [...m, newMsg]);
    setInput('');
  }

  function addReact(msgId, emoji) {
    setMsgs(m => m.map(msg => {
      if (msg.id !== msgId) return msg;
      const reactions = [...(msg.reactions || [])];
      const idx = reactions.findIndex(r => r.emoji === emoji);
      if (idx >= 0) reactions[idx] = { ...reactions[idx], count: reactions[idx].count + 1 };
      else reactions.push({ emoji, count: 1 });
      return { ...msg, reactions };
    }));
  }

  if (authLoad) return null;

  const currentCh = CHANNELS.find(c => c.id === channel);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Left: channel list */}
      <div style={{
        width: 220, background: '#fff', borderRight: '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto',
      }}>
        {/* Server header */}
        <div style={{
          padding: '16px 14px', borderBottom: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          }}>V</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 13, color: 'var(--text)', lineHeight: 1.2 }}>VOCA Community</div>
            <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>● 128 идэвхтэй</div>
          </div>
        </div>

        {/* Text channels */}
        <div style={{ padding: '10px 8px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: 1, padding: '6px 8px', marginBottom: 2 }}>ХЭЛНИЙ СУВГУУД</div>
          {CHANNELS.filter(c => !c.voice).map(ch => (
            <div key={ch.id} onClick={() => setChannel(ch.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8,
              cursor: 'pointer', transition: 'all 0.12s', marginBottom: 1,
              background: channel === ch.id ? 'var(--purple-light)' : 'transparent',
              color: channel === ch.id ? 'var(--purple)' : 'var(--text-sub)',
            }}
            onMouseEnter={e => { if (channel !== ch.id) e.currentTarget.style.background = 'var(--bg-alt)'; }}
            onMouseLeave={e => { if (channel !== ch.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 14, opacity: 0.7, fontWeight: 700 }}>{ch.icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: channel === ch.id ? 800 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.label}</span>
              {ch.unread > 0 && (
                <span style={{
                  background: 'var(--purple)', color: '#fff', fontSize: 10, fontWeight: 800,
                  borderRadius: 100, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                }}>{ch.unread}</span>
              )}
            </div>
          ))}
        </div>

        {/* Voice channels */}
        <div style={{ padding: '0 8px 10px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: 1, padding: '6px 8px', marginBottom: 2 }}>ДУУТ СУВГУУД</div>
          {CHANNELS.filter(c => c.voice).map(ch => (
            <div key={ch.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8,
              cursor: 'pointer', color: 'var(--text-sub)', transition: 'all 0.12s', marginBottom: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-sub)'; }}
            >
              <span style={{ fontSize: 14 }}>{ch.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{ch.label}</span>
            </div>
          ))}
        </div>

        {/* My profile */}
        {user && (
          <div style={{
            marginTop: 'auto', padding: '10px 12px', borderTop: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-light)',
                border: '2px solid var(--purple-mid)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16,
              }}>{user.avatarEmoji || user.username?.[0]?.toUpperCase()}</div>
              <StatusCircle status="online" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
              <div style={{ fontSize: 10, color: '#10B981', fontWeight: 600 }}>● Онлайн</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--muted)' }}>⚙️</button>
          </div>
        )}
      </div>

      {/* Center: chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chat header */}
        <div style={{
          height: 56, borderBottom: '1.5px solid var(--border)', background: '#fff',
          display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--muted)' }}>#</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{currentCh?.label}</span>
          <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 8px' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Хятад хэл сурагчдын нийтлэлийн суваг</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {['🔔', '📌', '🔍'].map(icon => (
              <button key={icon} style={{
                width: 32, height: 32, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >{icon}</button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Welcome banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 100%)',
            borderRadius: 18, padding: '20px 22px', marginBottom: 16, color: '#fff',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>#{currentCh?.label} дотор тавтай морил!</div>
            <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
              Энэ бол voca нийгэмлэгийн суваг. Хятад хэлний асуулт, дасгал, санаа бодлоо хуваалцаарай.
            </div>
          </div>

          {msgs.map((msg, i) => {
            const showAvatar = i === 0 || msgs[i - 1].user !== msg.user;
            return (
              <div key={msg.id} style={{ display: 'flex', gap: 10, padding: '3px 4px', borderRadius: 8, transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar col */}
                <div style={{ width: 36, flexShrink: 0, paddingTop: showAvatar ? 2 : 0, display: 'flex', alignItems: 'flex-start' }}>
                  {showAvatar ? (
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: `${msg.color}22`,
                      border: `2px solid ${msg.color}44`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 18, flexShrink: 0,
                    }}>{msg.avatar}</div>
                  ) : (
                    <span style={{ fontSize: 10, color: 'var(--muted)', opacity: 0, paddingTop: 4, paddingLeft: 4, userSelect: 'none' }}>{msg.time}</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {showAvatar && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: msg.color }}>{msg.user}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{msg.time}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>{msg.text}</div>

                  {/* Group invite card */}
                  {msg.card && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 8, padding: '12px 14px',
                      background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, maxWidth: 300,
                    }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📚</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{msg.card.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{msg.card.desc}</div>
                      </div>
                      <button className="btn btn-purple" style={{ fontSize: 11, padding: '6px 12px' }}>{msg.card.action}</button>
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                      {msg.reactions.map((r, ri) => (
                        <button key={ri} onClick={() => addReact(msg.id, r.emoji)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)',
                          borderRadius: 100, padding: '3px 8px', cursor: 'pointer', transition: 'all 0.12s',
                          fontSize: 13, fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--purple)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--purple-light)'; e.currentTarget.style.color = 'inherit'; }}
                        >
                          {r.emoji} <span style={{ fontSize: 11, fontWeight: 700 }}>{r.count}</span>
                        </button>
                      ))}
                      <button onClick={() => addReact(msg.id, '👍')} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'transparent', border: '1.5px dashed var(--border)',
                        borderRadius: 100, padding: '3px 8px', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', fontFamily: 'inherit',
                      }}>+ 😊</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Message input */}
        <div style={{ padding: '12px 18px 16px', background: '#fff', borderTop: '1.5px solid var(--border)', flexShrink: 0 }}>
          <form onSubmit={sendMsg} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="button" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-alt)', border: '1.5px solid var(--border)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                placeholder={`#${currentCh?.label} дотор мессеж бичих...`}
                style={{ paddingRight: 90, background: 'var(--bg-alt)' }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              />
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
                {['😊', '🎯', '🔊'].map(ic => (
                  <button key={ic} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, opacity: 0.6, padding: 0, lineHeight: 1 }}>{ic}</button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-purple" style={{ flexShrink: 0, padding: '10px 16px', fontSize: 13 }} disabled={!input.trim()}>
              ➤
            </button>
          </form>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{
        width: 240, background: '#fff', borderLeft: '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto',
      }}>
        {/* Active count */}
        <div style={{ padding: '14px 14px 8px', borderBottom: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text)' }}>Идэвхтэй одоо</span>
            <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 16, color: '#10B981' }}>128</span>
          </div>
        </div>

        {/* Online users */}
        <div style={{ padding: '8px 10px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: 1, padding: '4px 6px', marginBottom: 4 }}>ОНЛАЙН — {ACTIVE_USERS.filter(u => u.status === 'online').length}</div>
          {ACTIVE_USERS.map((u, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
              borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s', marginBottom: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: `${u.color}22`,
                  border: `2px solid ${u.color}44`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 15,
                }}>{u.avatar}</div>
                <StatusCircle status={u.status} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.activity}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Today's activity */}
        <div style={{ margin: '4px 10px 0', padding: '12px', background: 'var(--bg-alt)', borderRadius: 12, border: '1.5px solid var(--border)' }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: 'var(--text)', marginBottom: 10 }}>📊 Өнөөдрийн үйл ажиллагаа</div>
          {[
            { label: 'Нийт мессеж', value: 342, color: 'var(--purple)' },
            { label: 'Идэвхтэй гишүүд', value: 128, color: '#10B981' },
            { label: 'Шинэ гишүүд', value: 12, color: '#3B82F6' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Top active */}
        <div style={{ margin: '10px 10px 0', padding: '12px', background: 'var(--bg-alt)', borderRadius: 12, border: '1.5px solid var(--border)' }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: 'var(--text)', marginBottom: 10 }}>🏆 Топ идэвхтэй гишүүд</div>
          {TOP_ACTIVE.map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{u.badge}</span>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${u.color}22`, border: `2px solid ${u.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{u.avatar}</div>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{u.name}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple)' }}>{u.xp} XP</span>
            </div>
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
