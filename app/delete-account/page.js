'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function DeleteAccountPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');
  const [done, setDone]         = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    setErr('');
    if (!confirm) return setErr('Устгахыг зөвшөөрч байгаагаа баталгаажуулна уу');
    setLoading(true);
    try {
      await api.post('/api/auth/delete-account', { email, password });
      setDone(true);
    } catch (e) {
      setErr(e.response?.data?.error || 'Алдаа гарлаа. Дахин оролдоно уу.');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
        top: -150, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
      }} />

      <div className="card anim-up" style={{ width: '100%', maxWidth: 480, padding: '36px 32px', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: 18,
            background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.28)',
            fontSize: 30, marginBottom: 16,
          }}>
            🗑️
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 6 }}>
            Бүртгэл устгах — Voca
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>
            Voca Mongolia аппын бүртгэлээ бүрмөсөн устгах
          </p>
        </div>

        {done ? (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)',
            borderRadius: 16, padding: 24, textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <p style={{ fontWeight: 800, color: '#22C55E', fontSize: 15 }}>
              Таны бүртгэл болон бүх өгөгдөл устгагдлаа
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
              Танд Voca ашигласанд баярлалаа.
            </p>
          </div>
        ) : (
          <>
            {/* What gets deleted */}
            <div style={{
              background: 'var(--purple-light)', border: '1px solid var(--border)',
              borderRadius: 14, padding: 16, marginBottom: 20, fontSize: 13, lineHeight: 1.7, color: 'var(--text)',
            }}>
              <p style={{ fontWeight: 800, marginBottom: 8 }}>Устгах алхмууд:</p>
              <p style={{ color: 'var(--muted)' }}>
                И-мэйл болон нууц үгээ доор оруулж баталгаажуулснаар таны бүртгэл шууд устана.
              </p>
              <p style={{ fontWeight: 800, marginTop: 14, marginBottom: 8 }}>Устгагдах өгөгдөл:</p>
              <p style={{ color: 'var(--muted)' }}>
                Профайл (и-мэйл, нэр, нууц үг), сурсан үгс, бүлгүүд, нийтлэл, чат, түвшин, дасгалын түүх — бүгд бүрмөсөн устана.
              </p>
              <p style={{ fontWeight: 800, marginTop: 14, marginBottom: 8 }}>Хадгалагдах өгөгдөл:</p>
              <p style={{ color: 'var(--muted)' }}>
                Хууль ёсны шаардлагаас бусад тохиолдолд ямар ч өгөгдөл хадгалагдахгүй. Устгал шууд, буцаах боломжгүй.
              </p>
            </div>

            <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  И-мэйл хаяг
                </label>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Бүртгэлтэй и-мэйлээ оруулна уу" required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
                  Нууц үг
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)}
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: '#EF4444' }} />
                <span>Би бүртгэл болон бүх өгөгдлөө бүрмөсөн устгахыг зөвшөөрч байна. Энэ үйлдлийг буцаах боломжгүй.</span>
              </label>

              {err && (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '11px 14px', color: '#EF4444', fontWeight: 700, fontSize: 13 }}>
                  {err}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px 22px', fontSize: 15, fontWeight: 800,
                border: 'none', borderRadius: 14, cursor: loading ? 'default' : 'pointer',
                background: '#EF4444', color: '#fff', opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
              }}>
                {loading ? 'Устгаж байна...' : 'Бүртгэлээ бүрмөсөн устгах'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--muted)', fontSize: 12 }}>
              Асуудал гарвал: <a href="mailto:pilotpandora77@gmail.com" style={{ color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>pilotpandora77@gmail.com</a>
            </p>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--muted)', fontSize: 13 }}>
          <Link href="/login" style={{ color: 'var(--purple)', fontWeight: 800, textDecoration: 'none' }}>
            ← Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      </div>
    </div>
  );
}
