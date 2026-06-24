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
  const [tab, setTab]       = useState('login');
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');
  const [username, setUser] = useState('');
  const [showPass, setShowP]= useState(false);
  const [err, setErr]       = useState('');
  const [loading, setLoad]  = useState(false);

  useEffect(() => {
    if (searchParams?.get('tab') === 'register') setTab('register');
  }, [searchParams]);

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoad(true);
    try {
      if (tab === 'login') { await login(email, password); }
      else {
        if (!username.trim()) { setErr('Нэвтрэх нэр оруулна уу'); setLoad(false); return; }
        await register(username, email, password);
      }
    } catch (ex) {
      setErr(ex.response?.data?.error || (tab === 'login' ? 'Имэйл эсвэл нууц үг буруу' : 'Бүртгэлт амжилтгүй'));
    }
    setLoad(false);
  }

  async function handleGoogle(cr) {
    setErr(''); setLoad(true);
    try { await loginWithGoogle(cr.credential); }
    catch (ex) { setErr(ex.response?.data?.error || 'Google нэвтрэлт амжилтгүй'); }
    setLoad(false);
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'inherit' }}>

      {/* Background image — left 60% visible, right fades to dark */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/login-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'left top',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'crisp-edges',
      }} />

      {/* Gradient overlay — covers right side to hide image's built-in card */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: '48%',
        background: 'linear-gradient(to right, transparent 0%, #080618 28%, #080618 100%)',
      }} />

      {/* Content layer */}
      <div style={{
        position: 'relative', zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 4% 11% 0',
      }}>

      {/* ── Form card ── */}
      <div style={{
        width: 400,
        background: 'rgba(10, 8, 24, 0.92)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1) inset',
        padding: '28px 30px 26px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900, color: '#fff',
            boxShadow: '0 4px 12px rgba(109,40,217,0.5)',
          }}>V</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>voca</span>
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 5, letterSpacing: -0.4 }}>
          Voca-д тавтай морил! <span style={{ fontSize: 18 }}>✨</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12.5, fontWeight: 500, marginBottom: 20 }}>
          Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлэрэй.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 20 }}>
          {[{ key: 'login', label: 'Нэвтрэх' }, { key: 'register', label: 'Бүртгүүлэх' }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setErr(''); }} style={{
              flex: 1, padding: '9px 0', fontWeight: 800, fontSize: 13.5,
              cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit',
              color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.3)',
              borderBottom: tab === t.key ? '2px solid #7C3AED' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'register' && (
            <div style={{ position: 'relative' }}>
              <span className="input-icon">👤</span>
              <input className="auth-input" type="text" value={username} onChange={e => setUser(e.target.value)} placeholder="Нэвтрэх нэр" required />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <span className="input-icon">✉️</span>
            <input className="auth-input" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="И-мэйл эсвэл утасны дугаар" required />
          </div>
          <div style={{ position: 'relative' }}>
            <span className="input-icon">🔒</span>
            <input className="auth-input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)} placeholder="Нууц үг" required style={{ paddingRight: 42 }} />
            <button type="button" onClick={() => setShowP(p => !p)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'rgba(255,255,255,0.3)', padding: 3 }}>
              {showPass ? '🙈' : '👁'}
            </button>
          </div>

          {tab === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#7C3AED', width: 14, height: 14 }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Намайг сана</span>
              </label>
              <span style={{ fontSize: 12, color: '#A78BFA', fontWeight: 700, cursor: 'pointer' }}>Нууц үгээ мартсан уу?</span>
            </div>
          )}

          {err && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '9px 13px', color: '#FCA5A5', fontWeight: 700, fontSize: 12 }}>
              ⚠️ {err}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', fontSize: 14, fontWeight: 900,
            borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'rgba(109,40,217,0.4)' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            color: '#fff', letterSpacing: 0.3, fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 6px 24px rgba(109,40,217,0.55)',
            transition: 'all 0.2s',
          }}>
            {loading ? (tab === 'login' ? 'Нэвтэрч байна...' : 'Бүртгэж байна...') : (tab === 'login' ? 'Нэвтрэх ✨' : 'Бүртгүүлэх ✨')}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 600 }}>эсвэл</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Social */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, overflow: 'hidden', borderRadius: 10 }}>
            <GoogleLogin onSuccess={handleGoogle} onError={() => setErr('Google нэвтрэлт амжилтгүй')} text={tab === 'login' ? 'signin_with' : 'signup_with'} shape="rectangular" size="large" width="200" locale="mn" theme="filled_black" />
          </div>
          <button disabled style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(24,119,242,0.15)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 12, cursor: 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Facebook
          </button>
          <button disabled style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 12, cursor: 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="11" height="14" viewBox="0 0 814 1000" fill="rgba(255,255,255,0.85)"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-166.2-112.4C18.3 663.4 0 564.4 0 486.3c0-238.1 155.7-364.3 308.4-364.3 79.8 0 146.4 52.5 194.5 52.5 46.6 0 120.3-55.4 209.2-55.4zm-7.3-142.4c31.4-35.3 54.2-84.6 54.2-133.9 0-6.9-.5-13.9-1.7-19.5-51.6 1.8-112.6 34.5-149.2 74.1-28.5 30.8-55.4 80.1-55.4 130.1 0 7.4 1.3 14.8 1.8 17.3 3.1.5 8.2 1.3 13.3 1.3 46.6 0 103.4-31.4 136.9-69.5z" /></svg>
            Apple
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, color: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 500 }}>
          {tab === 'login' ? 'Voca-г анх удаа ашиглаж байна уу? ' : 'Бүртгэл байгаа юу? '}
          <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErr(''); }} style={{ background: 'none', border: 'none', color: '#A78BFA', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            {tab === 'login' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
          </button>
        </p>
      </div>
      </div>

      <style>{`
        .input-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          font-size: 15px; color: rgba(255,255,255,0.28); pointer-events: none; z-index: 1;
        }
        .auth-input {
          width: 100%; padding: 12px 12px 12px 40px;
          font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          color: #fff; border-radius: 11px; transition: all 0.18s;
        }
        .auth-input:focus {
          border-color: rgba(139,92,246,0.55);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(109,40,217,0.12);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>
    </div>
  );
}
