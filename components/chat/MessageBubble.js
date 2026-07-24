'use client';
import { useState } from 'react';
import { uploadUrl } from '@/lib/api';

const REACTION_EMOJI = ['👍', '❤️', '😂', '🔥', '📖', '👏'];

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ m, mine, showReadReceipt, read, onReply, onPin, onReact, onReport, onSaveWord, onSaveDeck }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const bubbleBg = mine ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'var(--bg-alt)';
  const bubbleColor = mine ? '#fff' : 'var(--text)';
  const radius = mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

  function reactionPills() {
    const entries = Object.entries(m.reactions || {}).filter(([, ids]) => ids?.length);
    if (!entries.length) return null;
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
        {entries.map(([emoji, ids]) => (
          <button key={emoji} onClick={() => onReact(m.id, emoji)} style={{
            border: '1px solid var(--border)', background: '#fff', borderRadius: 100,
            padding: '1px 7px', fontSize: 11.5, cursor: 'pointer', display: 'flex', gap: 3, alignItems: 'center',
          }}>
            <span>{emoji}</span><span style={{ fontWeight: 700, color: 'var(--text-sub)' }}>{ids.length}</span>
          </button>
        ))}
      </div>
    );
  }

  function actionBar() {
    return (
      <div style={{ position: 'relative', display: 'flex', gap: 2, alignItems: 'center', opacity: 0.55 }}>
        <button title="Хариулах" onClick={() => onReply(m)} style={iconBtn}>↩</button>
        <button title="Emoji" onClick={() => setPickerOpen(v => !v)} style={iconBtn}>🙂</button>
        <button title="Наах" onClick={() => onPin(m.id, !m.pinned)} style={iconBtn}>{m.pinned ? '📌' : '📍'}</button>
        <button title="Мэдэгдэх" onClick={() => onReport(m.id)} style={iconBtn}>🚩</button>
        {pickerOpen && (
          <div style={{
            position: 'absolute', top: 22, [mine ? 'right' : 'left']: 0, zIndex: 20,
            background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12,
            padding: '6px 8px', display: 'flex', gap: 4, boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          }}>
            {REACTION_EMOJI.map(e => (
              <button key={e} onClick={() => { onReact(m.id, e); setPickerOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{e}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function content() {
    switch (m.type) {
      case 'image':
        return <img src={uploadUrl(m.mediaUrl)} alt="" style={{ maxWidth: 220, borderRadius: 12, display: 'block' }} />;
      case 'video':
        return <video src={uploadUrl(m.mediaUrl)} controls style={{ maxWidth: 240, borderRadius: 12, display: 'block' }} />;
      case 'file':
        return (
          <a href={uploadUrl(m.mediaUrl)} target="_blank" rel="noopener noreferrer" style={{ color: bubbleColor, display: 'flex', gap: 8, alignItems: 'center', textDecoration: 'none' }}>
            <span style={{ fontSize: 20 }}>📎</span><span style={{ fontSize: 13, fontWeight: 700, textDecoration: 'underline' }}>{m.mediaName || 'Файл'}</span>
          </a>
        );
      case 'location':
        return (
          <a href={`https://www.google.com/maps?q=${m.lat},${m.lon}`} target="_blank" rel="noopener noreferrer" style={{ color: bubbleColor, textDecoration: 'underline', fontSize: 13.5, fontWeight: 700 }}>
            📍 Байршил харах
          </a>
        );
      case 'word':
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.75, marginBottom: 4 }}>📖 ҮГ ХУВААЛЦЛАА</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{m.payload?.word}</div>
            {m.payload?.reading && <div style={{ fontSize: 12, opacity: 0.8 }}>{m.payload.reading}</div>}
            <div style={{ fontSize: 13.5, marginTop: 2 }}>{m.payload?.meaning}</div>
            <button onClick={() => onSaveWord(m.id)} style={{ ...saveBtnStyle(mine), marginTop: 8 }}>💾 Үгийн санд хадгалах</button>
          </div>
        );
      case 'deck':
        return (
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.75, marginBottom: 4 }}>📚 ҮГИЙН БАГЦ ХУВААЛЦЛАА</div>
            <div style={{ fontWeight: 900, fontSize: 15 }}>{m.payload?.folderName || 'Багц'}</div>
            <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>{(m.payload?.words || []).length} үг</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
              {(m.payload?.words || []).slice(0, 3).map(w => w.word).join(', ')}{(m.payload?.words || []).length > 3 ? '…' : ''}
            </div>
            <button onClick={() => onSaveDeck(m.id)} style={{ ...saveBtnStyle(mine), marginTop: 8 }}>💾 Бүгдийг хадгалах</button>
          </div>
        );
      default:
        return <div style={{ fontSize: 14, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{m.text}</div>;
    }
  }

  return (
    <div data-message-id={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row' }}>
        <div style={{
          maxWidth: 320, padding: '10px 14px', borderRadius: radius,
          background: bubbleBg, color: bubbleColor, opacity: m.status === 'sending' ? 0.6 : 1,
        }}>
          {m.replyTo && (
            <div style={{
              borderLeft: `3px solid ${mine ? 'rgba(255,255,255,0.6)' : 'var(--purple)'}`, paddingLeft: 8, marginBottom: 6, opacity: 0.8,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800 }}>{m.replyTo.username}</div>
              <div style={{ fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{m.replyTo.text || 'Мессеж'}</div>
            </div>
          )}
          {content()}
          <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: 'right' }}>
            {fmtTime(m.createdAt)}{m.status === 'failed' ? ' · илгээгдсэнгүй' : ''}
            {showReadReceipt ? (read ? ' · ✓✓ Уншсан' : ' · ✓ Илгээсэн') : ''}
          </div>
        </div>
        {actionBar()}
      </div>
      {reactionPills()}
    </div>
  );
}

const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 2 };
function saveBtnStyle(mine) {
  return {
    border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
    background: mine ? 'rgba(255,255,255,0.2)' : 'var(--purple)', color: mine ? '#fff' : '#fff',
  };
}
