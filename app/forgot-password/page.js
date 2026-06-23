'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep]         = useState('email'); // 'email' | 'code'
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');
  const [devCode, setDevCode]   = useState(''); // dev: backend-с ирсэн код
  const [newPass, setNewPass]   = useState('');
  const [confirmPass, setConfirm] = useState('');
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');
  const [success, setSuccess]   = useState('');

  async function sendCode(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email });
      setDevCode(data.code); // dev орчинд кодыг харуулна
      setStep('code');
    } catch (e) {
      setErr(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function resetPassword(e) {
    e.preventDefault();
    setErr('');
    if (newPass !== confirmPass) {
      setErr('Нууц үгүүд таарахгүй байна');
      return;
    }
    if (newPass.length < 4) {
      setErr('Нууц үг хамгийн багадаа 4 тэмдэгт байна');
      return;
    }
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>Нууц үг сэргээх</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontWeight: 600, fontSize: 14 }}>
            {step === 'email'
              ? 'Бүртгэлтэй имэйл хаягаа оруулна уу'
              : 'Имэйлд ирсэн кодыг оруулна уу'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['Имэйл', 'Код + нууц үг'].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: 4, borderRadius: 4, marginBottom: 4,
                background: (step === 'email' ? i === 0 : i <= 1) ? 'var(--green)' : 'var(--border)',
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{s}</span>
            </div>
          ))}
        </div>

        {success ? (
          <div style={{
            background: 'var(--green-bg)', border: '2px solid var(--green)',
            borderRadius: 14, padding: 20, textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <p style={{ fontWeight: 800, color: 'var(--green)' }}>{success}</p>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Нэвтрэх хуудас руу шилжиж байна...</p>
          </div>
        ) : step === 'email' ? (
          <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>ИМЭЙЛ ХАЯГ</label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Бүртгэлтэй имэйлээ оруулна уу" required style={{ marginTop: 6 }} />
            </div>

            {err && (
              <div style={{ background: 'var(--red-light)', border: '2px solid var(--red)',
                borderRadius: 12, padding: 12, color: 'var(--red)', fontWeight: 700, fontSize: 14 }}>
                {err}
              </div>
            )}

            <button type="submit" className="btn btn-green" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Илгээж байна...' : 'КОД АВАХ'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Dev: кодыг харуулах */}
            {devCode && (
              <div style={{
                background: '#FFF0C0', border: '2px solid #FF9600',
                borderRadius: 12, padding: 14, textAlign: 'center',
              }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: '#CC7800', marginBottom: 4 }}>
                  🧪 ТЕСТ КОД (prod-д имэйлээр явна)
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#CC7800', letterSpacing: 4 }}>{devCode}</p>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>6 ОРОНТОЙ КОД</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)}
                placeholder="Кодоо оруулна уу" maxLength={6} required style={{ marginTop: 6, letterSpacing: 4, fontSize: 18, textAlign: 'center' }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>ШИНЭ НУУЦ ҮГ</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="Шинэ нууц үгээ оруулна уу" required style={{ marginTop: 6 }} />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>НУУЦ ҮГ ДАВТАХ</label>
              <input type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)}
                placeholder="Нууц үгээ дахин оруулна уу" required style={{ marginTop: 6 }} />
            </div>

            {err && (
              <div style={{ background: 'var(--red-light)', border: '2px solid var(--red)',
                borderRadius: 12, padding: 12, color: 'var(--red)', fontWeight: 700, fontSize: 14 }}>
                {err}
              </div>
            )}

            <button type="submit" className="btn btn-green" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Шинэчилж байна...' : 'НУУЦ ҮГ ШИНЭЧЛЭХ'}
            </button>

            <button type="button" onClick={() => { setStep('email'); setErr(''); setDevCode(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontWeight: 700, fontSize: 14 }}>
              ← Имэйл дахин оруулах
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontWeight: 600 }}>
          <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 800, textDecoration: 'none' }}>
            ← Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      </div>
    </div>
  );
}
