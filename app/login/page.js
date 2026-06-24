'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}

function LoginInner() {
  const { login, register, loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const [tab, setTab]    = useState('login');
  const [email, setEmail]= useState('');
  const [password, setP] = useState('');
  const [username, setU] = useState('');
  const [showP, setShowP]= useState(false);
  const [err, setErr]    = useState('');
  const [busy, setBusy]  = useState(false);

  useEffect(() => {
    if (searchParams?.get('tab') === 'register') setTab('register');
  }, [searchParams]);

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (tab === 'login') await login(email, password);
      else {
        if (!username.trim()) { setErr('Нэвтрэх нэр оруулна уу'); setBusy(false); return; }
        await register(username, email, password);
      }
    } catch (ex) {
      setErr(ex.response?.data?.error || (tab === 'login' ? 'Имэйл эсвэл нууц үг буруу' : 'Бүртгэлт амжилтгүй'));
    }
    setBusy(false);
  }

  async function handleGoogle(cr) {
    setErr(''); setBusy(true);
    try { await loginWithGoogle(cr.credential); }
    catch (ex) { setErr(ex.response?.data?.error || 'Google нэвтрэлт амжилтгүй'); }
    setBusy(false);
  }

  const card = {
    width: 400,
    background: 'rgba(7, 5, 22, 0.95)',
    borderRadius: 22,
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 28px 70px rgba(0,0,0,0.85)',
    padding: '28px 28px 22px',
    position: 'relative',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', fontFamily: 'inherit' }}>

      {/* ── Full-page background image ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/login-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* ── Content layer ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '2% 3.5% 14% 0',
      }}>

        {/* ── Card ── */}
        <div style={card}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 900, color: '#fff',
              boxShadow: '0 4px 14px rgba(109,40,217,0.55)',
            }}>V</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>voca</span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 5, letterSpacing: -0.5, lineHeight: 1.25 }}>
            Voca-д тавтай морил!{' '}
            <span style={{ fontSize: 20, color: '#FFD700' }}>✦</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, fontWeight: 500, marginBottom: 22 }}>
            Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлэрэй.
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.09)', marginBottom: 20 }}>
            {[{ k: 'login', l: 'Нэвтрэх' }, { k: 'register', l: 'Бүртгүүлэх' }].map(t => (
              <button key={t.k} onClick={() => { setTab(t.k); setErr(''); }} style={{
                flex: 1, padding: '10px 0', fontWeight: 800, fontSize: 14,
                cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit',
                color: tab === t.k ? '#fff' : 'rgba(255,255,255,0.3)',
                borderBottom: tab === t.k ? '2px solid #7C3AED' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.15s',
              }}>{t.l}</button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {tab === 'register' && (
              <div style={{ position: 'relative' }}>
                <span className="voca-icon">👤</span>
                <input className="voca-input" type="text" value={username} onChange={e => setU(e.target.value)} placeholder="Нэвтрэх нэр" required />
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <span className="voca-icon">✉️</span>
              <input className="voca-input" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="И-мэйл эсвэл утасны дугаар" required />
            </div>
            <div style={{ position: 'relative' }}>
              <span className="voca-icon">🔒</span>
              <input className="voca-input" type={showP ? 'text' : 'password'} value={password} onChange={e => setP(e.target.value)} placeholder="Нууц үг" required style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowP(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,0.32)', padding: 2 }}>
                {showP ? '🙈' : '👁'}
              </button>
            </div>

            {tab === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#7C3AED', width: 14, height: 14 }} />
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>Намайг сана</span>
                </label>
                <span style={{ fontSize: 12.5, color: '#A78BFA', fontWeight: 700, cursor: 'pointer' }}>Нууц үгээ мартсан уу?</span>
              </div>
            )}

            {err && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '9px 13px', color: '#FCA5A5', fontWeight: 700, fontSize: 12 }}>
                ⚠️ {err}
              </div>
            )}

            <button type="submit" disabled={busy} style={{
              width: '100%', padding: '14px', fontSize: 15, fontWeight: 900, marginTop: 4,
              borderRadius: 13, border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
              background: busy
                ? 'rgba(109,40,217,0.4)'
                : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
              color: '#fff', letterSpacing: 0.3, fontFamily: 'inherit',
              boxShadow: busy ? 'none' : '0 6px 28px rgba(109,40,217,0.6)',
              transition: 'all 0.2s',
            }}>
              {busy
                ? (tab === 'login' ? 'Нэвтэрч байна...' : 'Бүртгэж байна...')
                : (tab === 'login' ? 'Нэвтрэх ✨' : 'Бүртгүүлэх ✨')}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>эсвэл</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Google */}
            <div style={{ flex: 1, overflow: 'hidden', borderRadius: 12 }}>
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setErr('Google нэвтрэлт амжилтгүй')}
                text={tab === 'login' ? 'signin_with' : 'signup_with'}
                shape="rectangular" size="large" width="200" locale="mn" theme="filled_black"
              />
            </div>
            {/* Facebook */}
            <button disabled style={socialStyle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
            {/* Apple */}
            <button disabled style={socialStyle}>
              <svg width="13" height="15" viewBox="0 0 814 1000" fill="rgba(255,255,255,0.8)">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-166.2-112.4C18.3 663.4 0 564.4 0 486.3c0-238.1 155.7-364.3 308.4-364.3 79.8 0 146.4 52.5 194.5 52.5 46.6 0 120.3-55.4 209.2-55.4zm-7.3-142.4c31.4-35.3 54.2-84.6 54.2-133.9 0-6.9-.5-13.9-1.7-19.5-51.6 1.8-112.6 34.5-149.2 74.1-28.5 30.8-55.4 80.1-55.4 130.1 0 7.4 1.3 14.8 1.8 17.3 3.1.5 8.2 1.3 13.3 1.3 46.6 0 103.4-31.4 136.9-69.5z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.25)', fontSize: 13, fontWeight: 500 }}>
            {tab === 'login' ? 'Voca-г анх удаа ашиглаж байна уу? ' : 'Бүртгэл байгаа юу? '}
            <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErr(''); }}
              style={{ background: 'none', border: 'none', color: '#A78BFA', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              {tab === 'login' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .voca-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          font-size: 15px; pointer-events: none; z-index: 1; color: rgba(255,255,255,0.3);
        }
        .voca-input {
          width: 100%; padding: 13px 13px 13px 42px;
          font-size: 13.5px; font-family: inherit; outline: none; box-sizing: border-box;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; border-radius: 12px; transition: all 0.18s;
        }
        .voca-input:focus {
          border-color: rgba(139,92,246,0.55);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(109,40,217,0.12);
        }
        .voca-input::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>
    </div>
  );
}

const socialStyle = {
  flex: 1, padding: '11px 0', borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.09)',
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 12.5,
  cursor: 'not-allowed', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
};
