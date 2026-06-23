'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const NAV = [
  { href: '/',           icon: '⚡', label: 'Нүүр хуудас' },
  { href: '/vocab',      icon: '📝', label: 'Үгийн сан' },
  { href: '/dictionary', icon: '📖', label: 'Толь бичиг' },
  { href: '/hanzi',      icon: '汉', label: 'Ханзи' },
  { href: '/grammar',    icon: '📚', label: 'Хичээл' },
  { href: '/social',     icon: '💬', label: 'Нийгэм' },
  { href: '/ai',         icon: '✨', label: 'AI Багш' },
];

const MOBILE_NAV = [
  { href: '/',           icon: '⚡', label: 'Нүүр' },
  { href: '/vocab',      icon: '📝', label: 'Үгс' },
  { href: '/hanzi',      icon: '汉', label: 'Ханзи' },
  { href: '/social',     icon: '💬', label: 'Нийгэм' },
  { href: '/ai',         icon: '✨', label: 'AI' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();

  const avatarColor = user?.avatarColor;
  const colorMap = {
    green: '#22C55E', blue: '#38BDF8', purple: '#9B6DFF',
    gold: '#F59E0B', red: '#F87171', teal: '#00C6AE',
  };
  const avatarBg = colorMap[avatarColor] || '#9B6DFF';

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-w)',
        background: 'linear-gradient(180deg, #130E2B 0%, #0D0A1F 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100, padding: '0',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg, #9B6DFF 0%, #7B4FE0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 900, color: '#fff',
              boxShadow: '0 4px 20px rgba(155,109,255,0.45)',
              flexShrink: 0,
            }}>
              v
            </div>
            <span style={{
              fontSize: 24, fontWeight: 900, letterSpacing: -0.8,
              background: 'linear-gradient(135deg, #C4AAFF 0%, #FF9CC4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              voca
            </span>
          </Link>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 20px 12px' }} />

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {user && NAV.map(n => {
            const active = path === n.href;
            return (
              <Link key={n.href} href={n.href} style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 12px', borderRadius: 13,
                textDecoration: 'none',
                background: active
                  ? 'linear-gradient(135deg, rgba(155,109,255,0.18) 0%, rgba(155,109,255,0.08) 100%)'
                  : 'transparent',
                border: active ? '1px solid rgba(155,109,255,0.28)' : '1px solid transparent',
                color: active ? '#C4AAFF' : 'rgba(163,147,200,0.8)',
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#EDE9FF'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(163,147,200,0.8)'; }}}
              >
                <span style={{ fontSize: 17, width: 22, textAlign: 'center', flexShrink: 0 }}>
                  {n.icon}
                </span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {active && (
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--purple)',
                    boxShadow: '0 0 8px var(--purple)',
                  }} />
                )}
              </Link>
            );
          })}

          {!user && (
            <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/login" className="btn btn-ghost" style={{ fontSize: 13.5, padding: '10px 16px', textDecoration: 'none' }}>
                Нэвтрэх
              </Link>
              <Link href="/register" className="btn btn-purple" style={{ fontSize: 13.5, padding: '10px 16px', textDecoration: 'none' }}>
                Бүртгүүлэх
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom user section */}
        {user && (
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <Link href="/profile" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 13,
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155,109,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(155,109,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `linear-gradient(135deg, ${avatarBg}CC, ${avatarBg}66)`,
                border: `2px solid ${avatarBg}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, flexShrink: 0,
                boxShadow: `0 0 12px ${avatarBg}33`,
              }}>
                {user.avatarEmoji || user.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: 13, color: '#EDE9FF',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.username}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Профайл харах →</div>
              </div>
            </Link>

            <button onClick={logout} style={{
              width: '100%', padding: '9px 12px', borderRadius: 11,
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.15)',
              color: '#F87171', fontWeight: 700, fontSize: 12.5,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
            >
              Гарах
            </button>
          </div>
        )}
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 64, zIndex: 200,
        background: 'rgba(13,10,31,0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        alignItems: 'center', justifyContent: 'space-around',
        padding: '0 4px',
      }}>
        {MOBILE_NAV.map(n => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 12px', borderRadius: 12,
              textDecoration: 'none', flex: 1,
              color: active ? '#C4AAFF' : 'var(--muted)',
              background: active ? 'rgba(155,109,255,0.12)' : 'transparent',
            }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{n.label}</span>
            </Link>
          );
        })}
        {user && (
          <Link href="/profile" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '8px 12px', borderRadius: 12,
            textDecoration: 'none', flex: 1,
            color: path === '/profile' ? '#C4AAFF' : 'var(--muted)',
            background: path === '/profile' ? 'rgba(155,109,255,0.12)' : 'transparent',
          }}>
            <span style={{ fontSize: 20 }}>{user.avatarEmoji || '👤'}</span>
            <span style={{ fontSize: 10, fontWeight: 700 }}>Профайл</span>
          </Link>
        )}
      </nav>
    </>
  );
}
