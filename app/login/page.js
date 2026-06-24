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

  const FEATURES = [
    { icon: '🏆', title: 'Тоглоомоор суралц', desc: 'Сонирхолтой тоглоомуул, шинэ үгсийг хялбархан цээжил.', color: '#A78BFA', border: 'rgba(167,139,250,0.25)', bg: 'rgba(109,40,217,0.18)' },
    { icon: '👥', title: 'Нийгэмдээ нэгд',    desc: 'Бусадтай харилцаж, хамтдаа өсөж дэвшээрэй.',           color: '#67E8F9', border: 'rgba(103,232,249,0.2)',  bg: 'rgba(8,145,178,0.15)' },
    { icon: '👑', title: 'Эрэмбэнд тэргүүл', desc: 'Оноо цуглуулж, шилдэг хэрэглэгч болоорой.',             color: '#FCD34D', border: 'rgba(252,211,77,0.25)',  bg: 'rgba(180,83,9,0.18)' },
  ];

  const STATS = [
    { val: '120K+', label: 'Хэрэглэгч',        icon: '👥' },
    { val: '50+',   label: 'Тоглоом',            icon: '🎮' },
    { val: '10K+',  label: 'Өдөр тутмын идэвхтэй', icon: '🏆' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#030111', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ═══ COSMIC BACKGROUND ═══ */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Nebula blobs */}
        <div style={{ position: 'absolute', top: '-20%', left: '-12%', width: '70%', height: '80%', background: 'radial-gradient(ellipse, rgba(109,40,217,0.45) 0%, rgba(76,29,149,0.2) 45%, transparent 70%)', filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: '-25%', right: '-15%', width: '65%', height: '75%', background: 'radial-gradient(ellipse, rgba(49,10,101,0.55) 0%, rgba(30,5,60,0.2) 45%, transparent 70%)', filter: 'blur(110px)' }} />
        <div style={{ position: 'absolute', top: '25%', right: '15%', width: '50%', height: '55%', background: 'radial-gradient(ellipse, rgba(8,145,178,0.1) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '40%', transform: 'translate(-50%,-50%)', width: '40%', height: '40%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        {/* Subtle grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 43 + 13) % 99}%`, top: `${(i * 61 + 9) % 97}%`,
            width: i % 9 === 0 ? 3 : i % 4 === 0 ? 2 : 1,
            height: i % 9 === 0 ? 3 : i % 4 === 0 ? 2 : 1,
            borderRadius: '50%',
            background: i % 6 === 0 ? 'rgba(196,181,253,0.9)' : i % 7 === 0 ? 'rgba(103,232,249,0.7)' : 'rgba(255,255,255,0.65)',
            animation: `twinkle ${2.2 + (i % 5) * 0.55}s ease-in-out ${(i * 0.19) % 3}s infinite`,
          }} />
        ))}
      </div>

      {/* ═══ TOP NAV ═══ */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 52px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 900, color: '#fff', boxShadow: '0 4px 20px rgba(59,130,246,0.5)' }}>+</div>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>voca</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 14px', cursor: 'pointer', backdropFilter: 'blur(12px)' }}>
            <span style={{ fontSize: 14 }}>🌐</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>Монгол</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>▼</span>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(12px)', fontSize: 17 }}>🌙</div>
        </div>
      </nav>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '16px 52px 32px', gap: 52, position: 'relative', zIndex: 1 }}>

        {/* ── LEFT: Hero content ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Title */}
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 14, letterSpacing: -2 }}>
            <span style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 40%, #67E8F9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Үгтэй</span>
            {' '}бол<br />хүчтэй ⚡
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', fontWeight: 500, lineHeight: 1.75, marginBottom: 32, maxWidth: 400 }}>
            Voca-д нэгдэж, үгийн сангаа өргөжүүлж,<br />дэлхийн хаанаас ч өрсөлдөөрэй!
          </p>

          {/* Feature cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                flex: 1, padding: '18px 16px', borderRadius: 18,
                background: f.bg, border: `1px solid ${f.border}`,
                backdropFilter: 'blur(14px)',
                boxShadow: `0 4px 24px ${f.border}`,
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: f.color, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* 3D Mascot hero */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flex: 1, minHeight: 260 }}>
            {/* Orbit ring 1 */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 380, height: 120, transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid rgba(139,92,246,0.2)', animation: 'orbit-spin 12s linear infinite' }} />
            {/* Orbit ring 2 */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 320, height: 90, transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid rgba(103,232,249,0.12)', animation: 'orbit-spin 8s linear infinite reverse' }} />

            {/* Glow aura */}
            <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', width: 340, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, rgba(88,28,135,0.2) 50%, transparent 70%)', filter: 'blur(30px)', animation: 'glow-pulse 4s ease-in-out infinite' }} />

            {/* Ground shadow */}
            <div style={{ position: 'absolute', bottom: '2%', left: '50%', width: 280, height: 30, borderRadius: '50%', background: 'rgba(88,28,135,0.65)', filter: 'blur(20px)', animation: 'shadow-3d 6s ease-in-out infinite', zIndex: 0 }} />

            {/* Character with 3D animation */}
            <div style={{ animation: 'mascot-3d 6s ease-in-out infinite', position: 'relative', zIndex: 2 }}>
              <img
                src="/login-hero.png"
                alt="Voca mascot"
                style={{
                  width: 400, height: 'auto', display: 'block',
                  filter: 'drop-shadow(0 40px 80px rgba(139,92,246,0.9)) drop-shadow(0 0 80px rgba(88,28,135,0.7)) drop-shadow(0 -10px 40px rgba(103,232,249,0.15))',
                }}
              />
            </div>

            {/* Floating sparkle particles */}
            {[
              { x: '18%', y: '30%', size: 8, delay: '0s', color: '#A78BFA' },
              { x: '78%', y: '20%', size: 6, delay: '1.2s', color: '#67E8F9' },
              { x: '85%', y: '65%', size: 5, delay: '0.7s', color: '#FCD34D' },
              { x: '10%', y: '70%', size: 7, delay: '2s',   color: '#A78BFA' },
              { x: '65%', y: '10%', size: 5, delay: '1.5s', color: '#67E8F9' },
            ].map((p, i) => (
              <div key={i} style={{
                position: 'absolute', left: p.x, top: p.y,
                width: p.size, height: p.size, borderRadius: '50%',
                background: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                animation: `sparkle 3s ease-in-out ${p.delay} infinite`,
                zIndex: 3,
              }} />
            ))}
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(12px)', marginTop: 12 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '15px 10px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: 20, letterSpacing: -0.5 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.33)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Glass form card ── */}
        <div style={{
          width: 460, flexShrink: 0,
          background: 'rgba(10,5,30,0.78)',
          backdropFilter: 'blur(44px)',
          borderRadius: 28,
          border: '1px solid rgba(139,92,246,0.22)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 100px rgba(109,40,217,0.2), 0 60px 80px rgba(0,0,0,0.55)',
          padding: '44px 40px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.9), rgba(103,232,249,0.5), transparent)' }} />
          {/* Corner glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: -0.5 }}>Voca-д тавтай морил!</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 500, marginBottom: 28 }}>Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлэрэй.</p>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, marginBottom: 26, border: '1px solid rgba(255,255,255,0.07)' }}>
            {[{ key: 'login', label: 'Нэвтрэх' }, { key: 'register', label: 'Бүртгүүлэх' }].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setErr(''); }} style={{
                flex: 1, padding: '10px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                background: tab === t.key ? 'linear-gradient(135deg, rgba(109,40,217,0.7), rgba(88,28,135,0.5))' : 'none',
                border: tab === t.key ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
                borderRadius: 10, fontFamily: 'inherit',
                color: tab === t.key ? '#DDD6FE' : 'rgba(255,255,255,0.3)',
                boxShadow: tab === t.key ? '0 4px 20px rgba(109,40,217,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              <input className="auth-input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)} placeholder="Нууц үг" required style={{ paddingRight: 46 }} />
              <button type="button" onClick={() => setShowP(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,0.3)', padding: 4 }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>

            {tab === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#7C3AED', width: 15, height: 15 }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Намайг сана</span>
                </label>
                <span style={{ fontSize: 13, color: '#A78BFA', fontWeight: 700, cursor: 'pointer' }}>Нууц үгээ мартсан уу?</span>
              </div>
            )}

            {err && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 14px', color: '#FCA5A5', fontWeight: 700, fontSize: 13 }}>
                ⚠️ {err}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '15px', fontSize: 15, fontWeight: 900,
              borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(109,40,217,0.4)' : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #4C1D95 100%)',
              color: '#fff', letterSpacing: 0.4, fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 8px 32px rgba(109,40,217,0.55), 0 0 0 1px rgba(167,139,250,0.2) inset',
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}>
              <span style={{ position: 'relative', zIndex: 1 }}>
                {loading ? (tab === 'login' ? 'Нэвтэрч байна...' : 'Бүртгэж байна...') : (tab === 'login' ? 'Нэвтрэх ✨' : 'Бүртгүүлэх ✨')}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 600 }}>эсвэл</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, overflow: 'hidden', borderRadius: 12 }}>
              <GoogleLogin onSuccess={handleGoogle} onError={() => setErr('Google нэвтрэлт амжилтгүй')} text={tab === 'login' ? 'signin_with' : 'signup_with'} shape="rectangular" size="large" width="200" locale="mn" theme="filled_black" />
            </div>
            <button disabled style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(24,119,242,0.1)', color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13, cursor: 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </button>
            <button disabled style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13, cursor: 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <svg width="13" height="16" viewBox="0 0 814 1000" fill="rgba(255,255,255,0.85)"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-166.2-112.4C18.3 663.4 0 564.4 0 486.3c0-238.1 155.7-364.3 308.4-364.3 79.8 0 146.4 52.5 194.5 52.5 46.6 0 120.3-55.4 209.2-55.4zm-7.3-142.4c31.4-35.3 54.2-84.6 54.2-133.9 0-6.9-.5-13.9-1.7-19.5-51.6 1.8-112.6 34.5-149.2 74.1-28.5 30.8-55.4 80.1-55.4 130.1 0 7.4 1.3 14.8 1.8 17.3 3.1.5 8.2 1.3 13.3 1.3 46.6 0 103.4-31.4 136.9-69.5z" /></svg>
              Apple
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 22, color: 'rgba(255,255,255,0.25)', fontSize: 13, fontWeight: 500 }}>
            {tab === 'login' ? 'Voca-г анх удаа ашиглаж байна уу? ' : 'Бүртгэл байгаа юу? '}
            <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErr(''); }} style={{ background: 'none', border: 'none', color: '#A78BFA', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              {tab === 'login' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
            </button>
          </p>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 52px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>© 2024 Voca. Бүх эрх хуулиар хамгаалагдсан.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, cursor: 'pointer' }}>Үйлчилгээний нөхцөл</span>
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, cursor: 'pointer' }}>Нууцлалын бодлого</span>
        </div>
      </div>

      <style>{`
        .auth-left { display: flex; }
        .input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 16px; color: rgba(255,255,255,0.3); pointer-events: none; z-index: 1;
        }
        .auth-input {
          width: 100%; padding: 14px 14px 14px 44px;
          font-size: 14px; font-family: inherit; outline: none; box-sizing: border-box;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; border-radius: 13px; transition: all 0.2s;
        }
        .auth-input:focus {
          border-color: rgba(139,92,246,0.6);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(109,40,217,0.15);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.22); }

        @keyframes twinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.7); }
        }
        @keyframes mascot-3d {
          0%   { transform: perspective(900px) rotateY(-10deg) rotateX(5deg)  translateY(0px);   }
          20%  { transform: perspective(900px) rotateY(-3deg)  rotateX(-2deg) translateY(-22px); }
          40%  { transform: perspective(900px) rotateY(8deg)   rotateX(4deg)  translateY(-14px); }
          60%  { transform: perspective(900px) rotateY(4deg)   rotateX(-3deg) translateY(-26px); }
          80%  { transform: perspective(900px) rotateY(-6deg)  rotateX(2deg)  translateY(-10px); }
          100% { transform: perspective(900px) rotateY(-10deg) rotateX(5deg)  translateY(0px);   }
        }
        @keyframes shadow-3d {
          0%, 100% { transform: translateX(-50%) scaleX(1);    opacity: 0.55; }
          40%       { transform: translateX(-50%) scaleX(0.72); opacity: 0.25; }
          60%       { transform: translateX(-50%) scaleX(0.65); opacity: 0.18; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1);    }
          50%       { opacity: 1;   transform: translateX(-50%) scale(1.2);  }
        }
        @keyframes orbit-spin {
          from { transform: translate(-50%, -50%) rotateZ(0deg) rotateX(75deg); }
          to   { transform: translate(-50%, -50%) rotateZ(360deg) rotateX(75deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5) translateY(0px); }
          30%       { opacity: 1; transform: scale(1.2) translateY(-8px); }
          70%       { opacity: 0.6; transform: scale(0.9) translateY(-14px); }
        }
        @media (max-width: 900px) { .auth-left { display: none !important; } }
      `}</style>
    </div>
  );
}
