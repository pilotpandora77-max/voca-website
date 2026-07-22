'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}

/* ── Stage matches background image: 1672×941 (16:9) ── */
const STAGE_W = 1672;
const STAGE_H = 941;

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

  useEffect(() => {
    function resize() {
      if (!stageRef.current) return;
      const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
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

  const dict = {
    mn: {
      welcome:'Voca-д тавтай морил!', subtitle:'Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлээрэй.',
      tabLogin:'Нэвтрэх', tabReg:'Бүртгүүлэх',
      name:'Нэр', email:'Нэвтрэх нэр',
      password:'Нууц үг', confirm:'Нууц үг давтах',
      remember:'Намайг сана', forgot:'Нууц үгээ мартсан уу?',
      or:'эсвэл', terms:'Үйлчилгээний нөхцөлийг зөвшөөрч байна',
      google:['Google-ээр нэвтрэх','Google-ээр бүртгүүлэх'],
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
      name:'Full name', email:'Username',
      password:'Password', confirm:'Confirm password',
      remember:'Remember me', forgot:'Forgot password?',
      or:'or', terms:'I agree to the Terms of Service',
      google:['Sign in with Google','Sign up with Google'],
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

  async function handleForgot() {
    const em = (email || window.prompt('Бүртгэлтэй и-мэйл хаягаа оруулна уу:') || '').trim();
    if (!em) return;
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email: em });
      const code = data.code; // одоогоор backend кодыг response-д буцаадаг (и-мэйл илгээлт хараахан алга)
      const np = window.prompt('Шинэ нууц үгээ оруулна уу (хамгийн багадаа 6 тэмдэгт):');
      if (!np) return;
      if (np.length < 6) { alert('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.'); return; }
      await api.post('/api/auth/reset-password', { email: em, code, newPassword: np });
      alert('Нууц үг амжилттай шинэчлэгдлээ! Шинэ нууц үгээрээ нэвтэрнэ үү.');
    } catch (ex) {
      alert(ex.response?.data?.error || 'Нууц үг сэргээхэд алдаа гарлаа. И-мэйлээ шалгана уу.');
    }
  }

  async function handleGoogle(cr) {
    setErr(''); setBusy(true);
    try { await loginWithGoogle(cr.credential); }
    catch (ex) { setErr(ex.response?.data?.error || T.errGoogle); }
    setBusy(false);
  }

  const strengthColor = ['','#ef4444','#f59e0b','#22c55e','#10b981'];

  /* ── Dark glassmorphism style objects ── */
  const pillBase   = { padding:'5px 13px', borderRadius:999, fontSize:11.5, fontWeight:800, cursor:'pointer', userSelect:'none', transition:'all 0.2s' };
  const activePill = { ...pillBase, background:'linear-gradient(120deg,#7c3aed,#a855f7)', color:'#fff' };
  const idlePill   = { ...pillBase, background:'transparent', color:'#9a8fc4' };

  const tabBase   = { fontSize:16, fontWeight:800, cursor:'pointer', paddingBottom:14, marginBottom:-1.5, border:'none', background:'none', fontFamily:"'Nunito',sans-serif", transition:'color 0.2s, border-color 0.2s', letterSpacing:'-0.3px' };
  const activeTab = { ...tabBase, color:'#fff',    borderBottom:'3px solid #a855f7' };
  const idleTab   = { ...tabBase, color:'#7c7299', borderBottom:'3px solid transparent' };

  const boxBase    = { width:20, height:20, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' };
  const checkedBox = { ...boxBase, background:'linear-gradient(120deg,#7c3aed,#a855f7)', border:'1px solid #a855f7', boxShadow:'0 0 8px rgba(168,85,247,0.4)' };
  const emptyBox   = { ...boxBase, background:'rgba(15,10,34,0.55)', border:'1.5px solid rgba(150,120,220,0.3)' };

  const checkSvg = (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
  );

  const ICO = '#9a8cc8';
  const IconUser = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ICO} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>;
  const IconMail = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ICO} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
  const IconLock = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ICO} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
  const IconEye  = (open) => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7c7299" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  );

  return (
    <div className="login-root" style={{ position:'fixed', inset:0, background:'#07041a', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', fontFamily:"'Nunito',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        ::placeholder { color:#9a94b5 !important; opacity:1 !important; }
        input { font-family:'Nunito',sans-serif !important; }

        /* Hide browser-native icons that overlap our custom ones
           (Safari/Edge password-reveal, autofill contact/credential buttons) */
        input::-ms-reveal, input::-ms-clear { display:none; }
        input::-webkit-contacts-auto-fill-button,
        input::-webkit-credentials-auto-fill-button,
        input::-webkit-strong-password-auto-fill-button {
          visibility:hidden !important; display:none !important;
          pointer-events:none !important; position:absolute !important; right:0;
        }
        input::-webkit-caps-lock-indicator { display:none !important; }
        /* Kill autofill yellow/white background that hides icons */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color:#1a1235 !important;
          -webkit-box-shadow:0 0 0 1000px #ffffff inset !important;
          caret-color:#7c3aed !important;
          transition:background-color 9999s ease-in-out 0s;
        }

        .vi {
          width:100%; height:54px; padding:0 18px;
          background:#ffffff; border:1.5px solid rgba(130,100,200,0.3);
          border-radius:14px; color:#1a1235; -webkit-text-fill-color:#1a1235; font-size:15px; font-weight:600;
          outline:none; box-sizing:border-box; caret-color:#7c3aed;
          transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .vi:focus { border-color:#a855f7; box-shadow:0 0 0 3px rgba(139,92,246,0.18); background:#ffffff; }
        .vi.pr { padding-right:46px; }

        .sb {
          flex:1; height:52px;
          display:flex; align-items:center; justify-content:center; gap:9px;
          background:rgba(13,8,32,0.5); border:1.5px solid rgba(130,100,200,0.22);
          border-radius:14px; cursor:pointer; position:relative; overflow:hidden; user-select:none;
          color:#e2dcf5; font-size:14.5px; font-weight:700; font-family:'Nunito',sans-serif;
          transition:background 0.18s, border-color 0.18s, transform 0.15s;
        }
        .sb:hover { background:rgba(32,20,64,0.85); border-color:rgba(168,85,247,0.4); transform:translateY(-1px); }
        .sb:active { transform:translateY(0); }

        .submit-btn {
          width:100%; height:56px; border:none; border-radius:15px; margin-top:6px;
          background:linear-gradient(110deg,#7c3aed,#a855f7,#7c3aed); background-size:200% 100%;
          color:#fff; font-family:'Nunito',sans-serif; font-size:17px; font-weight:800;
          cursor:pointer; box-shadow:0 10px 28px rgba(124,58,237,0.45);
          display:flex; align-items:center; justify-content:center; gap:9px;
          transition:background-position 0.4s, box-shadow 0.2s, transform 0.15s, opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) { background-position:100% 0; box-shadow:0 14px 36px rgba(124,58,237,0.6); transform:translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }

        .tab-btn:hover { color:#c4b5fd !important; }
        .lang-pill:hover { opacity:0.85; }
        .link-purple:hover { opacity:0.8; }

        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }

        /* Утсан дэлгэц дээр 1672×941 stage-ийг жижигрүүлж хиймэл "PC горим" болгохын оронд
           энгийн, дэлгэц дүүрэн, доош урсдаг байдлаар харуулна. */
        @media (max-width: 768px) {
          .login-root { position:static !important; overflow-y:auto !important; min-height:100vh; height:auto !important; padding:24px 18px !important; }
          .login-stage { transform:none !important; width:100% !important; height:auto !important; background-image:none !important; }
          .login-card { position:relative !important; left:auto !important; top:auto !important; width:100% !important; max-width:440px !important; min-height:auto !important; margin:0 auto !important; padding:28px 22px !important; }
        }
      `}</style>

      {/* ── Stage 1672×941 ── */}
      <div ref={stageRef} className="login-stage" style={{
        position:'relative', width:STAGE_W, height:STAGE_H, flexShrink:0,
        transformOrigin:'center center',
        backgroundImage:'url(/login-bg3.png)',
        backgroundSize:'cover', backgroundPosition:'center',
      }}>

        {/* ── Dark auth card — covers artwork card at left:985 top:90 w:648 h:770 ── */}
        <div className="login-card" style={{
          position:'absolute', left:985, top:88, width:650, minHeight:772,
          background:'linear-gradient(160deg,rgba(34,22,64,0.86),rgba(20,12,42,0.9))',
          backdropFilter:'blur(30px)', WebkitBackdropFilter:'blur(30px)',
          border:'1.5px solid rgba(168,140,255,0.15)',
          borderRadius:28,
          padding:'34px 46px 30px',
          boxShadow:'0 32px 80px rgba(6,2,20,0.6),0 2px 0 rgba(168,140,255,0.08) inset',
          display:'flex', flexDirection:'column',
        }}>
          {/* Top accent */}
          <div style={{ position:'absolute', top:0, left:'18%', right:'18%', height:2, borderRadius:2, background:'linear-gradient(90deg,transparent,rgba(168,85,247,0.75),rgba(99,102,241,0.5),transparent)' }} />

          {/* Language toggle */}
          <div style={{ position:'absolute', top:24, right:30, display:'flex', gap:3, background:'rgba(10,6,28,0.6)', border:'1.5px solid rgba(140,110,220,0.2)', borderRadius:999, padding:'3px 4px' }}>
            <div onClick={() => setLang('mn')} className="lang-pill" style={lang==='mn' ? activePill : idlePill}>MN</div>
            <div onClick={() => setLang('en')} className="lang-pill" style={lang==='en' ? activePill : idlePill}>EN</div>
          </div>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(145deg,#8b5cf6,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 16px rgba(139,92,246,0.45)' }}>
              <span style={{ fontWeight:900, fontSize:25, color:'#fff', lineHeight:1 }}>V</span>
            </div>
            <span style={{ fontWeight:900, fontSize:27, color:'#fff', letterSpacing:'0.5px' }}>VOCA</span>
          </div>

          {/* Title */}
          <h1 style={{ margin:'0 0 6px', fontSize:30, fontWeight:900, color:'#fff', letterSpacing:'-0.6px', lineHeight:1.2 }}>
            {T.welcome} <span style={{ color:'#fbbf24', fontSize:26 }}>✨</span>
          </h1>
          <p style={{ margin:'0 0 22px', fontSize:15, color:'#a195cc', lineHeight:1.5, fontWeight:500 }}>{T.subtitle}</p>

          {/* Tabs */}
          <div style={{ display:'flex', gap:36, borderBottom:'1.5px solid rgba(120,90,190,0.18)', marginBottom:24 }}>
            <button className="tab-btn" onClick={() => { setTab('login');    setErr(''); }} style={isLogin  ? activeTab : idleTab}>{T.tabLogin}</button>
            <button className="tab-btn" onClick={() => { setTab('register'); setErr(''); }} style={!isLogin ? activeTab : idleTab}>{T.tabReg}</button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {!isLogin && (
              <div style={{ position:'relative' }}>
                <input className="vi" type="text" placeholder={T.name} value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}

            <div style={{ position:'relative' }}>
              <input className="vi" type="text" placeholder={T.email} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <div style={{ position:'relative' }}>
                <input className="vi pr" type={showPw ? 'text' : 'password'} placeholder={T.password} value={pw}
                  onChange={e => { setPw(e.target.value); if (!isLogin) setPwScore(scorePw(e.target.value)); }} required />
                <span onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer', display:'flex', opacity:0.75 }}>{IconEye(showPw)}</span>
              </div>
              {!isLogin && pw.length > 0 && (
                <div style={{ marginTop:9, display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ flex:1, display:'flex', gap:4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i <= pwScore ? strengthColor[pwScore] : 'rgba(150,120,220,0.18)', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11.5, color: strengthColor[pwScore] || '#7d72a6', fontWeight:700, minWidth:72, textAlign:'right' }}>{T.pwHint[pwScore]}</span>
                </div>
              )}
            </div>

            {!isLogin && (
              <div style={{ position:'relative' }}>
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
                  <span style={{ fontSize:14, color:'#c4bae0', fontWeight:600 }}>{T.remember}</span>
                </div>
                <span onClick={handleForgot} className="link-purple" style={{ fontSize:14, color:'#b08cff', cursor:'pointer', fontWeight:700 }}>{T.forgot}</span>
              </div>
            )}

            {!isLogin && (
              <div onClick={() => setTerms(v => !v)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', margin:'2px 0' }}>
                <div style={terms ? checkedBox : emptyBox}>{terms && checkSvg}</div>
                <span style={{ fontSize:13.5, color:'#c4bae0', fontWeight:600, lineHeight:1.4 }}>{T.terms}</span>
              </div>
            )}

            {err && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:9, background:'rgba(239,68,68,0.08)', border:'1.5px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'10px 14px' }}>
                <span style={{ fontSize:15, flexShrink:0 }}>⚠️</span>
                <span style={{ color:'#fca5a5', fontWeight:700, fontSize:13, lineHeight:1.4 }}>{err}</span>
              </div>
            )}

            <button type="submit" disabled={busy} className="submit-btn">
              {busy
                ? <><div className="spinner" /> {isLogin ? T.tabLogin : T.tabReg}...</>
                : <>{isLogin ? T.tabLogin : T.tabReg} <span style={{ color:'#fde68a', fontSize:18 }}>✨</span></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:14, margin:'22px 0 18px' }}>
            <div style={{ flex:1, height:1, background:'rgba(130,100,200,0.2)' }} />
            <span style={{ fontSize:13, color:'#7d72a6', fontWeight:600 }}>{T.or}</span>
            <div style={{ flex:1, height:1, background:'rgba(130,100,200,0.2)' }} />
          </div>

          {/* Social — Google only */}
          <div style={{ display:'flex' }}>
            <div className="sb">
              <svg width="19" height="19" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
              {isLogin ? T.google[0] : T.google[1]}
              <div style={{ position:'absolute', inset:0, opacity:0, overflow:'hidden', borderRadius:14, zIndex:1 }}>
                <GoogleLogin onSuccess={handleGoogle} onError={() => setErr(T.errGoogle)} width="560" size="large" shape="rectangular" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign:'center', margin:'auto 0 0', paddingTop:22, fontSize:14, color:'#a195cc', fontWeight:500 }}>
            {isLogin ? T.ftxt[0] : T.ftxt[1]}{' '}
            <span className="link-purple" onClick={() => { setTab(isLogin ? 'register' : 'login'); setErr(''); }}
              style={{ color:'#b08cff', fontWeight:800, cursor:'pointer' }}>
              {isLogin ? T.flnk[0] : T.flnk[1]}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
