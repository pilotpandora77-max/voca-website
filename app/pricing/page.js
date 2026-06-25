'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const FREE_FEATURES = [
  'Өдөрт 20 үг нэмэх', 'Үндсэн тоглоомууд', 'Суралцах үндсэн статистик',
  'Нийгэмд оролцох', '3 төхөөрөмж дээр ашиглах',
];
const PREMIUM_FEATURES = [
  'Хязгааргүй үг нэмэх', 'Бүх тоглоомууд (шинэ тоглоомууд орно)', 'Дэлгэрэнгүй статистик & тайлан',
  'AI-аар үг судлах', 'Рекламгүй орчин', 'VIP дэмжлэг',
  '10 төхөөрөмж дээр ашиглах', 'Давтагдах картын хязгааргүй санах ой',
];

const WHY = [
  { icon: '🔄', title: 'Уян хатан', desc: 'Сар бүр шинэчлэгдэнэ, хүссэн үедээ цуцлах боломжтой.' },
  { icon: '💰', title: 'Эдийн засгийн хэмнэлт', desc: 'Бусад саруудтай харьцуулахад хамгийн их боломжийг хамгийн хямдаар авна.' },
  { icon: '⚡', title: 'Түргэн ахиц', desc: 'Хязгааргүй үг, тоглоом, AI тусламжаар хурдан сурна.' },
  { icon: '🛡️', title: 'Эрсдэлгүй туршлага', desc: '7 хоногийн турш туршаад, таалагдахгүй бол буцаан олголттой.' },
];

const PAY_METHODS = ['🏦 Голомт', '🏦 Хаан банк', '💳 SocialPay', '💳 Pocket', 'VISA', 'Mastercard', ' Pay'];

const TESTIMONIALS = [
  { name: 'Boldoo', lvl: 3, emoji: '🦁', text: 'Сарын багц авснаас хойш өдөр бүр үг нэмж, тоглоомуудаар өрсөлдөж байгаа. Маш их ахицтай байна!' },
  { name: 'Suki', lvl: 2, emoji: '🌸', text: 'Үнэ цэнэтэй, боломж нь их, мөн хэрэглэгчдэдээ хайртай мэдрэмж төрүүлдэг апп.' },
];

export default function PricingPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [cycle, setCycle]   = useState('monthly'); // monthly | yearly

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
  }, [authLoad, user]);

  if (authLoad) return null;

  function buy(plan) {
    alert(`"${plan}" багцыг сонголоо! 🎉\n\nТөлбөрийн систем удахгүй холбогдоно. Одоогоор туршилтын горимд байна.`);
  }

  const monthly = cycle === 'monthly';

  return (
    <div style={{ paddingBottom: 48 }}>
      <PageHeader title="Төлбөрийн багцууд 👑" subtitle="Суралцах аяллаа дээд түвшинд хүргэе. Илүү их боломж, илүү их амжилт!" streak={streak} />

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 18, alignItems: 'start' }}>
        {/* ── Main ── */}
        <div>
          {/* Banner */}
          <div style={{
            borderRadius: 22, padding: '28px 32px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(120deg,#7c3aed,#6d28d9)',
          }}>
            <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', fontSize: 130, opacity: 0.18 }}>🎁</div>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '72%' }}>
              <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>Premium болсноор</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 18, lineHeight: 1.15 }}>хязгааргүй боломж нээгдэнэ!</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                {['Хязгааргүй үг нэмэх', 'Онцгой тоглоомууд', 'Дэлгэрэнгүй статистик', 'AI-аар үг сургах', 'Рекламгүй орчин', 'VIP дэмжлэг'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                    <span style={{ color: '#fcd34d' }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cycle toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--bg-alt)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {[['monthly', 'Сарын төлбөр', '-16% хямдана'], ['yearly', 'Жилийн төлбөр', '-35% хямдана']].map(([k, label, save]) => (
              <button key={k} onClick={() => setCycle(k)} style={{
                padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
                background: cycle === k ? '#fff' : 'transparent', color: cycle === k ? 'var(--purple)' : 'var(--text-sub)',
                boxShadow: cycle === k ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {label}
                <span style={{ fontSize: 10, color: 'var(--green-dark)', background: 'var(--green-light)', borderRadius: 6, padding: '2px 6px', fontWeight: 800 }}>{save}</span>
              </button>
            ))}
          </div>

          {/* Pricing cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {/* Free */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)' }}>Үнэгүй</h3>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14 }}>Үндсэн боломжууд</p>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--text)', marginBottom: 18 }}>0₮ <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>/ сар</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, flex: 1 }}>
                {FREE_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-sub)', fontWeight: 500 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button disabled style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-alt)', color: 'var(--muted)', fontWeight: 800, fontSize: 14, cursor: 'default', fontFamily: 'inherit' }}>Идэвхтэй багц</button>
            </div>

            {/* Monthly Premium — highlighted */}
            <div style={{ position: 'relative', background: '#fff', border: '2px solid var(--purple)', borderRadius: 20, padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 40px rgba(124,58,237,0.2)' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', borderRadius: 100, padding: '4px 16px', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}>ХАМГИЙН АШИГТАЙ</div>
              <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginTop: 6 }}>{monthly ? 'Сарын' : 'Жилийн'} Premium</h3>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14 }}>Бүх боломжоо нээгээрэй</p>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--purple)', marginBottom: 6 }}>
                {monthly ? '25,000' : '239,000'}₮ <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>/ {monthly ? 'сар' : 'жил'}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green-dark)', background: 'var(--green-light)', borderRadius: 8, padding: '5px 10px', display: 'inline-block', alignSelf: 'flex-start', marginBottom: 16 }}>
                {monthly ? 'Жилд 80,000₮ хэмнэнэ!' : 'Жилд 105,000₮ хэмнэнэ!'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, flex: 1 }}>
                {PREMIUM_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                    <span style={{ color: 'var(--purple)', flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => buy(monthly ? 'Сарын Premium' : 'Жилийн Premium')} className="btn btn-purple" style={{ width: '100%', padding: '13px', fontSize: 14 }}>
                {monthly ? 'Сарын' : 'Жилийн'} багц авах
              </button>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>{monthly ? '25,000₮ / сар' : '19,917₮ / сар'}</div>
            </div>

            {/* Yearly Premium */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)' }}>Жилийн Premium</h3>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14 }}>Урт хугацааны хамгийн хэмнэлттэй</p>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>239,000₮ <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>/ жил</span></div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green-dark)', background: 'var(--green-light)', borderRadius: 8, padding: '5px 10px', display: 'inline-block', alignSelf: 'flex-start', marginBottom: 16 }}>Жилд 105,000₮ хэмнэнэ!</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, flex: 1 }}>
                {PREMIUM_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                    <span style={{ color: 'var(--purple)', flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => buy('Жилийн Premium')} style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid var(--purple)', background: 'var(--purple-light)', color: 'var(--purple)', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Жилийн багц авах</button>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>19,917₮ / сар</div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="card" style={{ marginTop: 18 }}>
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>Бүх төлбөрийн арга</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {PAY_METHODS.map(m => (
                <div key={m} style={{ padding: '10px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-alt)', fontWeight: 800, fontSize: 13, color: 'var(--text-sub)' }}>{m}</div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>🔒 100% аюулгүй төлбөрийн систем</div>
          </div>
        </div>

        {/* ── Right ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Why premium */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>Яагаад Premium багц?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {WHY.map(w => (
                <div key={w.title} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{w.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{w.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.4, marginTop: 2 }}>{w.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ borderRadius: 20, padding: '22px', color: '#fff', position: 'relative', overflow: 'hidden', background: 'radial-gradient(120% 120% at 80% 10%, #5b3aa6, #2a1a52)' }}>
            <div style={{ position: 'absolute', right: -6, bottom: -6, fontSize: 72, opacity: 0.25 }}>♾️</div>
            <h3 style={{ fontWeight: 900, fontSize: 17, marginBottom: 8, position: 'relative' }}>Хязгааргүй сурах.<br />Хязгааргүй амжилт.</h3>
            <p style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 500, lineHeight: 1.5, position: 'relative' }}>Өнөөдрөөс эхлэн өөрийн үнэ цэнийг өсгөж, шинэ хэлээр хязгааргүй ярьдаг болоорой!</p>
          </div>

          {/* Testimonials */}
          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>Хэрэглэгчдийн сэтгэгдэл</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {TESTIMONIALS.map(t => (
                <div key={t.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{t.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Level {t.lvl}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#F59E0B', fontSize: 12 }}>★★★★★</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-sub)', fontWeight: 500, lineHeight: 1.5 }}>{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
