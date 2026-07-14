'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api, { uploadUrl } from '@/lib/api';

const NAV = [
  { href: '/',           icon: '🏠', label: 'Нүүр' },
  { href: '/dictionary', icon: '📖', label: 'Толь' },
  { href: '/learn',      icon: '📚', label: 'Ангилал' },
  { href: '/reel',       icon: '▶', label: 'Reel' },
  { href: '/vocab',      icon: '📝', label: 'Үгс' },
  { href: '/lessons',    icon: '🎯', label: 'Хичээлүүд' },
  { href: '/games',      icon: '🎮', label: 'Тоглоом' },
  { href: '/hanzi',      icon: '汉', label: 'Ханз' },
  { href: '/memory',     icon: '🧠', label: 'Ой тогтоолт' },
  { href: '/books',      icon: '📖', label: 'Номын сан' },
  { href: '/leaderboard',icon: '🏆', label: 'Эрэмбэ' },
  { href: '/social',     icon: '👥', label: 'Нийгэм' },
  { href: '/pricing',    icon: '👑', label: 'Төлбөр' },
];

const DAYS = ['Д', 'М', 'М', 'Л', 'П', 'Б', 'Н'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
    }
  }, [user]);

  const colorMap = {
    purple: '#7C3AED', blue: '#3B82F6', green: '#10B981',
    gold: '#F59E0B', red: '#EF4444', teal: '#00C6AE',
  };
  const avatarBg = colorMap[user?.avatarColor] || '#7C3AED';

  const today = new Date().getDay();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayIdx = (i + 1) % 7;
    const daysAgo = (today - dayIdx + 7) % 7;
    return { label: DAYS[i], active: daysAgo < streak && daysAgo >= 0 };
  });

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-w)',
        background: '#FFFFFF',
        borderRight: '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100,
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 18px 16px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/voca-logo.svg" alt="VOCA" width={38} height={38} style={{ borderRadius: '50%', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }} />
            <span style={{ fontSize: 22, fontWeight: 900, color: '#7C3AED', letterSpacing: -0.5 }}>voca</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV.map(n => {
            const active = path === n.href || (n.href !== '/' && path.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href} style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 12px', borderRadius: 12, textDecoration: 'none',
                background: active ? 'var(--purple-light)' : 'transparent',
                color: active ? 'var(--purple)' : 'var(--text-sub)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'all 0.14s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-sub)'; }}}
              >
                <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Streak widget */}
        {user && (
          <div style={{ margin: '0 12px', padding: '14px', background: 'var(--bg-alt)', borderRadius: 16, border: '1.5px solid var(--border)', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🔥</span>
              <div>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#F59E0B' }}>{streak}</span>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>өдрийн цуваа</div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 500, lineHeight: 1.4, marginBottom: 10 }}>
              {streak > 0 ? 'Маш сайн! Сахилга батаа хадгал!' : 'Цааш үргэлжлүүлж, сахилга батаа хадгал!'}
            </p>
            {/* Week calendar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 10 }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, marginBottom: 3 }}>{d}</div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', margin: '0 auto',
                    background: weekDays[i]?.active ? '#F59E0B' : 'var(--border)',
                    border: `2px solid ${weekDays[i]?.active ? '#D97706' : 'var(--border)'}`,
                    boxShadow: weekDays[i]?.active ? '0 2px 6px rgba(245,158,11,0.4)' : 'none',
                  }} />
                </div>
              ))}
            </div>
            <Link href="/streak" style={{
              display: 'block', textAlign: 'center', width: '100%', padding: '9px', borderRadius: 10,
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              color: '#fff', fontWeight: 800, fontSize: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 3px 10px rgba(124,58,237,0.3)', textDecoration: 'none',
            }}>
              Сахилга батаа хадгал
            </Link>
          </div>
        )}

        {/* User info */}
        {user && (
          <div style={{ padding: '0 12px 16px' }}>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
            <Link href="/profile" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              textDecoration: 'none', marginBottom: 8,
              padding: '6px 4px', borderRadius: 10, transition: 'background 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%', fontSize: 18, flexShrink: 0, overflow: 'hidden',
                background: `${avatarBg}22`, border: `2px solid ${avatarBg}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {user.avatarPhotoUrl
                  ? <img src={uploadUrl(user.avatarPhotoUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user.avatarEmoji || user.username?.[0]?.toUpperCase())}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Үнэгүй багц</div>
              </div>
            </Link>
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-sub)', fontWeight: 600, fontSize: 13, padding: '4px',
              fontFamily: 'inherit', borderRadius: 8, transition: 'all 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-sub)'; }}
            >
              <span>←</span> Гарах
            </button>
          </div>
        )}
        {!user && (
          <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/login" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: 13 }}>Нэвтрэх</Link>
            <Link href="/register" className="btn btn-purple" style={{ textDecoration: 'none', fontSize: 13 }}>Бүртгүүлэх</Link>
          </div>
        )}
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, zIndex: 200,
        background: '#fff', borderTop: '1.5px solid var(--border)',
        alignItems: 'center', justifyContent: 'space-around', padding: '0 4px',
      }}>
        {NAV.slice(0, 5).map(n => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 10px', borderRadius: 12, textDecoration: 'none', flex: 1,
              color: active ? 'var(--purple)' : 'var(--muted)',
              background: active ? 'var(--purple-light)' : 'transparent',
            }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
