'use client';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function PageHeader({ title, subtitle, streak = 0, actions }) {
  const { user } = useAuth();
  const colorMap = {
    purple: '#7C3AED', blue: '#3B82F6', green: '#10B981',
    gold: '#F59E0B', red: '#EF4444', teal: '#00C6AE',
  };
  const avatarBg = colorMap[user?.avatarColor] || '#7C3AED';

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '24px 28px 0', marginBottom: 22,
    }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.5, lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 5, fontWeight: 500 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingTop: 2 }}>
        {actions}

        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: '#FEF3C7', border: '1.5px solid #F59E0B22' }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>өдрийн цуваа</div>
          </div>
        </div>

        {/* Upgrade */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
          color: '#fff', borderRadius: 12, padding: '9px 16px',
          fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(124,58,237,0.3)', fontFamily: 'inherit',
        }}>
          👑 Багц авах
        </button>

        {/* Bell */}
        <button style={{
          width: 38, height: 38, borderRadius: 11,
          border: '1.5px solid var(--border)', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, cursor: 'pointer', flexShrink: 0,
        }}>🔔</button>

        {/* Avatar */}
        <Link href="/profile" style={{
          width: 38, height: 38, borderRadius: '50%', textDecoration: 'none', flexShrink: 0,
          background: `${avatarBg}22`, border: `2px solid ${avatarBg}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
        }}>
          {user?.avatarEmoji || user?.username?.[0]?.toUpperCase() || '?'}
        </Link>
      </div>
    </div>
  );
}
