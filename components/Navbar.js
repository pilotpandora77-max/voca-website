'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const NAV = [
  { href: '/',           label: '🏠 Нүүр' },
  { href: '/vocab',      label: '📝 Үгс' },
  { href: '/dictionary', label: '📖 Толь' },
  { href: '/hanzi',      label: '汉 Ханзи' },
  { href: '/grammar',    label: '📚 Хичээл' },
  { href: '/social',     label: '👥 Нийгэм' },
  { href: '/ai',         label: '🤖 AI Багш' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 60, zIndex: 100,
      background: '#fff', borderBottom: '2px solid #E5E5E5',
      display: 'flex', alignItems: 'center', paddingInline: 16, gap: 4,
    }}>
      <Link href="/" style={{ fontWeight: 900, fontSize: 17, color: '#3C3C3C', marginRight: 12, textDecoration: 'none' }}>
        OURLEARN
      </Link>

      {user && NAV.map(n => (
        <Link key={n.href} href={n.href} style={{
          padding: '6px 12px', borderRadius: 10, fontWeight: 700, fontSize: 13,
          textDecoration: 'none',
          background: path === n.href ? '#EDFFD7' : 'transparent',
          color: path === n.href ? '#58CC02' : '#AFAFAF',
          border: path === n.href ? '2px solid #58CC02' : '2px solid transparent',
        }}>{n.label}</Link>
      ))}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {user ? (
          <>
            <Link href="/profile" style={{
              fontWeight: 800, fontSize: 13, color: '#3C3C3C',
              background: '#F7F7F7', borderRadius: 20, padding: '6px 14px',
              border: '2px solid #E5E5E5', textDecoration: 'none',
            }}>
              {user.avatarEmoji || user.username?.[0]?.toUpperCase()} {user.username}
            </Link>
            <button onClick={logout} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 13 }}>
              Гарах
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 13, textDecoration: 'none' }}>Нэвтрэх</Link>
            <Link href="/register" className="btn btn-green" style={{ padding: '6px 14px', fontSize: 13, textDecoration: 'none' }}>Бүртгүүлэх</Link>
          </>
        )}
      </div>
    </nav>
  );
}
