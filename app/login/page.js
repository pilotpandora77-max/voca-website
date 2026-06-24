'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { GoogleLogin } from '@react-oauth/google';

const FEATURES = [
  {
    icon: '🏆',
    title: 'Тоглоомоор суралц',
    desc: 'Сонирхолтой тоглоомуул, сорилтуудыг дavan, шинэ үгсийг хялбархан цээжил.',
    iconBg: 'rgba(109,40,217,0.35)',
    iconBorder: 'rgba(167,139,250,0.3)',
    titleColor: '#A78BFA',
  },
  {
    icon: '👥',
    title: 'Нийгэмдээ нэгд',
    desc: 'Бусадтай харилцаж, мэдлэгээ хуваалцаж, хамтдаа өсэж дэвшээрэй.',
    iconBg: 'rgba(59,130,246,0.2)',
    iconBorder: 'rgba(96,165,250,0.3)',
    titleColor: '#A78BFA',
  },
  {
    icon: '👑',
    title: 'Эрэмбэнд тэргүүл',
    desc: 'Оноо цуглуулж, эрэмбэнд авирч, шилдэг хэрэглэгч болоорой.',
    iconBg: 'rgba(245,158,11,0.2)',
    iconBorder: 'rgba(251,191,36,0.3)',
    titleColor: '#FCD34D',
  },
];

const STATS = [
  { val: '120K+', label: 'Хэрэглэгч', icon: '👥' },
  { val: '50+', label: 'Тоглоом', icon: '🎮' },
  { val: '10K+', label: 'Өдөр тутмын идэвхтэй хэрэглэгч', icon: '🏆' },
];

const TILES = [
  { char: '学', x: '63%', y: '10%', rot: -12, size: 54 },
  { char: '語', x: '80%', y: '42%', rot: 10, size: 48 },
];

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}

function LoginInner() {
  const { login, register, loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const [tab, setTab]        = useState('login');
  const [email, setEmail]    = useState('');
  const [password, setPass]  = useState('');
  const [username, setUser]  = useState('');
  const [showPass, setShowP] = useState(false);
  const [err, setErr]        = useState('');
  const [loading, setLoad]   = useState(false);

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
    <div style={{ minHeight: '100vh', background: '#08051A', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top navbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#fff',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
          }}>+</div>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>voca</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '7px 14px', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 14 }}>🌐</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>Монгол</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>▼</span>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16,
          }}>🌙</div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 24px' }}>
        <div style={{
          display: 'flex', width: '100%', maxWidth: 1120,
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          minHeight: 660,
        }}>

          {/* ── Left panel ── */}
          <div className="auth-left" style={{
            flex: 1, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(160deg, #0A0420 0%, #1C0A44 40%, #130535 75%, #0E0328 100%)',
            display: 'flex', flexDirection: 'column', padding: '40px 36px',
          }}>

            {/* Stars */}
            {[...Array(42)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${(i * 37 + 11) % 95}%`, top: `${(i * 53 + 7) % 92}%`,
                width: i % 7 === 0 ? 3 : i % 3 === 0 ? 1.8 : 1,
                height: i % 7 === 0 ? 3 : i % 3 === 0 ? 1.8 : 1,
                borderRadius: '50%', background: 'rgba(255,255,255,0.75)',
                animation: `twinkle ${2.5 + (i % 4) * 0.8}s ease-in-out ${(i * 0.25) % 2.5}s infinite`,
              }} />
            ))}

            {/* Large ambient purple glow (right side, behind mascot) */}
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '20%', right: '-15%', background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(109,40,217,0.12) 45%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

            {/* Golden ground glow (mascot landing area) */}
            <div style={{ position: 'absolute', bottom: '17%', left: '38%', width: 320, height: 100, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(251,191,36,0.55) 0%, rgba(245,158,11,0.25) 45%, transparent 100%)', filter: 'blur(22px)', zIndex: 1 }} />
            {/* Secondary purple glow under ground */}
            <div style={{ position: 'absolute', bottom: '12%', left: '35%', width: 380, height: 80, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)', filter: 'blur(28px)', zIndex: 1 }} />

            {/* 学 tile — top right */}
            <div style={{
              position: 'absolute', right: '14%', top: '7%',
              width: 72, height: 72,
              background: 'rgba(109,40,217,0.35)', border: '1.5px solid rgba(167,139,250,0.45)',
              backdropFilter: 'blur(14px)', borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38, fontWeight: 900, color: '#DDD6FE',
              transform: 'rotate(-14deg)',
              animation: 'tile-float 4s ease-in-out 0s infinite',
              boxShadow: '0 10px 36px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              zIndex: 3,
            }}>学</div>

            {/* 語 tile — right middle */}
            <div style={{
              position: 'absolute', right: '3%', top: '43%',
              width: 64, height: 64,
              background: 'rgba(109,40,217,0.32)', border: '1.5px solid rgba(167,139,250,0.4)',
              backdropFilter: 'blur(14px)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, fontWeight: 900, color: '#DDD6FE',
              transform: 'rotate(10deg)',
              animation: 'tile-float 5.5s ease-in-out 1.2s infinite',
              boxShadow: '0 8px 30px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              zIndex: 3,
            }}>語</div>

            {/* Small planet with ring (between tiles) */}
            <div style={{ position: 'absolute', right: '26%', top: '26%', zIndex: 3, animation: 'planet-float 4.5s ease-in-out 0.8s infinite' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #C4B5FD, #7C3AED)', boxShadow: '0 0 12px rgba(139,92,246,0.7)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '-8px', right: '-8px', height: 5, borderRadius: '50%', border: '1.5px solid rgba(196,181,253,0.5)', transform: 'translateY(-50%) rotateX(70deg)' }} />
              </div>
            </div>

            {/* Golden planet / small dot */}
            <div style={{ position: 'absolute', top: '18%', left: '18%', width: 14, height: 14, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FCD34D, #D97706)', boxShadow: '0 0 12px rgba(251,191,36,0.6)', animation: 'planet-float 5s ease-in-out 0.5s infinite', zIndex: 3 }} />

            {/* TROPHY — bottom left, large decorative */}
            <div style={{
              position: 'absolute', bottom: '15%', left: '1%',
              fontSize: 90, lineHeight: 1, zIndex: 3,
              animation: 'planet-float 6s ease-in-out 0.3s infinite',
              filter: 'drop-shadow(0 12px 24px rgba(245,158,11,0.55)) drop-shadow(0 0 20px rgba(251,191,36,0.3))',
              userSelect: 'none',
            }}>🏆</div>

            {/* PLANET — center bottom decorative */}
            <div style={{
              position: 'absolute', bottom: '22%', left: '42%',
              width: 44, height: 44, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #A78BFA, #5B21B6)',
              boxShadow: '0 0 28px rgba(139,92,246,0.7), inset 0 -4px 12px rgba(0,0,0,0.3)',
              animation: 'planet-float 4.5s ease-in-out 1s infinite',
              zIndex: 3,
            }} />

            {/* BOOK — bottom right decorative */}
            <div style={{
              position: 'absolute', bottom: '14%', right: '4%',
              fontSize: 62, lineHeight: 1, zIndex: 2,
              animation: 'planet-float 5.5s ease-in-out 0.7s infinite',
              filter: 'drop-shadow(0 10px 20px rgba(139,92,246,0.6)) drop-shadow(0 0 30px rgba(251,191,36,0.25))',
              userSelect: 'none',
            }}>📖</div>

            {/* MASCOT — large, center-right */}
            <div style={{
              position: 'absolute', right: '7%', top: '50%', transform: 'translateY(-48%)',
              animation: 'mascot-float 4s ease-in-out infinite',
              zIndex: 4,
              filter: 'drop-shadow(0 30px 70px rgba(88,28,135,0.85)) drop-shadow(0 0 40px rgba(139,92,246,0.5))',
            }}>
              <img src="/mascot.png" alt="Voca mascot" style={{ width: 380, height: 'auto', display: 'block' }} />
            </div>

            {/* Content: title + features (left side) */}
            <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', flex: 1, maxWidth: '52%' }}>
              <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.18, marginBottom: 10, letterSpacing: -0.8 }}>
                <span style={{ background: 'linear-gradient(90deg, #A78BFA, #C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Үгтэй</span>
                {' '}бол хүчтэй ⚡
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 30, fontWeight: 500, lineHeight: 1.65 }}>
                Voca-д нэгдэж, үгийн сангаа өргөжүүлж,<br />дэлхийн хаанаас ч өрсөлдөөрэй!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                      background: f.iconBg, border: `1.5px solid ${f.iconBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      boxShadow: `0 4px 16px ${f.iconBorder}`,
                    }}>{f.icon}</div>
                    <div>
                      <div style={{ fontWeight: 800, color: f.titleColor, fontSize: 14, marginBottom: 5 }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats bar */}
            <div style={{
              position: 'relative', zIndex: 5, marginTop: 28,
              display: 'flex',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18, overflow: 'hidden',
            }}>
              {STATS.map((s, i) => (
                <div key={i} style={{
                  flex: 1, padding: '14px 10px', textAlign: 'center',
                  borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
                  <div style={{ fontWeight: 900, color: '#fff', fontSize: 17, letterSpacing: -0.5 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 500, lineHeight: 1.35 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{
            width: 460, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 40px', background: '#0F0B1E',
            borderLeft: '1px solid rgba(124,58,237,0.15)', overflowY: 'auto',
          }}>
            <div style={{ width: '100%' }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
                Voca-д тавтай морил!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, fontWeight: 500, marginBottom: 26 }}>
                Бүртгэлтэй эсвэл нэвтэрч үргэлжлүүлэрэй.
              </p>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 26 }}>
                {[{ key: 'login', label: 'Нэвтрэх' }, { key: 'register', label: 'Бүртгүүлэх' }].map(t => (
                  <button key={t.key} onClick={() => { setTab(t.key); setErr(''); }} style={{
                    flex: 1, padding: '11px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    background: 'none', border: 'none', fontFamily: 'inherit',
                    color: tab === t.key ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                    borderBottom: tab === t.key ? '2px solid #7C3AED' : '2px solid transparent',
                    marginBottom: -1, transition: 'all 0.15s',
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
                  <button type="button" onClick={() => setShowP(p => !p)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                    color: 'rgba(255,255,255,0.35)', padding: 4,
                  }}>{showPass ? '🙈' : '👁'}</button>
                </div>

                {tab === 'login' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: '#7C3AED', width: 15, height: 15 }} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Намайг сана</span>
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
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(124,58,237,0.4)', transition: 'all 0.2s',
                }}>
                  {loading ? (tab === 'login' ? 'Нэвтэрч байна...' : 'Бүртгэж байна...') : (tab === 'login' ? 'Нэвтрэх ✨' : 'Бүртгүүлэх ✨')}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, fontWeight: 600 }}>эсвэл</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Social buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, overflow: 'hidden', borderRadius: 12 }}>
                  <GoogleLogin
                    onSuccess={handleGoogle}
                    onError={() => setErr('Google нэвтрэлт амжилтгүй')}
                    text={tab === 'login' ? 'signin_with' : 'signup_with'}
                    shape="rectangular" size="large" width="200" locale="mn" theme="filled_black"
                  />
                </div>
                <button disabled style={{
                  flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(24,119,242,0.12)', color: 'rgba(255,255,255,0.55)', fontWeight: 700,
                  fontSize: 13, cursor: 'not-allowed', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Facebook
                </button>
                <button disabled style={{
                  flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', fontWeight: 700,
                  fontSize: 13, cursor: 'not-allowed', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}>
                  <svg width="13" height="16" viewBox="0 0 814 1000" fill="rgba(255,255,255,0.85)"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-166.2-112.4C18.3 663.4 0 564.4 0 486.3c0-238.1 155.7-364.3 308.4-364.3 79.8 0 146.4 52.5 194.5 52.5 46.6 0 120.3-55.4 209.2-55.4zm-7.3-142.4c31.4-35.3 54.2-84.6 54.2-133.9 0-6.9-.5-13.9-1.7-19.5-51.6 1.8-112.6 34.5-149.2 74.1-28.5 30.8-55.4 80.1-55.4 130.1 0 7.4 1.3 14.8 1.8 17.3 3.1.5 8.2 1.3 13.3 1.3 46.6 0 103.4-31.4 136.9-69.5z" /></svg>
                  Apple
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: 22, color: 'rgba(255,255,255,0.28)', fontSize: 13, fontWeight: 500 }}>
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
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 40px', borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12, fontWeight: 500 }}>
          © 2024 Voca. Бүх эрх хуулиар хамгаалагдсан.
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Үйлчилгээний нөхцөл</span>
          <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Нууцлалын бодлого</span>
        </div>
      </div>

      <style>{`
        .auth-left { display: flex; }
        .input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 16px; color: rgba(255,255,255,0.35); pointer-events: none;
        }
        .auth-input {
          width: 100%; padding: 13px 14px 13px 44px;
          font-size: 14px; font-family: inherit; outline: none; box-sizing: border-box;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; border-radius: 12px; transition: border-color 0.15s;
        }
        .auth-input:focus { border-color: rgba(167,139,250,0.5); }
        .auth-input::placeholder { color: rgba(255,255,255,0.28); }
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
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-18px); }
        }
        @keyframes shadow-pulse {
          0%, 100% { opacity: 0.5; transform: scaleX(1); }
          50%       { opacity: 0.2; transform: scaleX(0.7); }
        }
        @media (max-width: 900px) { .auth-left { display: none !important; } }
      `}</style>
    </div>
  );
}
