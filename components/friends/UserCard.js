'use client';

function activityLabel(u) {
  if (u.activeToday) return '🟢 Өнөөдөр идэвхтэй';
  if (!u.lastStudied) return null;
  const days = Math.floor((Date.now() - new Date(u.lastStudied).getTime()) / 86400000);
  if (days <= 0) return '🟢 Өнөөдөр идэвхтэй';
  if (days === 1) return '⚪️ 1 өдрийн өмнө идэвхтэй';
  if (days <= 30) return `⚪️ ${days} өдрийн өмнө идэвхтэй`;
  return '⚪️ Удаан идэвхгүй';
}

// Хайлт/жагсаалтын мөр бүрийг ижил дизайнаар зурна — баруун талын товч(нууд)-ыг
// дуудагч таб (Найзууд/Найз хайх/Хүсэлтүүд гэх мэт) өөрөө шийднэ.
export default function UserCard({ u, onOpen, rightSlot }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 16,
      border: '1.5px solid var(--border)', padding: '14px 16px', marginBottom: 10,
    }}>
      <div onClick={() => onOpen?.(u)} style={{ cursor: onOpen ? 'pointer' : 'default', flexShrink: 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', background: 'var(--purple-light)',
          border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21,
        }}>
          {u.avatarEmoji || u.username?.[0]?.toUpperCase()}
        </div>
      </div>

      <div onClick={() => onOpen?.(u)} style={{ flex: 1, minWidth: 0, cursor: onOpen ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{u.username}</span>
          {u.isPremium && <span style={{ fontSize: 11 }}>👑</span>}
          {u.level != null && (
            <span style={{ background: 'var(--purple-light)', color: 'var(--purple)', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>
              Level {u.level}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
          {u.xp != null && <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{u.xp.toLocaleString()} XP</span>}
          {u.friendCount != null && <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{u.friendCount} найз</span>}
          {u.mutualCount > 0 && <span style={{ fontSize: 11.5, color: 'var(--purple)', fontWeight: 700 }}>{u.mutualCount} нийтлэг найз</span>}
        </div>
        {activityLabel(u) && <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 3 }}>{activityLabel(u)}</div>}
        {u.badges?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {u.badges.map(b => <span key={b.id} title={b.name} style={{ fontSize: 14 }}>{b.emoji}</span>)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{rightSlot}</div>
    </div>
  );
}
