'use client';

export function Progress({ idx, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--purple)', borderRadius: 8, width: `${((idx + 1) / total) * 100}%`, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>{idx + 1}/{total}</span>
    </div>
  );
}

export function Result({ score, total, label = 'оноо', onExit, onRetry, exitLabel = 'Тоглоом солих' }) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  return (
    <div className="card" style={{ textAlign: 'center', padding: '44px 24px' }}>
      <div style={{ fontSize: 60, marginBottom: 14 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '🎉' : '💪'}</div>
      <h2 style={{ fontWeight: 900, fontSize: 24, color: 'var(--purple)', marginBottom: 8 }}>
        {label === 'оноо' ? `${score} / ${total}` : `${score} хос · ${total} ${label}`}
      </h2>
      {label === 'оноо' && <p style={{ color: 'var(--muted)', fontWeight: 600, marginBottom: 22 }}>{pct}% зөв</p>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onRetry} className="btn btn-purple" style={{ padding: '12px 26px' }}>Дахин тоглох</button>
        <button onClick={onExit} className="btn btn-ghost" style={{ padding: '12px 26px' }}>{exitLabel}</button>
      </div>
    </div>
  );
}
