'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const EMOJIS = ['🐼','🦊','🐨','🦁','🐯','🐸','🦄','🐙','🦋','🐬'];
const COLORS  = [
  { name: 'green',  hex: '#58CC02' },
  { name: 'blue',   hex: '#1CB0F6' },
  { name: 'purple', hex: '#CE82FF' },
  { name: 'gold',   hex: '#FF9600' },
  { name: 'red',    hex: '#FF4B4B' },
];

export default function RegisterPage() {
  const { register }          = useAuth();
  const [username, setUser]   = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [emoji, setEmoji]     = useState('🐼');
  const [color, setColor]     = useState('green');
  const [err, setErr]         = useState('');
  const [loading, setLoad]    = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoad(true);
    try {
      await register(username, email, password);
    } catch (e) {
      setErr(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setLoad(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌟</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>Бүртгүүлэх</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontWeight: 600 }}>voca-д тавтай морилно уу</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>НЭВТРЭХ НЭР</label>
            <input type="text" value={username} onChange={e => setUser(e.target.value)}
              placeholder="Нэвтрэх нэрээ оруулна уу" required style={{ marginTop: 6 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>ИМЭЙЛ</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Имэйл хаягаа оруулна уу" required style={{ marginTop: 6 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>НУУЦ ҮГ</label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)}
              placeholder="Нууц үгээ оруулна уу" required style={{ marginTop: 6 }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>ДУРТАЙ EMOJI</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {EMOJIS.map(e => (
                <button type="button" key={e} onClick={() => setEmoji(e)}
                  style={{
                    fontSize: 24, borderRadius: 10, padding: '6px 10px', cursor: 'pointer',
                    border: `2px solid ${emoji === e ? 'var(--blue)' : 'var(--border)'}`,
                    background: emoji === e ? 'var(--blue-light)' : 'var(--bg-alt)',
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>AVATAR ӨНГӨ</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {COLORS.map(c => (
                <button type="button" key={c.name} onClick={() => setColor(c.name)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                    background: c.hex,
                    border: color === c.name ? '3px solid #333' : '2px solid transparent',
                  }} />
              ))}
            </div>
          </div>

          {err && (
            <div style={{ background: 'var(--red-light)', border: '2px solid var(--red)', borderRadius: 12, padding: 12,
              color: 'var(--red)', fontWeight: 700, fontSize: 14 }}>
              {err}
            </div>
          )}

          <button type="submit" className="btn btn-green" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Бүртгэж байна...' : 'БҮРТГҮҮЛЭХ'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontWeight: 600 }}>
          Бүртгэл байгаа юу?{' '}
          <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 800, textDecoration: 'none' }}>
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
