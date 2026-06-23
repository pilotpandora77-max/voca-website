'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep]           = useState('email');
  const [email, setEmail]         = useState('');
  const [code, setCode]           = useState('');
  const [devCode, setDevCode]     = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confirmPass, setConfirm] = useState('');
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState('');
  const [success, setSuccess]     = useState('');

  async function sendCode(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email });
      setDevCode(data.code);
      setStep('code');
    } catch (e) {
      setErr(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function resetPassword(e) {
    e.preventDefault();
    setErr('');
    if (newPass !== confirmPass) return setErr('Нууц үгүүд таарахгүй байна');
    if (newPass.length < 4) return setErr('Нууц үг хамгийн багадаа 4 тэмдэгт байна');
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, code, newPassword: newPass });
      setSuccess('Нууц үг амжилттай шинэчлэгдлэ!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (e) {
      setErr(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        top: -150, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
      }} />

      <div className="card anim-up" style={{ width: '100%', maxWidth: 420, padding: '36px 32px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: 18,
            background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)',
            fontSize: 30, marginBottom: 16,
            boxShadow: '0 0 24px rgba(124,58,237,0.15)',
          }}>
            🔐
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 6 }}>
            Нууц үг сэргээх
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
            {step === 'email' ? 'Бүртгэлтэй имэйл хаягаа оруулна уу' : 'Имэйлд ирсэн кодыг оруулна уу'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['Имэйл', 'Шинэчлэх'].map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: 4, borderRadius: 4, marginBottom: 6,
                background: (step === 'email' ? i === 0 : true)
                  ? 'linear-gradient(90deg, var(--purple), var(--purple-dark))'
                  : 'var(--border)',
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{s}</span>
            </div>
          ))}
        </div>

        {success ? (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)',
            borderRadius: 16, padding: 24, textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <p style={{ fontWeight: 800, color: '#22C55E', fontSize: 15 }}>{success}</p>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>Нэвтрэх хуудас руу шилжиж байна...</p>
          </div>
        ) : step === 'email' ? (
          <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                Имэйл хаяг
              </label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Бүртгэлтэй имэйлээ оруулна уу" required />
            </div>
            {err && (
              <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '11px 14px', color: '#EF4444', fontWeight: 700, fontSize: 13 }}>
                {err}
              </div>
            )}
            <button type="submit" className="btn btn-purple" disabled={loading} style={{ width: '100%', padding: '13px 22px', fontSize: 15 }}>
              {loading ? 'Илгээж байна...' : 'Код авах'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {devCode && (
              <div style={{
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.28)',
                borderRadius: 14, padding: 16, textAlign: 'center',
              }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#F59E0B', marginBottom: 6, letterSpacing: 0.5 }}>
                  🧪 ТЕСТ КОД
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#F59E0B', letterSpacing: 6 }}>{devCode}</p>
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                6 оронтой код
              </label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)}
                placeholder="______" maxLength={6} required
                style={{ letterSpacing: 6, fontSize: 20, textAlign: 'center' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                Шинэ нууц үг
              </label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                Нууц үг давтах
              </label>
              <input type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" required />
            </div>
            {err && (
              <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '11px 14px', color: '#EF4444', fontWeight: 700, fontSize: 13 }}>
                {err}
              </div>
            )}
            <button type="submit" className="btn btn-purple" disabled={loading} style={{ width: '100%', padding: '13px 22px', fontSize: 15 }}>
              {loading ? 'Шинэчилж байна...' : 'Нууц үг шинэчлэх'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setErr(''); setDevCode(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
              ← Имэйл дахин оруулах
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--muted)', fontSize: 13 }}>
          <Link href="/login" style={{ color: 'var(--purple)', fontWeight: 800, textDecoration: 'none' }}>
            ← Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      </div>
    </div>
  );
}
