'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}

function LoginInner() {
  const { login, register, loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const stageRef = useRef(null);

  const [tab,      setTab]      = useState('login');
  const [lang,     setLang]     = useState('mn');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(true);
  const [terms,    setTerms]    = useState(false);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [pw,       setPw]       = useState('');
  const [pw2,      setPw2]      = useState('');
  const [err,      setErr]      = useState('');
  const [busy,     setBusy]     = useState(false);

  /* ── Scale stage to viewport (same as design file) ── */
  useEffect(() => {
    function resize() {
      if (!stageRef.current) return;
      const s = Math.min(window.innerWidth / 1535, window.innerHeight / 1024);
      stageRef.current.style.transform = `scale(${s})`;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (searchParams?.get('tab') === 'register') setTab('register');
  }, [searchParams]);

  const isLogin = tab === 'login';

  /* ── Translations ── */
  const dict = {
    mn: {
      welcome:        'Voca-д тавтай морил!',
      subtitle:       'Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлэрэй.',
      tabLogin:       'Нэвтрэх',
      tabReg:         'Бүртгүүлэх',
      name:           'Нэр',
      email:          'И-мэйл эсвэл утасны дугаар',
      password:       'Нууц үг',
      confirm:        'Нууц үг давтах',
      remember:       'Намайг сана',
      forgot:         'Нууц үгээ мартсан уу?',
      or:             'эсвэл',
      terms:          'Үйлчилгээний нөхцөлийг зөвшөөрч байна',
      footerLoginTxt: 'Voca-г анх удаа ашиглаж байна уу?',
      footerLoginLnk: 'Бүртгүүлэх',
      footerRegTxt:   'Бүртгэлтэй юу?',
      footerRegLnk:   'Нэвтрэх',
      errName:        'Нэр оруулна уу',
      errPw:          'Нууц үг таарахгүй байна',
      errLogin:       'Имэйл эсвэл нууц үг буруу',
      errReg:         'Бүртгэлт амжилтгүй',
      errGoogle:      'Google нэвтрэлт амжилтгүй',
    },
    en: {
      welcome:        'Welcome to Voca!',
      subtitle:       'Sign in or register to continue.',
      tabLogin:       'Sign in',
      tabReg:         'Sign up',
      name:           'Name',
      email:          'Email or phone number',
      password:       'Password',
      confirm:        'Confirm password',
      remember:       'Remember me',
      forgot:         'Forgot password?',
      or:             'or',
      terms:          'I agree to the Terms of Service',
      footerLoginTxt: 'New to Voca?',
      footerLoginLnk: 'Sign up',
      footerRegTxt:   'Already have an account?',
      footerRegLnk:   'Sign in',
      errName:        'Please enter your name',
      errPw:          'Passwords do not match',
      errLogin:       'Invalid email or password',
      errReg:         'Registration failed',
      errGoogle:      'Google login failed',
    },
  };
  const T = dict[lang];

  /* ── Submit ── */
  async function onSubmit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (isLogin) {
        await login(email, pw);
      } else {
        if (!name.trim())  { setErr(T.errName); setBusy(false); return; }
        if (pw !== pw2)    { setErr(T.errPw);   setBusy(false); return; }
        await register(name, email, pw);
      }
    } catch (ex) {
      setErr(ex.response?.data?.error || (isLogin ? T.errLogin : T.errReg));
    }
    setBusy(false);
  }

  async function handleGoogle(cr) {
    setErr(''); setBusy(true);
    try { await loginWithGoogle(cr.credential); }
    catch (ex) { setErr(ex.response?.data?.error || T.errGoogle); }
    setBusy(false);
  }

  /* ── Shared styles ── */
  const pillBase = { padding: '5px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 800, cursor: 'pointer', userSelect: 'none' };
  const activePill = { ...pillBase, background: 'linear-gradient(120deg,#7c3aed,#a855f7)', color: '#fff' };
  const idlePill   = { ...pillBase, background: 'transparent', color: '#9a8fc4' };

  const tabBase    = { fontSize: 16.5, fontWeight: 800, cursor: 'pointer', paddingBottom: 14, marginBottom: -1, border: 'none', background: 'none', fontFamily: "'Nunito',sans-serif" };
  const activeTab  = { ...tabBase, color: '#fff',    borderBottom: '3px solid #a855f7' };
  const idleTab    = { ...tabBase, color: '#8f84b8', borderBottom: '3px solid transparent' };

  const inputStyle = {
    width: '100%', height: 56, padding: '0 18px 0 50px',
    background: 'rgba(15,10,34,0.55)', border: '1px solid rgba(150,120,220,0.22)',
    borderRadius: 15, color: '#fff', fontSize: 15.5, outline: 'none',
    fontFamily: "'Nunito',sans-serif", boxSizing: 'border-box',
  };

  const boxBase    = { width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  const checkedBox = { ...boxBase, background: 'linear-gradient(120deg,#7c3aed,#a855f7)', border: '1px solid #a855f7' };
  const emptyBox   = { ...boxBase, background: 'rgba(15,10,34,0.6)', border: '1px solid rgba(150,120,220,0.4)' };

  const socialBtn = {
    flex: 1, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, background: 'rgba(15,10,34,0.55)', border: '1px solid rgba(150,120,220,0.22)',
    borderRadius: 15, cursor: 'pointer', position: 'relative', overflow: 'hidden',
    userSelect: 'none',
  };

  const checkMark = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0617',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: "'Nunito',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;}
        ::placeholder{color:#9a8fc4!important;opacity:1!important;}
        input{font-family:'Nunito',sans-serif!important;}
      `}</style>

      {/* ── Stage: always 1535×1024, scaled to fit viewport ── */}
      <div
        ref={stageRef}
        style={{
          position: 'relative',
          width: 1535, height: 1024,
          flexShrink: 0,
          transformOrigin: 'center center',
          backgroundImage: 'url(/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* ── Card overlay (covers artwork's baked-in card at left:1007 top:89) ── */}
        <div style={{
          position: 'absolute', left: 1007, top: 89, width: 486, minHeight: 752,
          background: 'linear-gradient(160deg,rgba(40,27,72,0.975),rgba(25,15,49,0.985))',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(168,140,255,0.20)',
          borderRadius: 30,
          padding: '36px 38px 34px',
          boxShadow: '0 30px 80px rgba(10,4,30,0.55),inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>

          {/* Language toggle */}
          <div style={{ position: 'absolute', top: 24, right: 26, display: 'flex', gap: 2, background: 'rgba(15,10,34,0.6)', border: '1px solid rgba(168,140,255,0.18)', borderRadius: 999, padding: 3 }}>
            <div onClick={() => setLang('mn')} style={lang === 'mn' ? activePill : idlePill}>MN</div>
            <div onClick={() => setLang('en')} style={lang === 'en' ? activePill : idlePill}>EN</div>
          </div>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(150deg,#8b5cf6,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(139,92,246,0.45)' }}>
              <span style={{ fontWeight: 900, fontSize: 26, color: '#fff' }}>V</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 30, color: '#fff', letterSpacing: -0.5 }}>voca</span>
          </div>

          {/* Title */}
          <h1 style={{ margin: '0 0 6px', fontSize: 33, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
            {T.welcome} <span style={{ color: '#fbbf24' }}>✨</span>
          </h1>
          <p style={{ margin: '0 0 22px', fontSize: 15.5, color: '#bcb1e0' }}>{T.subtitle}</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 34, borderBottom: '1px solid rgba(150,120,220,0.18)', marginBottom: 26 }}>
            <button onClick={() => { setTab('login');    setErr(''); }} style={isLogin  ? activeTab : idleTab}>{T.tabLogin}</button>
            <button onClick={() => { setTab('register'); setErr(''); }} style={!isLogin ? activeTab : idleTab}>{T.tabReg}</button>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Name — register only */}
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a99bd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
                </span>
                <input type="text" placeholder={T.name} value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
              </div>
            )}

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a99bd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
              </span>
              <input type="text" placeholder={T.email} value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a99bd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
              </span>
              <input type={showPw ? 'text' : 'password'} placeholder={T.password} value={pw} onChange={e => setPw(e.target.value)} style={{ ...inputStyle, paddingRight: 50 }} required />
              <span onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a99bd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
              </span>
            </div>

            {/* Confirm password — register only */}
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a99bd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                </span>
                <input type="password" placeholder={T.confirm} value={pw2} onChange={e => setPw2(e.target.value)} style={inputStyle} required />
              </div>
            )}

            {/* Remember / Forgot — login only */}
            {isLogin && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 0' }}>
                <div onClick={() => setRemember(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                  <div style={remember ? checkedBox : emptyBox}>{remember && checkMark}</div>
                  <span style={{ fontSize: 14.5, color: '#cfc6ec' }}>{T.remember}</span>
                </div>
                <span style={{ fontSize: 14.5, color: '#b08cff', cursor: 'pointer', fontWeight: 700 }}>{T.forgot}</span>
              </div>
            )}

            {/* Terms — register only */}
            {!isLogin && (
              <div onClick={() => setTerms(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', margin: '2px 0' }}>
                <div style={terms ? checkedBox : emptyBox}>{terms && checkMark}</div>
                <span style={{ fontSize: 14, color: '#cfc6ec' }}>{T.terms}</span>
              </div>
            )}

            {/* Error */}
            {err && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', color: '#FCA5A5', fontWeight: 700, fontSize: 13 }}>
                ⚠️ {err}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={busy} style={{
              width: '100%', height: 60, marginTop: 6,
              border: 'none', borderRadius: 16,
              background: busy ? 'rgba(124,58,237,0.5)' : 'linear-gradient(100deg,#7c3aed,#a855f7)',
              color: '#fff', fontFamily: "'Nunito',sans-serif", fontSize: 18, fontWeight: 800,
              cursor: busy ? 'not-allowed' : 'pointer',
              boxShadow: busy ? 'none' : '0 14px 32px rgba(124,58,237,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'filter 0.15s,transform 0.15s',
            }}>
              {busy ? '...' : isLogin ? T.tabLogin : T.tabReg}
              {!busy && <span style={{ color: '#fde68a' }}>✨</span>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0 18px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(150,120,220,0.22)' }} />
            <span style={{ fontSize: 13.5, color: '#9a8fc4' }}>{T.or}</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(150,120,220,0.22)' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', gap: 12 }}>

            {/* Google — custom button with transparent GoogleLogin overlay for real OAuth */}
            <div style={socialBtn}>
              <span style={{ width: 22, height: 22, borderRadius: 5, background: '#fff', color: '#4285F4', fontWeight: 900, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 0 }}>G</span>
              <span style={{ color: '#e7e1f7', fontSize: 14.5, fontWeight: 700, zIndex: 0 }}>Google</span>
              <div style={{ position: 'absolute', inset: 0, opacity: 0, overflow: 'hidden', borderRadius: 15, zIndex: 1 }}>
                <GoogleLogin onSuccess={handleGoogle} onError={() => setErr(T.errGoogle)} width="486" size="large" shape="rectangular" />
              </div>
            </div>

            {/* Facebook */}
            <div style={socialBtn}>
              <span style={{ width: 22, height: 22, borderRadius: 5, background: '#1877F2', color: '#fff', fontWeight: 900, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>f</span>
              <span style={{ color: '#e7e1f7', fontSize: 14.5, fontWeight: 700 }}>Facebook</span>
            </div>

            {/* Apple */}
            <div style={socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                <path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.1 0 1.9-1.1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.4-.1 0-2.3-.9-2.3-3.5zM14.2 5.9c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"/>
              </svg>
              <span style={{ color: '#e7e1f7', fontSize: 14.5, fontWeight: 700 }}>Apple</span>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', margin: '24px 0 0', fontSize: 14.5, color: '#bcb1e0' }}>
            {isLogin ? T.footerLoginTxt : T.footerRegTxt}{' '}
            <span onClick={() => { setTab(isLogin ? 'register' : 'login'); setErr(''); }} style={{ color: '#b08cff', fontWeight: 800, cursor: 'pointer' }}>
              {isLogin ? T.footerLoginLnk : T.footerRegLnk}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
