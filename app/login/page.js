'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login }           = useAuth();
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');
  const [err, setErr]       = useState('');
  const [loading, setLoad]  = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoad(true);
    try {
      await login(email, password);
    } catch (e) {
      setErr(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setLoad(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🦉</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>Нэвтрэх</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontWeight: 600 }}>OURLEARN дахин тавтай морилно уу</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>ИМЭЙЛ</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Имэйл хаягаа оруулна уу" required style={{ marginTop: 6 }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.5 }}>НУУЦ ҮГ</label>
              <Link href="/forgot-password" style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textDecoration: 'none' }}>
                Нууц үг мартсан?
              </Link>
            </div>
            <input type="password" value={password} onChange={e => setPass(e.target.value)}
              placeholder="Нууц үгээ оруулна уу" required style={{ marginTop: 6 }} />
          </div>

          {err && (
            <div style={{ background: 'var(--red-light)', border: '2px solid var(--red)', borderRadius: 12, padding: 12,
              color: 'var(--red)', fontWeight: 700, fontSize: 14 }}>
              {err}
            </div>
          )}

          <button type="submit" className="btn btn-green" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Нэвтэрж байна...' : 'НЭВТРЭХ'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontWeight: 600 }}>
          Бүртгэл байхгүй юу?{' '}
          <Link href="/register" style={{ color: 'var(--blue)', fontWeight: 800, textDecoration: 'none' }}>
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </div>
  );
}
