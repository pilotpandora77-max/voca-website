'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function StudyTogether({ invite, onDismissInvite, partnerProgress, onInviteEmit, onProgress }) {
  const [active, setActive] = useState(false);
  const [words, setWords] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  async function start() {
    try {
      const { data } = await api.get('/api/words');
      const pool = [...data].sort(() => Math.random() - 0.5).slice(0, 10);
      setWords(pool);
      setIdx(0);
      setRevealed(false);
      setActive(true);
    } catch {}
  }

  function startAsHost() { onInviteEmit(); start(); }
  function join() { onDismissInvite(); start(); }

  useEffect(() => { if (active) onProgress(idx, words.length); }, [idx, active]);

  function next() {
    setRevealed(false);
    if (idx + 1 >= words.length) { setActive(false); return; }
    setIdx(i => i + 1);
  }

  if (!active && invite) {
    return (
      <div style={bannerStyle}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>🎯 {invite.fromUsername} хамт судлахыг санал болгож байна</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={join} className="btn btn-purple" style={{ padding: '6px 14px', fontSize: 12 }}>Нэгдэх</button>
          <button onClick={onDismissInvite} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>×</button>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div style={bannerStyle}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)' }}>Хамтдаа үг давтахыг хүсэж байна уу?</span>
        <button onClick={startAsHost} className="btn btn-purple" style={{ padding: '6px 14px', fontSize: 12 }}>🎯 Хамт судлах</button>
      </div>
    );
  }

  if (words.length === 0) {
    return <div style={bannerStyle}><span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Судлах үг алга байна — эхлээд үг нэмнэ үү.</span></div>;
  }

  const w = words[idx];
  return (
    <div style={{ ...bannerStyle, flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>🎯 Хамт судлах · {idx + 1}/{words.length}</span>
        <button onClick={() => setActive(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16 }}>×</button>
      </div>
      <div data-testid="study-reveal-card" onClick={() => setRevealed(true)} style={{
        cursor: revealed ? 'default' : 'pointer', textAlign: 'center', padding: '14px 10px',
        background: 'var(--purple-light)', borderRadius: 12,
      }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--text)' }}>{w.word}</div>
        {revealed && <div style={{ fontSize: 14, color: 'var(--purple)', fontWeight: 700, marginTop: 6 }}>{w.meaning}</div>}
        {!revealed && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>дарж утгыг харах</div>}
      </div>
      {revealed && <button onClick={next} className="btn btn-purple" style={{ alignSelf: 'center', padding: '7px 20px', fontSize: 12.5 }}>Дараах →</button>}
      {partnerProgress && (
        <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, textAlign: 'center' }}>
          👤 {partnerProgress.username}: {partnerProgress.index + 1}/{partnerProgress.total} карт
        </div>
      )}
    </div>
  );
}

const bannerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  background: '#fff', border: '1.5px solid var(--purple-mid)', borderRadius: 14,
  padding: '10px 16px', margin: '0 28px 10px',
};
