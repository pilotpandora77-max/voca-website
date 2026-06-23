'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { GoogleLogin } from '@react-oauth/google';

const EMOJIS = ['🐼', '🦊', '🐨', '🦁', '🐯', '🐸', '🦄', '🐙', '🦋', '🐬'];
const COLORS  = [
  { name: 'purple', hex: '#7C3AED' },
  { name: 'blue',   hex: '#3B82F6' },
  { name: 'green',  hex: '#10B981' },
  { name: 'gold',   hex: '#F59E0B' },
  { name: 'red',    hex: '#EF4444' },
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

  const currentColorHex = COLORS.find(c => c.name === color)?.hex || '#7C3AED';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
        top: -150, right: -80, pointerEvents: 'none',
      }} />

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', background: 'linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 100%)',
      }} className="auth-left">
        <div style={{ textAlign: 'center', color: '#fff', maxWidth: 340 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: `${currentColorHex}33`, border: `3px solid ${currentColorHex}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42, transition: 'all 0.3s',
            boxShadow: `0 0 32px ${currentColorHex}44`,
          }}>{emoji}</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, letterSpacing: -0.5 }}>
            Сурах аялалаа эхэлцгээе!
          </h2>
          <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.65, fontWeight: 500 }}>
            Бүртгүүлж voca-г үнэгүй ашиглаарай. Ахиц дэвшлийг хянах, үг цээжлэх, цуваагаа хадгалах боломж.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, opacity: 0.9 }}>
            {[
              { icon: '✓', text: 'Хятад үг цээжлэх SRS систем' },
              { icon: '✓', text: 'Ханз бичилтийн дасгал' },
              { icon: '✓', text: 'Нийгэмлэгийн суралцагчид' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{
        width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 40px', background: '#fff',
        borderLeft: '1.5px solid var(--border)', position: 'relative', zIndex: 1, overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 400, paddingBottom: 20 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18, margin: '0 auto 14px',
              background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#fff',
              boxShadow: '0 8px 28px rgba(124,58,237,0.4)',
            }}>V</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 5 }}>
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
              width="360"
              locale="mn"
              theme="outline"
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>ИМЭЙЛЭЭР БҮРТГҮҮЛЭХ</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Нэвтрэх нэр
              </label>
              <input type="text" value={username} onChange={e => setUser(e.target.value)}
                placeholder="Нэвтрэх нэрээ оруулна уу" required />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Имэйл
              </label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Нууц үг
              </label>
              <input type="password" value={password} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" required />
            </div>

            {/* Emoji picker */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Avatar emoji
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {EMOJIS.map(e => (
                  <button type="button" key={e} onClick={() => setEmoji(e)} style={{
                    fontSize: 22, borderRadius: 10, padding: '6px 9px', cursor: 'pointer',
                    border: `1.5px solid ${emoji === e ? `${currentColorHex}` : 'var(--border)'}`,
                    background: emoji === e ? `${currentColorHex}15` : '#fff',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                    boxShadow: emoji === e ? `0 0 0 2px ${currentColorHex}44` : 'none',
                  }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Avatar өнгө
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {COLORS.map(c => (
                  <button type="button" key={c.name} onClick={() => setColor(c.name)} style={{
                    width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                    background: c.hex,
                    border: color === c.name ? `3px solid #fff` : '2px solid transparent',
                    outline: color === c.name ? `2.5px solid ${c.hex}` : 'none',
                    outlineOffset: 2, transition: 'all 0.15s',
                    boxShadow: color === c.name ? `0 0 12px ${c.hex}66` : 'none',
                  }} />
                ))}
              </div>
            </div>

            {err && (
              <div style={{
                background: '#FEF2F2', border: '1.5px solid #FECACA',
                borderRadius: 12, padding: '11px 14px',
                color: '#EF4444', fontWeight: 700, fontSize: 13,
              }}>
                ⚠️ {err}
              </div>
            )}

            <button type="submit" className="btn btn-purple" disabled={loading}
              style={{ width: '100%', marginTop: 4, padding: '13px 22px', fontSize: 15 }}>
              {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
            Бүртгэл байгаа юу?{' '}
            <Link href="/login" style={{ color: 'var(--purple)', fontWeight: 800, textDecoration: 'none' }}>
              Нэвтрэх
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}
