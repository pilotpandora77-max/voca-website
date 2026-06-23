'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { GoogleLogin } from '@react-oauth/google';

const FEATURES = [
  { icon: '🏆', title: 'Тоглоомоор суралц', desc: 'Сонирхолтой тоглоомуул, сорилтуудыг дavan, шинэ үгсийг хялбархан цээжил.' },
  { icon: '👥', title: 'Нийгэмдээ нэгд',    desc: 'Бусадтай харилцаж, мэдлэгээ хуваалцаж, хамтдаа өсэж дэвшээрэй.' },
  { icon: '👑', title: 'Эрэмбэнд тэргүүл',  desc: 'Оноо цуглуулж, эрэмбэнд авирч, шилдэг хэрэглэгч болоорой.' },
];

const STATS = [
  { val: '120K+', label: 'Хэрэглэгч',                   icon: '👥' },
  { val: '50+',   label: 'Тоглоом',                      icon: '🎮' },
  { val: '10K+',  label: 'Өдөр тутмын идэвхтэй хэрэглэгч', icon: '🏆' },
];

const TILES = [
  { char: '学', x: '62%', y: '22%', rot: -12, size: 52 },
  { char: '語', x: '78%', y: '48%', rot: 8,   size: 48 },
];

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}

function LoginInner() {
  const { login, register, loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const [tab, setTab]         = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [username, setUser]   = useState('');
  const [showPass, setShowP]  = useState(false);
  const [err, setErr]         = useState('');
  const [loading, setLoad]    = useState(false);

  useEffect(() => {
    if (searchParams?.get('tab') === 'register') setTab('register');
  }, [searchParams]);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoad(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#08051A', fontFamily: 'inherit' }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0D0620 0%, #1A0838 45%, #120528 100%)',
        display: 'flex', flexDirection: 'column', padding: '32px 36px',
      }} className="auth-left">

        {/* Stars */}
        {[...Array(35)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 37 + 11) % 95}%`, top: `${(i * 53 + 7) % 92}%`,
            width: i % 7 === 0 ? 3.5 : i % 3 === 0 ? 2 : 1.2,
            height: i % 7 === 0 ? 3.5 : i % 3 === 0 ? 2 : 1.2,
            borderRadius: '50%', background: 'rgba(255,255,255,0.7)',
            animation: `twinkle ${2.5 + (i % 4) * 0.8}s ease-in-out ${(i * 0.25) % 2.5}s infinite`,
          }} />
        ))}

        {/* Center glow behind mascot */}
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(109,40,217,0.12) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

        {/* Top-left glow */}
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', top: -80, left: -80, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Bottom shadow ground */}
        <div style={{ position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)', width: 220, height: 28, borderRadius: '50%', background: 'rgba(88,28,135,0.45)', filter: 'blur(14px)', animation: 'shadow-pulse 4s ease-in-out infinite', zIndex: 1 }} />

        {/* Floating hanzi tiles */}
        {TILES.map((t, i) => (
          <div key={i} style={{
            position: 'absolute', left: t.x, top: t.y,
            width: t.size + 14, height: t.size + 14,
            background: 'rgba(109,40,217,0.25)',
            border: '1.5px solid rgba(167,139,250,0.4)',
            backdropFilter: 'blur(12px)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: t.size * 0.7, fontWeight: 900, color: '#DDD6FE',
            transform: `rotate(${t.rot}deg)`,
            animation: `tile-float ${4 + i * 1.5}s ease-in-out ${i * 1.2}s infinite`,
            boxShadow: '0 8px 32px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            zIndex: 3,
          }}>{t.char}</div>
        ))}

        {/* Small gold planet */}
        <div style={{ position: 'absolute', top: '16%', left: '15%', width: 22, height: 22, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FCD34D, #D97706)', boxShadow: '0 0 16px rgba(251,191,36,0.5)', animation: 'planet-float 5s ease-in-out 0.5s infinite', zIndex: 3 }} />
        {/* Tiny dot */}
        <div style={{ position: 'absolute', top: '30%', right: '22%', width: 8, height: 8, borderRadius: '50%', background: 'rgba(167,139,250,0.6)', animation: 'planet-float 3.5s ease-in-out 1s infinite', zIndex: 3 }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 4, marginBottom: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 900, color: '#fff', boxShadow: '0 4px 16px rgba(124,58,237,0.5)' }}>V</div>
          <span style={{ fontSize: 21, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>voca</span>
        </div>

        {/* MASCOT — center hero */}
        <div style={{
          position: 'absolute', left: '50%', top: '46%',
          transform: 'translate(-50%, -50%)',
          animation: 'mascot-float 4s ease-in-out infinite',
          zIndex: 2,
          filter: 'drop-shadow(0 24px 60px rgba(88,28,135,0.7)) drop-shadow(0 0 40px rgba(139,92,246,0.4))',
        }}>
          <img src="/mascot.png" alt="Voca mascot" style={{ width: 300, height: 'auto', display: 'block', mixBlendMode: 'screen' }} />
        </div>

        {/* Bottom text overlay */}
        <div style={{ position: 'relative', zIndex: 4, marginTop: 'auto' }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 8, letterSpacing: -0.8 }}>
            <span style={{ color: '#A78BFA' }}>Үгтэй</span> бол хүчтэй ⚡
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, fontWeight: 500, lineHeight: 1.6 }}>
            Voca-д нэгдэж, үгийн сангаа өргөжүүлж, дэлхийн хаанаас ч өрсөлдөөрэй!
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{f.icon}</div>
                <span style={{ fontWeight: 700, color: '#C4B5FD', fontSize: 12 }}>{f.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', gap: 0,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '14px 16px', textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 16, letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 40px', background: '#0F0826',
        borderLeft: '1px solid rgba(124,58,237,0.2)',
        position: 'relative', zIndex: 1, overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 5 }}>
            Voca-д тавтай морил!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
            Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлэрэй.
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
            {[{ key: 'login', label: 'Нэвтрэх' }, { key: 'register', label: 'Бүртгүүлэх' }].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setErr(''); }} style={{
                flex: 1, padding: '11px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'inherit',
                color: tab === t.key ? '#A78BFA' : 'rgba(255,255,255,0.35)',
                borderBottom: tab === t.key ? '2px solid #7C3AED' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tab === 'register' && (
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
                <input type="text" value={username} onChange={e => setUser(e.target.value)}
                  placeholder="Нэвтрэх нэр" required
                  style={{ paddingLeft: 42, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12 }} />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="И-мэйл эсвэл утасны дугаар" required
                style={{ paddingLeft: 42, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12 }} />
            </div>

            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)}
                placeholder="Нууц үг" required
                style={{ paddingLeft: 42, paddingRight: 44, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12 }} />
              <button type="button" onClick={() => setShowP(p => !p)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,0.4)', padding: 4,
              }}>{showPass ? '🙈' : '👁'}</button>
            </div>

            {tab === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#7C3AED', width: 15, height: 15 }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Намайг сана</span>
                </label>
                <span style={{ fontSize: 13, color: '#A78BFA', fontWeight: 700, cursor: 'pointer' }}>Нууц үгээ мартсан уу?</span>
              </div>
            )}

            {err && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#FCA5A5', fontWeight: 700, fontSize: 13 }}>
                ⚠️ {err}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', fontSize: 15, fontWeight: 800,
              borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: '#fff', letterSpacing: 0.3, fontFamily: 'inherit',
              boxShadow: '0 8px 24px rgba(124,58,237,0.4)', transition: 'all 0.2s',
            }}>
              {loading ? (tab === 'login' ? 'Нэвтэрч байна...' : 'Бүртгэж байна...') : (tab === 'login' ? 'Нэвтрэх ✨' : 'Бүртгүүлэх ✨')}
            </button>
          </form>

          {/* Social login */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }}>эсвэл</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* Google */}
            <div style={{ flex: 1, overflow: 'hidden', borderRadius: 12 }}>
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setErr('Google нэвтрэлт амжилтгүй')}
                text={tab === 'login' ? 'signin_with' : 'signup_with'}
                shape="rectangular" size="large" width="200" locale="mn" theme="filled_black"
              />
            </div>
            {/* Facebook placeholder */}
            <button disabled style={{
              flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(24,119,242,0.12)', color: 'rgba(255,255,255,0.4)', fontWeight: 700,
              fontSize: 13, cursor: 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            {/* Apple placeholder */}
            <button disabled style={{
              flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontWeight: 700,
              fontSize: 13, cursor: 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="14" height="16" viewBox="0 0 814 1000" fill="rgba(255,255,255,0.5)"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-166.2-112.4C18.3 663.4 0 564.4 0 486.3c0-238.1 155.7-364.3 308.4-364.3 79.8 0 146.4 52.5 194.5 52.5 46.6 0 120.3-55.4 209.2-55.4zm-7.3-142.4c31.4-35.3 54.2-84.6 54.2-133.9 0-6.9-.5-13.9-1.7-19.5-51.6 1.8-112.6 34.5-149.2 74.1-28.5 30.8-55.4 80.1-55.4 130.1 0 7.4 1.3 14.8 1.8 17.3 3.1.5 8.2 1.3 13.3 1.3 46.6 0 103.4-31.4 136.9-69.5z"/></svg>
              Apple
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 22, color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 500 }}>
            {tab === 'login' ? 'Voca-г анх удаа ашиглаж байна уу? ' : 'Бүртгэл байгаа юу? '}
            <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErr(''); }} style={{
              background: 'none', border: 'none', color: '#A78BFA', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit', padding: 0,
            }}>
              {tab === 'login' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-left { display: flex; }
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
        @keyframes planet-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes tile-float {
          0%, 100% { transform: rotate(var(--rot, -12deg)) translateY(0px); }
          50%       { transform: rotate(var(--rot, -12deg)) translateY(-10px); }
        }
        @keyframes mascot-float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50%       { transform: translate(-50%, -50%) translateY(-18px); }
        }
        @keyframes shadow-pulse {
          0%, 100% { opacity: 0.45; transform: translateX(-50%) scaleX(1); }
          50%       { opacity: 0.2;  transform: translateX(-50%) scaleX(0.7); }
        }
        input::placeholder { color: rgba(255,255,255,0.3) !important; }
        @media (max-width: 768px) { .auth-left { display: none !important; } }
      `}</style>
    </div>
  );
}
