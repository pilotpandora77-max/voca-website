'use client';

// "Хадгалах" дарсан үг бүр энд жагсаалтаар нэмэгдэнэ ("Дуусгах" дарах хүртэл
// серверт илгээгдээгүй байна). Хоосон үед юу ч харуулахгүй.
export default function StagedList({ words, onRemove }) {
  if (!words.length) return null;
  return (
    <div className="card" style={{ background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)' }}>
      <h3 style={{ fontWeight: 900, fontSize: 13, color: 'var(--purple)', marginBottom: 12, letterSpacing: 0.3 }}>
        📋 Нэмэгдэх жагсаалт ({words.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
        {words.map(w => (
          <div key={w._key} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10,
            border: '1.5px solid var(--border)', padding: '8px 10px',
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.front}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.back}</div>
            </div>
            <button type="button" onClick={() => onRemove(w._key)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 15, padding: '2px 4px', flexShrink: 0,
            }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
