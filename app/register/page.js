'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { GoogleLogin } from '@react-oauth/google';

const EMOJIS = ['🐼','🦊','🐨','🦁','🐯','🐸','🦄','🐙','🦋','🐬'];
const COLORS  = [
  { name: 'purple', hex: '#9B6DFF' },
  { name: 'blue',   hex: '#38BDF8' },
  { name: 'green',  hex: '#22C55E' },
  { name: 'gold',   hex: '#F59E0B' },
  { name: 'red',    hex: '#F87171' },
  { name: 'teal',   hex: '#00C6AE' },
];

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const [username, setUser]   = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [emoji, setEmoji]     = useState('🐼');
  const [color, setColor]     = useState('purple');
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

  async function handleGoogle(credentialResponse) {
    setErr('');
    setLoad(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (e) {
      setErr(e.response?.data?.error || 'Google бүртгэлт амжилтгүй');
    }
    setLoad(false);
  }

  const currentColorHex = COLORS.find(c => c.name === color)?.hex || '#9B6DFF';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,109,255,0.10) 0%, transparent 70%)',
        top: -200, right: -100, pointerEvents: 'none',
      }} />

      <div className="card-glass anim-up" style={{ width: '100%', maxWidth: 460, padding: '36px 32px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {/* Avatar preview */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 68, height: 68, borderRadius: '50%',
            background: `${currentColorHex}22`,
            border: `2.5px solid ${currentColorHex}66`,
            fontSize: 36, marginBottom: 14,
            boxShadow: `0 0 24px ${currentColorHex}33`,
            transition: 'all 0.3s',
          }}>
            {emoji}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.5, marginBottom: 6 }}>
            Бүртгүүлэх
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
            voca-д тавтай морилно уу
          </p>
        </div>

        {/* Google */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setErr('Google бүртгэлт амжилтгүй')}
            text="signup_with"
            shape="rectangular"
            size="large"
            width="396"
            locale="mn"
            theme="filled_black"
          />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 800, letterSpacing: 0.8 }}>ИМЭЙЛЭЭР БҮРТГҮҮЛЭХ</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
              Нэвтрэх нэр
            </label>
            <input type="text" value={username} onChange={e => setUser(e.target.value)}
              placeholder="Нэвтрэх нэрээ оруулна уу" required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
              Имэйл
            </label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com" required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
              Нууц үг
            </label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)}
              placeholder="••••••••" required />
          </div>

          {/* Emoji picker */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Avatar emoji
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {EMOJIS.map(e => (
                <button type="button" key={e} onClick={() => setEmoji(e)} style={{
                  fontSize: 22, borderRadius: 10, padding: '6px 9px', cursor: 'pointer',
                  border: `1.5px solid ${emoji === e ? `${currentColorHex}66` : 'rgba(255,255,255,0.07)'}`,
                  background: emoji === e ? `${currentColorHex}18` : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                  boxShadow: emoji === e ? `0 0 12px ${currentColorHex}33` : 'none',
                }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Avatar өнгө
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {COLORS.map(c => (
                <button type="button" key={c.name} onClick={() => setColor(c.name)} style={{
                  width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                  background: c.hex,
                  border: color === c.name ? `3px solid rgba(255,255,255,0.8)` : '2px solid transparent',
                  outline: color === c.name ? `2px solid ${c.hex}` : 'none',
                  outlineOffset: 2,
                  transition: 'all 0.15s',
                  boxShadow: color === c.name ? `0 0 14px ${c.hex}66` : 'none',
                }} />
              ))}
            </div>
          </div>

          {err && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.28)',
              borderRadius: 12, padding: '11px 14px', color: '#F87171', fontWeight: 700, fontSize: 13,
            }}>
              {err}
            </div>
          )}

          <button type="submit" className="btn btn-purple" disabled={loading} style={{ width: '100%', marginTop: 4, padding: '13px 22px', fontSize: 15 }}>
            {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
          Бүртгэл байгаа юу?{' '}
          <Link href="/login" style={{ color: '#9B6DFF', fontWeight: 800, textDecoration: 'none' }}>
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
