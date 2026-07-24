'use client';
import useTrialCountdown from '@/lib/useTrialCountdown';

// Шинэ хэрэглэгчийн 7 хоногийн Premium туршилтын үлдсэн хугацааг харуулна.
export default function TrialBadge({ user, style }) {
  const { active, label } = useTrialCountdown(user);
  if (!active) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10,
      background: '#FEF3C7', border: '1.5px solid #F59E0B44', fontSize: 12, fontWeight: 800,
      color: '#92400E', whiteSpace: 'nowrap', ...style,
    }}>
      🎁 Premium туршилт: {label}
    </div>
  );
}
