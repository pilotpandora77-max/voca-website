'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

export default function AiPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Сайн байна уу! Би Хятад хэлний туслах багш. Асуугаарай! 🐼' },
  ]);
  const [input, setInput]   = useState('');
  const [sending, setSend]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { role: 'user', content: text };
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
  }

  if (authLoad) return null;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>🤖 AI Хятад хэлний багш</h1>
      <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
        Хятад хэлний дүрэм, үг, дуудлагын талаар асуугаарай
      </p>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
        paddingRight: 4, marginBottom: 16,
      }}>
        {messages.map((m, i) => {
          const isUser  = m.role === 'user';
          const isError = m.role === 'error';
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              {!isUser && (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#EDFFD7',
                  border: '2px solid var(--green)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end',
                }}>
                  🐼
                </div>
              )}
              <div style={{
                maxWidth: '75%', padding: '12px 16px', borderRadius: 18, fontWeight: 600, fontSize: 14, lineHeight: 1.6,
                background: isUser ? 'var(--blue)' : isError ? '#FFE0E0' : 'var(--bg-alt)',
                color: isUser ? '#fff' : isError ? '#CC0000' : 'var(--text)',
                border: isError ? '1.5px solid #FF4B4B' : isUser ? 'none' : '2px solid var(--border)',
                borderBottomRightRadius: isUser ? 4 : 18,
                borderBottomLeftRadius: isUser ? 18 : 4,
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          );
        })}

        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: '#EDFFD7',
              border: '2px solid var(--green)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18, flexShrink: 0,
            }}>🐼</div>
            <div style={{
              padding: '12px 16px', borderRadius: 18, background: 'var(--bg-alt)',
              border: '2px solid var(--border)', borderBottomLeftRadius: 4,
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(n => (
                <div key={n} style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--muted)',
                  animation: `bounce 1.2s ${n * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Жишээ: 你好 гэдгийн утга юу вэ?"
          disabled={sending}
          style={{ flex: 1 }}
          autoFocus
        />
        <button type="submit" className="btn btn-green" disabled={sending || !input.trim()}
          style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
          {sending ? '...' : 'Илгээх'}
        </button>
      </form>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
