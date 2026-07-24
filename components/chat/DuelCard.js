'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function DuelCard({ message, userId, mine }) {
  const [duel, setDuel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, [message.payload?.duelId]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/chat/duels/${message.payload.duelId}`);
      setDuel(data);
      const mineAnswers = data.from === userId ? data.fromAnswers : data.toAnswers;
      setQIndex(mineAnswers.findIndex(a => a === undefined) === -1 ? mineAnswers.length : mineAnswers.findIndex(a => a === undefined));
    } catch {}
    setLoading(false);
  }

  async function answer(choiceIdx) {
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/api/chat/duels/${duel.id}/answer`, { index: qIndex, choice: choiceIdx });
      setDuel(data);
      setQIndex(i => i + 1);
    } catch (e) {
      alert(e.response?.data?.error || 'Алдаа гарлаа');
    }
    setBusy(false);
  }

  if (loading || !duel) {
    return <div style={cardStyle}><div className="spinner" style={{ width: 20, height: 20 }} /></div>;
  }

  const myAnswers = duel.from === userId ? duel.fromAnswers : duel.toAnswers;
  const iAmDone = myAnswers.filter(a => a !== undefined).length === duel.questions.length;
  const myScore = duel.from === userId ? duel.fromScore : duel.toScore;
  const oppScore = duel.from === userId ? duel.toScore : duel.fromScore;
  const iWon = duel.winnerIds?.includes(userId);

  return (
    <div data-duel-id={duel.id} style={cardStyle}>
      <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, marginBottom: 4 }}>⚔️ ҮГИЙН ДУЭЛЬ</div>

      {duel.status === 'complete' ? (
        <div>
          <div style={{ fontWeight: 900, fontSize: 15, color: iWon ? '#16A34A' : 'var(--text)' }}>
            {duel.winnerIds.length === 2 ? '🤝 Тэнцлээ!' : iWon ? '🏆 Та яллаа! +50 XP' : '😅 Ялагдлаа'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>Таны оноо: {myScore} / {duel.questions.length} · Өрсөлдөгч: {oppScore}</div>
        </div>
      ) : iAmDone ? (
        <div style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 700 }}>✅ Та дуусгалаа — өрсөлдөгчийг хүлээж байна...</div>
      ) : !playing ? (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8 }}>{duel.questions.length} асуулттай дуэль урилга</div>
          <button className="btn btn-purple" onClick={() => setPlaying(true)} style={{ padding: '8px 16px', fontSize: 12.5 }}>🎮 Тоглох</button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>Асуулт {qIndex + 1} / {duel.questions.length}</div>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>{duel.questions[qIndex].word}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {duel.questions[qIndex].choices.map((c, i) => (
              <button key={i} disabled={busy} onClick={() => answer(i)} style={{
                textAlign: 'left', padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--border)',
                background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600,
              }}>{c}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: 'var(--bg-alt)', border: '1.5px solid var(--purple-mid)', borderRadius: 16,
  padding: '14px 16px', maxWidth: 300, minWidth: 220,
};
