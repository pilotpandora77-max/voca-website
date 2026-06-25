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
  const [remember, setRemember] = useState(false);
  const [terms,    setTerms]    = useState(false);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [pw,       setPw]       = useState('');
  const [pw2,      setPw2]      = useState('');
  const [err,      setErr]      = useState('');
  const [busy,     setBusy]     = useState(false);
  const [pwScore,  setPwScore]  = useState(0);

  /* ── Scale 1536×1024 stage to viewport ── */
  useEffect(() => {
    function resize() {
      if (!stageRef.current) return;
      const s = Math.min(window.innerWidth / 1536, window.innerHeight / 1024);
      stageRef.current.style.transform = `scale(${s})`;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (searchParams?.get('tab') === 'register') setTab('register');
  }, [searchParams]);

  function scorePw(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  const isLogin = tab === 'login';

  /* ── i18n ── */
  const dict = {
    mn: {
      welcome:'Voca-д тавтай морил!', subtitle:'Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлээрэй.',
      tabLogin:'Нэвтрэх', tabReg:'Бүртгүүлэх',
      name:'Нэр', email:'И-мэйл эсвэл утасны дугаар',
      password:'Нууц үг', confirm:'Нууц үг давтах',
      remember:'Намайг сана', forgot:'Нууц үгээ мартсан уу?',
      or:'эсвэл', terms:'Үйлчилгээний нөхцөлийг зөвшөөрч байна',
      ftxt:['Voca-г анх удаа ашиглаж байна уу?','Бүртгэлтэй юу?'],
      flnk:['Бүртгүүлэх','Нэвтрэх'],
      pwHint:['','Сул','Дунд','Хүчтэй','Маш хүчтэй'],
      errName:'Нэр оруулна уу', errPw:'Нууц үг таарахгүй байна',
      errLogin:'Имэйл эсвэл нууц үг буруу', errReg:'Бүртгэлт амжилтгүй',
      errGoogle:'Google нэвтрэлт амжилтгүй',
    },
    en: {
      welcome:'Welcome to Voca!', subtitle:'Sign in or register to continue.',
      tabLogin:'Sign in', tabReg:'Sign up',
      name:'Full name', email:'Email or phone number',
      password:'Password', confirm:'Confirm password',
      remember:'Remember me', forgot:'Forgot password?',
      or:'or', terms:'I agree to the Terms of Service',
      ftxt:['New to Voca?','Already have an account?'],
      flnk:['Sign up','Sign in'],
      pwHint:['','Weak','Fair','Strong','Very strong'],
      errName:'Please enter your name', errPw:'Passwords do not match',
      errLogin:'Invalid email or password', errReg:'Registration failed',
      errGoogle:'Google login failed',
    },
  };
  const T = dict[lang];

  async function onSubmit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (isLogin) {
        await login(email, pw);
      } else {
        if (!name.trim()) { setErr(T.errName); setBusy(false); return; }
        if (pw !== pw2)   { setErr(T.errPw);   setBusy(false); return; }
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

  const strengthColor = ['','#ef4444','#f59e0b','#22c55e','#10b981'];

  /* ── Light-theme style objects ── */
  const pillBase   = { padding:'5px 13px', borderRadius:999, fontSize:11.5, fontWeight:800, cursor:'pointer', userSelect:'none', transition:'all 0.2s' };
  const activePill = { ...pillBase, background:'linear-gradient(120deg,#7c3aed,#a855f7)', color:'#fff' };
  const idlePill   = { ...pillBase, background:'transparent', color:'#9b94b5' };

  const tabBase   = { fontSize:16, fontWeight:800, cursor:'pointer', paddingBottom:14, marginBottom:-1.5, border:'none', background:'none', fontFamily:"'Nunito',sans-serif", transition:'color 0.2s, border-color 0.2s', letterSpacing:'-0.3px' };
  const activeTab = { ...tabBase, color:'#7c3aed', borderBottom:'3px solid #7c3aed' };
  const idleTab   = { ...tabBase, color:'#9b94b5', borderBottom:'3px solid transparent' };

  const boxBase    = { width:20, height:20, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' };
  const checkedBox = { ...boxBase, background:'linear-gradient(120deg,#7c3aed,#a855f7)', border:'1px solid #a855f7' };
  const emptyBox   = { ...boxBase, background:'#fff', border:'1.5px solid #d8d1ea' };

  const checkSvg = (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
  );

  const ICO = '#a99bd6';
  const IconUser = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ICO} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>;
  const IconMail = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ICO} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
  const IconLock = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ICO} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
  const IconEye  = (open) => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={ICO} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'#0a0420', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', fontFamily:"'Nunito',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        ::placeholder { color:#9b94b5 !important; opacity:1 !important; }
        input { font-family:'Nunito',sans-serif !important; }

        .vi {
          width:100%; height:54px; padding:0 18px 0 46px;
          background:#f7f5fc; border:1.5px solid #e7e2f2;
          border-radius:13px; color:#2a2150; font-size:15px; font-weight:600;
          outline:none; box-sizing:border-box; caret-color:#a855f7;
          transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .vi:focus { border-color:#a855f7; box-shadow:0 0 0 3px rgba(168,85,247,0.14); background:#fff; }
        .vi.pr { padding-right:46px; }

        .sb {
          flex:1; height:50px;
          display:flex; align-items:center; justify-content:center; gap:8px;
          background:#fff; border:1.5px solid #e7e2f2; border-radius:13px;
          cursor:pointer; position:relative; overflow:hidden; user-select:none;
          color:#3a3354; font-size:14px; font-weight:700; font-family:'Nunito',sans-serif;
          transition:background 0.18s, border-color 0.18s, transform 0.15s, box-shadow 0.18s;
        }
        .sb:hover { background:#faf8ff; border-color:#c9bbf0; transform:translateY(-1px); box-shadow:0 4px 12px rgba(124,58,237,0.1); }
        .sb:active { transform:translateY(0); }

        .submit-btn {
          width:100%; height:56px; border:none; border-radius:14px; margin-top:6px;
          background:linear-gradient(110deg,#7c3aed,#a855f7,#7c3aed); background-size:200% 100%;
          color:#fff; font-family:'Nunito',sans-serif; font-size:17px; font-weight:800;
          cursor:pointer; box-shadow:0 10px 26px rgba(124,58,237,0.4);
          display:flex; align-items:center; justify-content:center; gap:9px;
          transition:background-position 0.4s, box-shadow 0.2s, transform 0.15s, opacity 0.2s;
          letter-spacing:'-0.2px';
        }
        .submit-btn:hover:not(:disabled) { background-position:100% 0; box-shadow:0 14px 34px rgba(124,58,237,0.55); transform:translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }

        .tab-btn:hover { color:#7c3aed !important; }
        .lang-pill:hover { opacity:0.85; }
        .link-purple:hover { opacity:0.8; }

        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
      `}</style>

      {/* ── Stage 1536×1024 ── */}
      <div ref={stageRef} style={{
        position:'relative', width:1536, height:1024, flexShrink:0,
        transformOrigin:'center center',
        backgroundImage:'url(/login-bg2.png)',
        backgroundSize:'cover', backgroundPosition:'center',
      }}>

        {/* ── White auth card — covers artwork card at left:895 top:81 w:572 h:849 ── */}
        <div style={{
          position:'absolute', left:895, top:81, width:572, minHeight:849,
          background:'#ffffff',
          border:'1px solid rgba(124,58,237,0.07)',
          borderRadius:30,
          padding:'40px 46px 34px',
          boxShadow:'0 30px 80px rgba(20,8,50,0.35)',
          display:'flex', flexDirection:'column',
        }}>

          {/* Language toggle */}
          <div style={{ position:'absolute', top:26, right:30, display:'flex', gap:3, background:'#f4f1fb', border:'1px solid #e7e2f2', borderRadius:999, padding:'3px 4px' }}>
            <div onClick={() => setLang('mn')} className="lang-pill" style={lang==='mn' ? activePill : idlePill}>MN</div>
            <div onClick={() => setLang('en')} className="lang-pill" style={lang==='en' ? activePill : idlePill}>EN</div>
          </div>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(145deg,#8b5cf6,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 16px rgba(139,92,246,0.4)' }}>
              <span style={{ fontWeight:900, fontSize:25, color:'#fff', lineHeight:1 }}>V</span>
            </div>
            <span style={{ fontWeight:900, fontSize:27, color:'#1c1438', letterSpacing:'0.5px' }}>VOCA</span>
          </div>

          {/* Title */}
          <h1 style={{ margin:'0 0 6px', fontSize:30, fontWeight:900, color:'#1c1438', letterSpacing:'-0.6px', lineHeight:1.2 }}>
            {T.welcome} <span style={{ fontSize:26 }}>👋</span>
          </h1>
          <p style={{ margin:'0 0 22px', fontSize:15, color:'#8b85a0', lineHeight:1.5, fontWeight:500 }}>{T.subtitle}</p>

          {/* Tabs */}
          <div style={{ display:'flex', gap:34, borderBottom:'1.5px solid #ece8f6', marginBottom:24 }}>
            <button className="tab-btn" onClick={() => { setTab('login');    setErr(''); }} style={isLogin  ? activeTab : idleTab}>{T.tabLogin}</button>
            <button className="tab-btn" onClick={() => { setTab('register'); setErr(''); }} style={!isLogin ? activeTab : idleTab}>{T.tabReg}</button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {!isLogin && (
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}>{IconUser}</span>
                <input className="vi" type="text" placeholder={T.name} value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}

            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}>{IconMail}</span>
              <input className="vi" type="text" placeholder={T.email} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}>{IconLock}</span>
                <input className="vi pr" type={showPw ? 'text' : 'password'} placeholder={T.password} value={pw}
                  onChange={e => { setPw(e.target.value); if (!isLogin) setPwScore(scorePw(e.target.value)); }} required />
                <span onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer', display:'flex' }}>{IconEye(showPw)}</span>
              </div>
              {!isLogin && pw.length > 0 && (
                <div style={{ marginTop:9, display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ flex:1, display:'flex', gap:4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= pwScore ? strengthColor[pwScore] : '#eae5f4', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11.5, color: strengthColor[pwScore] || '#9b94b5', fontWeight:700, minWidth:72, textAlign:'right' }}>{T.pwHint[pwScore]}</span>
                </div>
              )}
            </div>

            {!isLogin && (
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}>{IconLock}</span>
                <input className="vi pr" type="password" placeholder={T.confirm} value={pw2} onChange={e => setPw2(e.target.value)} required />
                {pw2.length > 0 && (
                  <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:15 }}>{pw === pw2 ? '✅' : '❌'}</span>
                )}
              </div>
            )}

            {isLogin && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'2px 0' }}>
                <div onClick={() => setRemember(v => !v)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <div style={remember ? checkedBox : emptyBox}>{remember && checkSvg}</div>
                  <span style={{ fontSize:14, color:'#6b6485', fontWeight:600 }}>{T.remember}</span>
                </div>
                <span className="link-purple" style={{ fontSize:14, color:'#7c3aed', cursor:'pointer', fontWeight:700 }}>{T.forgot}</span>
              </div>
            )}

            {!isLogin && (
              <div onClick={() => setTerms(v => !v)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', margin:'2px 0' }}>
                <div style={terms ? checkedBox : emptyBox}>{terms && checkSvg}</div>
                <span style={{ fontSize:13.5, color:'#6b6485', fontWeight:600, lineHeight:1.4 }}>{T.terms}</span>
              </div>
            )}

            {err && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:9, background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:12, padding:'10px 14px' }}>
                <span style={{ fontSize:15, flexShrink:0 }}>⚠️</span>
                <span style={{ color:'#dc2626', fontWeight:700, fontSize:13, lineHeight:1.4 }}>{err}</span>
              </div>
            )}

            <button type="submit" disabled={busy} className="submit-btn">
              {busy
                ? <><div className="spinner" /> {isLogin ? T.tabLogin : T.tabReg}...</>
                : <>{isLogin ? T.tabLogin : T.tabReg} <span style={{ fontSize:18 }}>✨</span></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:14, margin:'22px 0 18px' }}>
            <div style={{ flex:1, height:1, background:'#ece8f6' }} />
            <span style={{ fontSize:13, color:'#9b94b5', fontWeight:600 }}>{T.or}</span>
            <div style={{ flex:1, height:1, background:'#ece8f6' }} />
          </div>

          {/* Social */}
          <div style={{ display:'flex', gap:11 }}>
            {/* Google */}
            <div className="sb">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
              Google
              <div style={{ position:'absolute', inset:0, opacity:0, overflow:'hidden', borderRadius:13, zIndex:1 }}>
                <GoogleLogin onSuccess={handleGoogle} onError={() => setErr(T.errGoogle)} width="160" size="large" shape="rectangular" />
              </div>
            </div>
            {/* Facebook */}
            <div className="sb">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </div>
            {/* Apple */}
            <div className="sb">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.1 0 1.9-1.1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.4-.1 0-2.3-.9-2.3-3.5zM14.2 5.9c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"/></svg>
              Apple
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign:'center', margin:'auto 0 0', paddingTop:22, fontSize:14, color:'#8b85a0', fontWeight:500 }}>
            {isLogin ? T.ftxt[0] : T.ftxt[1]}{' '}
            <span className="link-purple" onClick={() => { setTab(isLogin ? 'register' : 'login'); setErr(''); }}
              style={{ color:'#7c3aed', fontWeight:800, cursor:'pointer' }}>
              {isLogin ? T.flnk[0] : T.flnk[1]}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
