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
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Floating background characters */}
      {FLOAT_CHARS.map((char, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${8 + (i * 9.5) % 90}%`,
          top: `${10 + (i * 17) % 75}%`,
          fontSize: `${28 + (i % 4) * 14}px`,
          fontWeight: 900,
          color: 'rgba(124,58,237,0.055)',
          animation: `auth-float ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {char}
        </div>
      ))}

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        top: -120, left: '25%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        bottom: -60, right: '5%', pointerEvents: 'none',
      }} />

      {/* Left decorative panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', background: 'linear-gradient(135deg, var(--purple) 0%, var(--purple-dark) 100%)',
      }} className="auth-left">
        <div style={{ textAlign: 'center', color: '#fff', maxWidth: 360 }}>
          <div style={{ fontSize: 80, marginBottom: 20, animation: 'auth-float 3s ease infinite' }}>🐼</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 14, letterSpacing: -0.5 }}>
            Хятад хэл сур!
          </h2>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.65, fontWeight: 500 }}>
            Өдөр бүр 5 минутын дасгалаар хурдан ахиц гарга. 10,000+ үг, SRS систем, Ханз бичилт.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 28, opacity: 0.85 }}>
            {[['📚', '10к+', 'Үг'], ['🔥', '50+', 'Хичээл'], ['👥', '1к+', 'Суралцагч']].map(([icon, val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{icon}</div>
                <div style={{ fontWeight: 900, fontSize: 20 }}>{val}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 40px', background: '#fff',
        borderLeft: '1.5px solid var(--border)', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))',
              fontSize: 28, fontWeight: 900, color: '#fff',
              boxShadow: '0 8px 28px rgba(124,58,237,0.4)', marginBottom: 16,
            }}>
              V
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 6 }}>
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
              width="340"
              locale="mn"
              theme="outline"
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
              ЭСВЭЛ ИМЭЙЛЭЭР
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                Имэйл
              </label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Нууц үг
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>
                  Мартсан?
                </Link>
              </div>
              <input type="password" value={password} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" required />
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
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
            Бүртгэл байхгүй юу?{' '}
            <Link href="/register" style={{ color: 'var(--purple)', fontWeight: 800, textDecoration: 'none' }}>
              Бүртгүүлэх
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes auth-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(4deg); }
        }
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}
