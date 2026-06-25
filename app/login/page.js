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
  const [pwScore,  setPwScore]  = useState(0); // 0-4

  /* ── Scale stage to viewport ── */
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

  /* ── Password strength ── */
  function scorePw(p) {
    let s = 0;
    if (p.length >= 8)  s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  const isLogin = tab === 'login';

  /* ── i18n ── */
  const dict = {
    mn: {
      welcome:'Voca-д тавтай морил!', subtitle:'Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлэрэй.',
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

  /* ── Submit ── */
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

  /* ── Strength bar color ── */
  const strengthColor = ['','#ef4444','#f59e0b','#22c55e','#10b981'];
  const strengthLabel  = T.pwHint[pwScore];

  /* ── Shared style objects ── */
  const pillBase   = { padding:'5px 14px', borderRadius:999, fontSize:12, fontWeight:800, cursor:'pointer', userSelect:'none', transition:'all 0.2s' };
  const activePill = { ...pillBase, background:'linear-gradient(120deg,#7c3aed,#a855f7)', color:'#fff' };
  const idlePill   = { ...pillBase, background:'transparent', color:'#9a8fc4' };

  const tabBase  = { fontSize:15.5, fontWeight:800, cursor:'pointer', paddingBottom:13, marginBottom:-1, border:'none', background:'none', fontFamily:"'Nunito',sans-serif", transition:'color 0.2s, border-color 0.2s', letterSpacing:'-0.2px' };
  const activeTab = { ...tabBase, color:'#fff',    borderBottom:'2.5px solid #a855f7' };
  const idleTab   = { ...tabBase, color:'#6b5e9a', borderBottom:'2.5px solid transparent' };

  const boxBase    = { width:20, height:20, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' };
  const checkedBox = { ...boxBase, background:'linear-gradient(120deg,#7c3aed,#a855f7)', border:'1px solid #a855f7', boxShadow:'0 0 8px rgba(168,85,247,0.4)' };
  const emptyBox   = { ...boxBase, background:'rgba(15,10,34,0.5)', border:'1.5px solid rgba(150,120,220,0.3)' };

  const checkSvg = (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );

  /* ── SVG Icons ── */
  const IconUser = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b7fc4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>;
  const IconMail = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b7fc4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
  const IconLock = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b7fc4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
  const IconEye  = (open) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b7fc4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'#07041a', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', fontFamily:"'Nunito',sans-serif" }}>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        ::placeholder { color:#6b5e9a !important; opacity:1 !important; }
        input { font-family:'Nunito',sans-serif !important; }

        .vi {
          width:100%; height:56px; padding:0 18px 0 48px;
          background:rgba(12,8,30,0.6);
          border:1.5px solid rgba(130,100,200,0.2);
          border-radius:14px; color:#f0ebff;
          font-size:15px; outline:none;
          box-sizing:border-box;
          transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
          caret-color:#a855f7;
        }
        .vi:focus {
          border-color:rgba(168,85,247,0.65);
          box-shadow:0 0 0 3px rgba(139,92,246,0.18);
          background:rgba(18,10,40,0.8);
        }
        .vi.pr { padding-right:48px; }

        .sb {
          flex:1; height:52px;
          display:flex; align-items:center; justify-content:center; gap:8px;
          background:rgba(12,8,30,0.55);
          border:1.5px solid rgba(130,100,200,0.2);
          border-radius:14px; cursor:pointer;
          transition:background 0.18s, border-color 0.18s, transform 0.15s;
          user-select:none; position:relative; overflow:hidden;
          color:#d6cff5; font-size:14px; font-weight:700;
          font-family:'Nunito',sans-serif;
        }
        .sb:hover { background:rgba(30,18,62,0.85); border-color:rgba(168,85,247,0.35); transform:translateY(-1px); }
        .sb:active { transform:translateY(0); }

        .submit-btn {
          width:100%; height:58px; border:none; border-radius:16px; margin-top:8px;
          background:linear-gradient(110deg,#7c3aed,#a855f7,#7c3aed);
          background-size:200% 100%;
          color:#fff; font-family:'Nunito',sans-serif;
          font-size:17px; font-weight:900; cursor:pointer;
          box-shadow:0 10px 28px rgba(124,58,237,0.42);
          display:flex; align-items:center; justify-content:center; gap:9px;
          transition:background-position 0.4s, box-shadow 0.2s, transform 0.15s, opacity 0.2s;
          letter-spacing:-0.2px;
        }
        .submit-btn:hover:not(:disabled) {
          background-position:100% 0;
          box-shadow:0 14px 36px rgba(124,58,237,0.58);
          transform:translateY(-1px);
        }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:0.55; cursor:not-allowed; }

        .tab-btn:hover { color:#c4b5fd !important; }
        .lang-pill:hover { color:#fff !important; }

        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner {
          width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.3);
          border-top-color:#fff; border-radius:50%;
          animation:spin 0.7s linear infinite;
        }
      `}</style>

      {/* ── Stage 1535×1024, scaled to viewport ── */}
      <div ref={stageRef} style={{
        position:'relative', width:1535, height:1024, flexShrink:0,
        transformOrigin:'center center',
        backgroundImage:'url(/login-bg.png)',
        backgroundSize:'cover', backgroundPosition:'center',
      }}>

        {/* ── Auth card — covers artwork card at left:1007 top:89 ── */}
        <div style={{
          position:'absolute', left:1007, top:82, width:492,
          background:'linear-gradient(155deg,rgba(36,22,68,0.97),rgba(20,11,42,0.98))',
          backdropFilter:'blur(28px)',
          WebkitBackdropFilter:'blur(28px)',
          border:'1.5px solid rgba(168,140,255,0.14)',
          borderRadius:28,
          padding:'32px 36px 30px',
          boxShadow:'0 32px 80px rgba(6,2,20,0.65),0 2px 0 rgba(168,140,255,0.08) inset',
        }}>
          {/* Top accent line */}
          <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:2, borderRadius:2, background:'linear-gradient(90deg,transparent,rgba(168,85,247,0.75),rgba(99,102,241,0.5),transparent)' }} />

          {/* Language toggle */}
          <div style={{ position:'absolute', top:22, right:24, display:'flex', gap:3, background:'rgba(10,6,28,0.7)', border:'1.5px solid rgba(140,110,220,0.2)', borderRadius:999, padding:'3px 4px' }}>
            <div onClick={() => setLang('mn')} className="lang-pill" style={lang==='mn' ? activePill : idlePill}>MN</div>
            <div onClick={() => setLang('en')} className="lang-pill" style={lang==='en' ? activePill : idlePill}>EN</div>
          </div>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:18 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:'linear-gradient(145deg,#8b5cf6,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 5px 16px rgba(139,92,246,0.5)' }}>
              <span style={{ fontWeight:900, fontSize:24, color:'#fff', lineHeight:1 }}>V</span>
            </div>
            <span style={{ fontWeight:800, fontSize:28, color:'#fff', letterSpacing:'-0.5px' }}>voca</span>
          </div>

          {/* Title */}
          <h1 style={{ margin:'0 0 5px', fontSize:30, fontWeight:900, color:'#fff', letterSpacing:'-0.6px', lineHeight:1.2 }}>
            {T.welcome} <span style={{ color:'#fbbf24', fontSize:26 }}>✨</span>
          </h1>
          <p style={{ margin:'0 0 20px', fontSize:14.5, color:'#9d90cc', lineHeight:1.5 }}>{T.subtitle}</p>

          {/* Tabs */}
          <div style={{ display:'flex', gap:32, borderBottom:'1.5px solid rgba(120,90,190,0.15)', marginBottom:22 }}>
            <button className="tab-btn" onClick={() => { setTab('login');    setErr(''); }} style={isLogin  ? activeTab : idleTab}>{T.tabLogin}</button>
            <button className="tab-btn" onClick={() => { setTab('register'); setErr(''); }} style={!isLogin ? activeTab : idleTab}>{T.tabReg}</button>
          </div>

          {/* ── Form ── */}
          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:13 }}>

            {/* Name — register only */}
            {!isLogin && (
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}>{IconUser}</span>
                <input className="vi" type="text" placeholder={T.name} value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}

            {/* Email */}
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}>{IconMail}</span>
              <input className="vi" type="text" placeholder={T.email} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            {/* Password */}
            <div>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}>{IconLock}</span>
                <input className="vi pr" type={showPw ? 'text' : 'password'} placeholder={T.password} value={pw}
                  onChange={e => { setPw(e.target.value); if (!isLogin) setPwScore(scorePw(e.target.value)); }}
                  required />
                <span onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer', display:'flex', opacity:0.7 }}>
                  {IconEye(showPw)}
                </span>
              </div>
              {/* Password strength — register only */}
              {!isLogin && pw.length > 0 && (
                <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ flex:1, display:'flex', gap:4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= pwScore ? strengthColor[pwScore] : 'rgba(150,120,220,0.15)', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11.5, color: strengthColor[pwScore] || '#6b5e9a', fontWeight:700, minWidth:70, textAlign:'right' }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm password — register only */}
            {!isLogin && (
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', display:'flex' }}>{IconLock}</span>
                <input className="vi" type="password" placeholder={T.confirm} value={pw2} onChange={e => setPw2(e.target.value)} required />
                {pw2.length > 0 && (
                  <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>
                    {pw === pw2 ? '✅' : '❌'}
                  </span>
                )}
              </div>
            )}

            {/* Remember / Forgot — login only */}
            {isLogin && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'2px 0' }}>
                <div onClick={() => setRemember(v => !v)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <div style={remember ? checkedBox : emptyBox}>{remember && checkSvg}</div>
                  <span style={{ fontSize:13.5, color:'#c4bae0', fontWeight:600 }}>{T.remember}</span>
                </div>
                <span style={{ fontSize:13.5, color:'#b08cff', cursor:'pointer', fontWeight:700, textDecoration:'underline', textDecorationColor:'rgba(176,140,255,0.3)' }}>{T.forgot}</span>
              </div>
            )}

            {/* Terms — register only */}
            {!isLogin && (
              <div onClick={() => setTerms(v => !v)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', margin:'2px 0' }}>
                <div style={terms ? checkedBox : emptyBox}>{terms && checkSvg}</div>
                <span style={{ fontSize:13, color:'#c4bae0', fontWeight:600, lineHeight:1.4 }}>{T.terms}</span>
              </div>
            )}

            {/* Error */}
            {err && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:9, background:'rgba(239,68,68,0.08)', border:'1.5px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'10px 14px' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
                <span style={{ color:'#fca5a5', fontWeight:700, fontSize:13, lineHeight:1.4 }}>{err}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={busy} className="submit-btn">
              {busy
                ? <><div className="spinner" /> {isLogin ? T.tabLogin : T.tabReg}...</>
                : <>{isLogin ? T.tabLogin : T.tabReg} <span style={{ color:'#fde68a', fontSize:18 }}>✨</span></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:14, margin:'20px 0 16px' }}>
            <div style={{ flex:1, height:1, background:'rgba(130,100,200,0.18)' }} />
            <span style={{ fontSize:13, color:'#7a6ea0', fontWeight:600, letterSpacing:'0.5px' }}>{T.or}</span>
            <div style={{ flex:1, height:1, background:'rgba(130,100,200,0.18)' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display:'flex', gap:10 }}>

            {/* Google — transparent GoogleLogin overlay for real OAuth */}
            <div className="sb">
              <span style={{ width:22, height:22, borderRadius:6, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14, fontWeight:900, color:'#4285F4', letterSpacing:'-0.5px', zIndex:0 }}>G</span>
              <span style={{ zIndex:0 }}>Google</span>
              <div style={{ position:'absolute', inset:0, opacity:0, overflow:'hidden', borderRadius:14, zIndex:1, pointerEvents:'auto' }}>
                <GoogleLogin onSuccess={handleGoogle} onError={() => setErr(T.errGoogle)} width="492" size="large" shape="rectangular" />
              </div>
            </div>

            {/* Facebook */}
            <div className="sb">
              <span style={{ width:22, height:22, borderRadius:6, background:'#1877F2', color:'#fff', fontWeight:900, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>f</span>
              Facebook
            </div>

            {/* Apple */}
            <div className="sb">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#f0ebff">
                <path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.1 0 1.9-1.1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.4-.1 0-2.3-.9-2.3-3.5zM14.2 5.9c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"/>
              </svg>
              Apple
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign:'center', margin:'20px 0 0', fontSize:14, color:'#9d90cc', lineHeight:1.5 }}>
            {isLogin ? T.ftxt[0] : T.ftxt[1]}{' '}
            <span onClick={() => { setTab(isLogin ? 'register' : 'login'); setErr(''); }}
              style={{ color:'#b08cff', fontWeight:800, cursor:'pointer', textDecoration:'underline', textDecorationColor:'rgba(176,140,255,0.35)' }}>
              {isLogin ? T.flnk[0] : T.flnk[1]}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
