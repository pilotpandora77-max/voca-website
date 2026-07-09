'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const PLANS = [
  {
    id: 'free', name: 'Үнэгүй', price: '0₮', period: '',
    features: ['1,000 үг хүртэл хадгалах', 'Толь бичиг', 'Суралцах үндсэн статистик'],
  },
  {
    id: 'standard', name: 'Стандарт', price: '15,000₮', period: '/сар',
    features: ['1,000 үг хадгалах', 'Бүх хичээл, тоглоом', 'Толь бичиг', 'Нийтлэл харах'],
  },
  {
    id: 'premium', name: 'Premium', price: '25,000₮', period: '/сар', best: true,
    features: ['♾️ Хязгааргүй үг хадгалах', '✍️ Пост нийтлэх', '💬 Группийн чат үүсгэх',
               '🤝 Найзуудтай болох', '💎 Premium badge', 'Рекламгүй орчин'],
  },
];

const WHY = [
  { icon: '🔄', title: 'Уян хатан', desc: '30 хоног тутам шинэчлэгдэнэ, хүссэн үедээ цуцлах боломжтой.' },
  { icon: '⚡', title: 'Түргэн ахиц', desc: 'Хязгааргүй үг, тоглоом, нийгмийн боломжоор хурдан сурна.' },
  { icon: '🔒', title: 'Аюулгүй төлбөр', desc: 'QPay-ээр банкны апп, wallet-аар шууд баталгаажуулна.' },
];

const PAY_METHODS = ['🏦 Голомт', '🏦 Хаан банк', '🏦 ХасБанк', '🏦 ТДБ', '💳 SocialPay', 'QPay wallet'];

const TESTIMONIALS = [
  { name: 'Boldoo', lvl: 3, emoji: '🦁', text: 'Сарын багц авснаас хойш өдөр бүр үг нэмж, тоглоомуудаар өрсөлдөж байгаа. Маш их ахицтай байна!' },
  { name: 'Suki', lvl: 2, emoji: '🌸', text: 'Үнэ цэнэтэй, боломж нь их, мөн хэрэглэгчдэдээ хайртай мэдрэмж төрүүлдэг апп.' },
];

export default function PricingPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak]   = useState(0);
  const [status, setStatus]   = useState(null);
  const [payPlan, setPayPlan] = useState(null);   // plan id being paid for (opens modal)
  const [invoice, setInvoice] = useState(null);   // { invoiceId, qrImage, qrText, urls, amount }
  const [busy, setBusy]       = useState(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
      api.get('/api/billing/status').then(r => setStatus(r.data)).catch(() => {});
    }
  }, [authLoad, user]);

  // Poll QPay while the QR modal is open — closes + activates automatically once paid.
  useEffect(() => {
    if (!invoice?.invoiceId) return;
    const iv = setInterval(async () => {
      try {
        const r = await api.get(`/api/billing/qpay/status/${invoice.invoiceId}`);
        if (r.data.status === 'paid') {
          clearInterval(iv);
          const planName = PLANS.find(p => p.id === payPlan)?.name;
          setPayPlan(null); setInvoice(null);
          const s = await api.get('/api/billing/status'); setStatus(s.data);
          alert(`🎉 ${planName} багц идэвхжлээ!`);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(iv);
  }, [invoice?.invoiceId]);

  if (authLoad) return null;

  const currentPlan = status?.plan || 'free';

  function closeModal() { setPayPlan(null); setInvoice(null); }

  async function buy(planId) {
    if (planId === 'free' || planId === currentPlan) return;
    setPayPlan(planId);
    setBusy(planId);
    try {
      const r = await api.post('/api/billing/subscribe', { plan: planId });
      setInvoice(r.data);
    } catch (e) {
      setPayPlan(null);
      alert(e.response?.data?.error || 'Нэхэмжлэх үүсгэж чадсангүй');
    }
    setBusy(null);
  }

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
                {['Хязгааргүй үг нэмэх', 'Пост нийтлэх', 'Группийн чат', 'Найзуудтай болох', 'Premium badge', 'Рекламгүй орчин'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                    <span style={{ color: '#fcd34d' }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {status && (
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 16, textAlign: 'center' }}>
              Одоогийн багц: <span style={{ fontWeight: 900, color: 'var(--purple)' }}>{status.planName}</span>
              {status.wordLimit != null ? `  ·  ${status.wordsUsed}/${status.wordLimit} үг` : `  ·  ${status.wordsUsed} үг (хязгааргүй)`}
            </div>
          )}

          {/* Pricing cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {PLANS.map(p => {
              const isCurrent = p.id === currentPlan;
              return (
                <div key={p.id} className={p.best ? undefined : 'card'} style={p.best ? {
                  position: 'relative', background: '#fff', border: '2px solid var(--purple)', borderRadius: 20,
                  padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 40px rgba(124,58,237,0.2)',
                } : { display: 'flex', flexDirection: 'column' }}>
                  {p.best && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', borderRadius: 100, padding: '4px 16px', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}>ХАМГИЙН АШИГТАЙ</div>
                  )}
                  <h3 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginTop: p.best ? 6 : 0 }}>{p.name}</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14 }}>
                    {p.id === 'free' ? 'Үндсэн боломжууд' : 'Илүү их боломж'}
                  </p>
                  <div style={{ fontSize: 34, fontWeight: 900, color: p.best ? 'var(--purple)' : 'var(--text)', marginBottom: 18 }}>
                    {p.price} <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>{p.period}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, flex: 1 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: p.best ? 'var(--text)' : 'var(--text-sub)', fontWeight: p.best ? 600 : 500 }}>
                        <span style={{ color: p.best ? 'var(--purple)' : 'var(--green)', flexShrink: 0 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  {isCurrent ? (
                    <button disabled style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-alt)', color: 'var(--muted)', fontWeight: 800, fontSize: 14, cursor: 'default', fontFamily: 'inherit' }}>Идэвхтэй багц</button>
                  ) : p.id === 'free' ? (
                    <button disabled style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-alt)', color: 'var(--muted)', fontWeight: 800, fontSize: 14, cursor: 'default', fontFamily: 'inherit' }}>Үндсэн багц</button>
                  ) : p.best ? (
                    <button onClick={() => buy(p.id)} disabled={busy !== null} className="btn btn-purple" style={{ width: '100%', padding: '13px', fontSize: 14 }}>
                      {busy === p.id ? 'Түр хүлээнэ үү…' : 'Сонгох →'}
                    </button>
                  ) : (
                    <button onClick={() => buy(p.id)} disabled={busy !== null} style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid var(--purple)', background: 'var(--purple-light)', color: 'var(--purple)', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {busy === p.id ? 'Түр хүлээнэ үү…' : 'Сонгох →'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment methods */}
          <div className="card" style={{ marginTop: 18 }}>
            <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>QPay-ээр дэмждэг банк, wallet</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {PAY_METHODS.map(m => (
                <div key={m} style={{ padding: '10px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-alt)', fontWeight: 800, fontSize: 13, color: 'var(--text-sub)' }}>{m}</div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>🔒 QPay-ээр баталгаажсан аюулгүй төлбөр</div>
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

      {/* QPay payment modal */}
      {payPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,10,30,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, padding: '28px 30px', maxHeight: '88vh', overflowY: 'auto', textAlign: 'center' }}>
            {(() => { const p = PLANS.find(x => x.id === payPlan); if (!p) return null; return (<>
              <h2 style={{ fontWeight: 900, fontSize: 19, color: 'var(--text)' }}>{p.name} багц</h2>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--purple)', marginTop: 4, marginBottom: 4 }}>{p.price}{p.period}</div>

              {!invoice ? (
                <div style={{ padding: '40px 0', color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Нэхэмжлэх үүсгэж байна…</div>
              ) : (<>
                <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginTop: 8, marginBottom: 16 }}>
                  QPay апп эсвэл банкны апп-аар уншуулж төлнө үү
                </p>

                {invoice.qrImage && (
                  <div style={{ display: 'flex', justifyContent: 'center', background: '#fff', borderRadius: 16, padding: 12, border: '2px solid var(--border)' }}>
                    <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" width={220} height={220} style={{ display: 'block' }} />
                  </div>
                )}

                {invoice.urls?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 16, paddingBottom: 4 }}>
                    {invoice.urls.map((u, i) => (
                      <a key={i} href={u.link} style={{
                        flexShrink: 0, width: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '8px 4px', borderRadius: 12, background: 'var(--bg-alt)', border: '1.5px solid var(--border)',
                        textDecoration: 'none', color: 'var(--text)',
                      }}>
                        {u.logo && <img src={u.logo} alt="" width={28} height={28} style={{ borderRadius: 6 }} />}
                        <span style={{ fontSize: 9, fontWeight: 700, textAlign: 'center' }}>{u.name || u.description}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 }}>
                  <span className="spinner" style={{ width: 14, height: 14, border: '2px solid var(--purple-light)', borderTopColor: 'var(--purple)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Төлбөр хүлээж байна…</span>
                </div>
              </>)}

              <button onClick={closeModal} className="btn btn-ghost" style={{ marginTop: 18, width: '100%' }}>Болих</button>
            </>); })()}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
