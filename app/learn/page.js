'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { getCourses } from '@/lib/courses';

export default function LearnPage() {
  const { user, loading: authLoad } = useAuth();
  const { lang, langInfo } = useLang();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [prog, setProg]     = useState({});

  const CATEGORIES = getCourses(lang);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
    try { setProg(JSON.parse(localStorage.getItem('voca_learn_progress') || '{}')); } catch {}
  }, [authLoad, user]);

  if (authLoad) return null;

  const lp = k => prog[`${lang}:${k}`] || {};
  const totalLearned = CATEGORIES.reduce((a, c) => a + Object.values(lp(c.id)).filter(w => w.learned).length, 0);
  const todayGoal = 20;

  return (
    <div style={{ paddingBottom: 90 }}>
      <PageHeader title={`Ангилалууд ${langInfo.flag}`} subtitle={`${langInfo.name} хэлний өдөр тутмын хэрэгтэй үгсийг сэдвээр нь судлаарай.`} streak={streak} />

      <div style={{ padding: '0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {CATEGORIES.map(c => {
            const learned = Object.values(lp(c.id)).filter(w => w.learned).length;
            const pct = c.words.length ? Math.round((learned / c.words.length) * 100) : 0;
            return (
              <Link key={c.id} href={`/learn/${c.id}`} style={{
                textDecoration: 'none', background: `linear-gradient(160deg, ${c.color}14, ${c.color}06)`,
                border: `1.5px solid ${c.color}22`, borderRadius: 18, padding: '20px', transition: 'all 0.16s', display: 'block',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 28px ${c.color}22`; e.currentTarget.style.borderColor = `${c.color}55`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = `${c.color}22`; }}>
                <div style={{ fontSize: 46, marginBottom: 16 }}>{c.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>{c.num}. {c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{c.words.length} үг</span>
                  <span style={{ fontSize: 12.5, color: c.color, fontWeight: 800 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 6, transition: 'width 0.4s' }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Daily goal bar */}
      <div className="learn-goalbar" style={{
        position: 'fixed', bottom: 0, left: 'var(--sidebar-w)', right: 0, zIndex: 50,
        background: '#fff', borderTop: '1.5px solid var(--border)', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎯</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, maxWidth: 520 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Өнөөдрийн зорилго</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple)' }}>{Math.min(totalLearned, todayGoal)}/{todayGoal}</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-alt)', borderRadius: 6, overflow: 'hidden', maxWidth: 520 }}>
            <div style={{ height: '100%', width: `${Math.min((totalLearned / todayGoal) * 100, 100)}%`, background: 'linear-gradient(90deg,#a855f7,#7c3aed)', borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>Цуврал: 🔥 {streak} өдөр</div>
        </div>
        <Link href={`/learn/${CATEGORIES[0].id}`} className="btn btn-purple" style={{ flexShrink: 0, padding: '12px 24px', textDecoration: 'none' }}>Үргэлжлүүлэх →</Link>
      </div>
      <style>{`@media (max-width:768px){ .learn-goalbar{ left:0 !important; } }`}</style>
    </div>
  );
}
