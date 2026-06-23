'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { GoogleLogin } from '@react-oauth/google';

const FLOAT_CHARS = ['你', '好', '学', '习', '中', '文', '汉', '字', '语', '言'];

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');
  const [err, setErr]       = useState('');
  const [loading, setLoad]  = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoad(true);
    try {
      await login(email, password);
    } catch (e) {
      setErr(e.response?.data?.error || 'Имэйл эсвэл нууц үг буруу байна');
    }
    setLoad(false);
  }

  async function handleGoogle(credentialResponse) {
    setErr('');
    setLoad(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (e) {
      setErr(e.response?.data?.error || 'Google нэвтрэлт амжилтгүй');
    }
    setLoad(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0D0A1F 0%, #130E2B 50%, #0D0A1F 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Floating background characters */}
      {FLOAT_CHARS.map((char, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${8 + (i * 9.5) % 90}%`,
          top: `${10 + (i * 17) % 75}%`,
          fontSize: `${24 + (i % 4) * 12}px`,
          fontWeight: 900,
          color: 'rgba(155,109,255,0.06)',
          animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {char}
        </div>
      ))}

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,109,255,0.12) 0%, transparent 70%)',
        top: -100, left: '30%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%)',
        bottom: -80, right: '10%', pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        margin: 'auto', width: '100%', maxWidth: 420, padding: '24px 16px',
        position: 'relative', zIndex: 1,
      }}>
        <div className="card-glass anim-up" style={{ padding: '36px 32px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 18,
              background: 'linear-gradient(135deg, #9B6DFF, #7B4FE0)',
              fontSize: 32, fontWeight: 900, color: '#fff',
              boxShadow: '0 8px 32px rgba(155,109,255,0.45)',
              marginBottom: 16,
            }}>
              v
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#EDE9FF', letterSpacing: -0.5, marginBottom: 6 }}>
              Нэвтрэх
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 500 }}>
              voca-д тавтай морилно уу
            </p>
          </div>

          {/* Google button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setErr('Google нэвтрэлт амжилтгүй')}
              text="signin_with"
              shape="rectangular"
              size="large"
              width="356"
              locale="mn"
              theme="filled_black"
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
              ЭСВЭЛ ИМЭЙЛЭЭР
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                Имэйл
              </label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Нууц үг
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: '#9B6DFF', fontWeight: 700, textDecoration: 'none' }}>
                  Мартсан?
                </Link>
              </div>
              <input type="password" value={password} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" required />
            </div>

            {err && (
              <div style={{
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.28)',
                borderRadius: 12, padding: '11px 14px',
                color: '#F87171', fontWeight: 700, fontSize: 13,
              }}>
                {err}
              </div>
            )}

            <button type="submit" className="btn btn-purple" disabled={loading} style={{ width: '100%', marginTop: 4, padding: '13px 22px', fontSize: 15 }}>
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
            Бүртгэл байхгүй юу?{' '}
            <Link href="/register" style={{ color: '#9B6DFF', fontWeight: 800, textDecoration: 'none' }}>
              Бүртгүүлэх
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
