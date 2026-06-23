'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const SUGGESTIONS = [
  '你好 гэдгийн утга юу вэ?',
  'HSK 1 хамгийн чухал 10 үг',
  '我 vs 我的 ялгаа юу вэ?',
  'Дуудлагын 4 аялгыг тайлбарла',
];

export default function AiPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Сайн байна уу! Би voca AI — таны Хятад хэлний туслах багш. Дурын асуулт тавьж болно! 🐼✨' },
  ]);
  const [input, setInput]  = useState('');
  const [sending, setSend] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text) {
    const t = (text || input).trim();
    if (!t || sending) return;

    const userMsg = { role: 'user', content: t };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSend(true);

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role !== 'error')
        .map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/api/ai/chat', { messages: history });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Холболт амжилтгүй. Дахин оролдоно уу.';
      setMessages(prev => [...prev, { role: 'error', content: msg }]);
    }
    setSend(false);
    inputRef.current?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    send();
  }

  if (authLoad) return null;

  const hasOnlyInitial = messages.length === 1;

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      padding: '0', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(13,10,31,0.8)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(155,109,255,0.25), rgba(255,107,157,0.15))',
            border: '1px solid rgba(155,109,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            boxShadow: '0 0 24px rgba(155,109,255,0.2)',
          }}>
            🐼
          </div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.3 }}>AI Хятад хэлний багш</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Онлайн • Claude AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Suggestions */}
        {hasOnlyInitial && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{
                padding: '8px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(155,109,255,0.1)', border: '1px solid rgba(155,109,255,0.2)',
                color: '#C4AAFF', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155,109,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(155,109,255,0.1)'; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => {
          const isUser  = m.role === 'user';
          const isError = m.role === 'error';
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}>
              {!isUser && (
                <div style={{
                  width: 34, height: 34, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(155,109,255,0.2), rgba(255,107,157,0.1))',
                  border: '1px solid rgba(155,109,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  {isError ? '⚠️' : '🐼'}
                </div>
              )}
              <div style={{
                maxWidth: '75%', padding: '13px 17px', borderRadius: 18, fontWeight: 500,
                fontSize: 14, lineHeight: 1.65,
                background: isUser
                  ? 'linear-gradient(135deg, #9B6DFF, #7B4FE0)'
                  : isError
                  ? 'rgba(248,113,113,0.1)'
                  : 'rgba(255,255,255,0.04)',
                color: isError ? '#F87171' : '#EDE9FF',
                border: isUser ? 'none'
                  : isError ? '1px solid rgba(248,113,113,0.25)'
                  : '1px solid rgba(255,255,255,0.07)',
                borderBottomRightRadius: isUser ? 4 : 18,
                borderBottomLeftRadius: isUser ? 18 : 4,
                boxShadow: isUser ? '0 4px 20px rgba(155,109,255,0.3)' : 'none',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(155,109,255,0.2), rgba(255,107,157,0.1))',
              border: '1px solid rgba(155,109,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              🐼
            </div>
            <div style={{
              padding: '14px 18px', borderRadius: 18, borderBottomLeftRadius: 4,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(n => (
                <div key={n} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#9B6DFF',
                  animation: `bounce-dot 1.2s ${n * 0.18}s ease infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '14px 28px 20px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(13,10,31,0.8)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Асуулт бичих... (жш: 你好 гэдгийн утга юу вэ?)"
            disabled={sending}
            autoFocus
            style={{ flex: 1, fontSize: 15 }}
          />
          <button type="submit" className="btn btn-purple" disabled={sending || !input.trim()} style={{ padding: '11px 22px', fontSize: 14 }}>
            {sending ? '...' : 'Илгээх ➤'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
