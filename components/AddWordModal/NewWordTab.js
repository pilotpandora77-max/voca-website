'use client';
import { useState, useRef } from 'react';
import api, { uploadUrl } from '@/lib/api';
import { AI_LANGS, EMPTY_NEW_WORD, POS_OPTIONS, POS_ABBR_MN } from './constants';
import PreviewCard from './PreviewCard';

const inputStyle = { width: '100%' };
const textareaStyle = { width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 14, padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)' };

function Counter({ value, max }) {
  return <span style={{ float: 'right', fontSize: 10.5, color: 'var(--muted)', fontWeight: 600 }}>{value.length}/{max}</span>;
}

// "Шинэ үг нэмэх" — AI Auto-Fill: үгээ бичээд Enter/blur дээр GPT-4o + OpenAI TTS-ээр
// бүх мэдээлэл автоматаар бөглөгдөнө, дараа нь хэрэглэгч засаад хадгална.
export default function NewWordTab({ aiLang, setAiLang, targetGroup, onSaved, onCancel }) {
  const [newWord, setNewWord] = useState(EMPTY_NEW_WORD);
  const [aiFillBusy, setAiFillBusy] = useState(false);
  const [lastFilledKey, setLastFilledKey] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [audioUploadBusy, setAudioUploadBusy] = useState(false);
  const audioFileRef = useRef(null);

  function selectAiLang(code) {
    setAiLang(code);
    setNewWord(EMPTY_NEW_WORD);
    setLastFilledKey('');
  }

  async function aiFillWord() {
    const q = (newWord.front || '').trim();
    if (!q) return;
    const key = `${aiLang}:${q.toLowerCase()}`;
    if (key === lastFilledKey || aiFillBusy) return;
    setAiFillBusy(true);
    try {
      const { data } = await api.post('/api/ai/word-fill', { word: q, lang: aiLang });
      setLastFilledKey(key);
      setNewWord(n => ({
        ...n,
        front: data.word || n.front,
        back: data.meaning || n.back,
        hint: data.reading || n.hint,
        pos: data.pos || n.pos,
        example: data.example || '',
        exampleMeaning: data.exampleMeaning || '',
        synonyms: data.synonyms || [],
        antonyms: data.antonyms || [],
        level: data.level || '',
        tags: data.tags || [],
        audioUrl: data.audioUrl || null,
      }));
      if (data.notFound) alert('AI энэ үгийг мэдэхгүй байна — мэдээллийг өөрөө шалгаж засаарай.');
    } catch (e) {
      const msg = e.response?.status === 503
        ? 'AI одоогоор ажиллахгүй байна — гараар бөглөнө үү.'
        : e.response?.status === 429
        ? 'Өдрийн AI хязгаарт хүрлээ. Дараа дахин оролдоно уу.'
        : (e.response?.data?.error || 'AI-аар бөглөхөд алдаа гарлаа.');
      alert(msg);
    }
    setAiFillBusy(false);
  }

  async function regenerateAudio() {
    const text = (newWord.example || newWord.front || '').trim();
    if (!text) return;
    try {
      const { data } = await api.post('/api/ai/word-audio', { text, lang: aiLang });
      setNewWord(n => ({ ...n, audioUrl: data.audioUrl || null }));
    } catch { alert('Дуу үүсгэхэд алдаа гарлаа.'); }
  }

  function playPreviewAudio() {
    if (!newWord.audioUrl) return;
    const a = new Audio(uploadUrl(newWord.audioUrl));
    a.play().catch(() => {});
  }

  function removeChip(field, value) {
    setNewWord(n => ({ ...n, [field]: n[field].filter(x => x !== value) }));
  }

  function toggleStar() {
    setNewWord(n => ({ ...n, starred: !n.starred }));
  }

  async function handleAudioFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append('audio', file);
      const { data } = await api.post('/api/words/audio-upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewWord(n => ({ ...n, audioUrl: data.audioUrl || n.audioUrl }));
    } catch {
      alert('Аудио файл байршуулахад алдаа гарлаа.');
    }
    setAudioUploadBusy(false);
    if (audioFileRef.current) audioFileRef.current.value = '';
  }

  async function addWord() {
    const front = (newWord.front || '').trim();
    const back = (newWord.back || '').trim();
    if (!front || !back) { alert('Үг болон Монгол утгыг бөглөнө үү.'); return; }
    setAddLoading(true);
    const payload = {
      front, back, hint: newWord.hint,
      word: front, meaning: back, reading: newWord.hint, lang: aiLang, pos: newWord.pos,
      group: targetGroup,
      example: newWord.example, exampleMeaning: newWord.exampleMeaning,
      synonyms: newWord.synonyms, antonyms: newWord.antonyms,
      level: newWord.level, tags: newWord.tags, audioUrl: newWord.audioUrl,
      starred: newWord.starred,
      aiGenerated: !!(newWord.example || newWord.level || newWord.tags.length),
    };
    try {
      await api.post('/api/words', payload);
      setNewWord(EMPTY_NEW_WORD);
      setLastFilledKey('');
      onSaved?.();
    } catch (e) {
      const msg = e.response?.data?.code === 'WORD_LIMIT'
        ? 'Үгийн хязгаарт хүрсэн байна. (Premium-аар хязгааргүй болно)'
        : 'Үг хадгалахад алдаа гарлаа. Дахин оролдоно уу.';
      alert(msg);
    }
    setAddLoading(false);
  }

  const curLang = AI_LANGS.find(l => l.code === aiLang);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
      <div>
        {/* Хэлний сонголт */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {AI_LANGS.map(l => (
            <button key={l.code} type="button" onClick={() => selectAiLang(l.code)} style={{
              flex: 1, padding: '8px 0', borderRadius: 10, fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
              border: `1.5px solid ${aiLang === l.code ? 'var(--purple)' : 'var(--border)'}`,
              background: aiLang === l.code ? 'var(--purple-light)' : 'var(--bg-alt)',
              color: aiLang === l.code ? 'var(--purple)' : 'var(--text-sub)',
            }}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>
              Yr ({curLang.wordLabel}) <Counter value={newWord.front} max={50} />
            </label>
            <div style={{ position: 'relative' }}>
              <input type="text" autoFocus value={newWord.front} onChange={e => setNewWord(n => ({ ...n, front: e.target.value }))}
                onBlur={aiFillWord}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); aiFillWord(); } }}
                placeholder={curLang.placeholder} style={{ ...inputStyle, paddingRight: aiFillBusy ? 110 : undefined }} />
              {aiFillBusy && (
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: 'var(--purple)' }}>
                  ✨ бодож байна…
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Enter дарах юм уу өөр талбар руу шилжихэд AI автоматаар бөглөнө.</div>
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Үгсийн ангилал (Part of speech)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={POS_OPTIONS.includes(newWord.pos) ? newWord.pos : ''} onChange={e => setNewWord(n => ({ ...n, pos: e.target.value }))} style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13.5 }}>
                <option value="">Сонгох</option>
                {POS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {newWord.pos && <span className="tag tag-purple" style={{ alignSelf: 'center', flexShrink: 0 }}>{POS_ABBR_MN[newWord.pos] || newWord.pos}</span>}
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>
              Орчуулга (Meaning) <Counter value={newWord.back} max={20} />
            </label>
            <textarea rows={1} value={newWord.back} onChange={e => setNewWord(n => ({ ...n, back: e.target.value }))} placeholder="Монгол хэл дээр утгыг бичнэ үү..." style={textareaStyle} />
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>
              Жишээ өгүүлбэр (Example sentence) <Counter value={newWord.example} max={300} />
            </label>
            <textarea rows={2} value={newWord.example} onChange={e => setNewWord(n => ({ ...n, example: e.target.value }))} placeholder="Жишээ өгүүлбэр бичнэ үү..." style={textareaStyle} />
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>
              Орчуулга (Sentence meaning) <Counter value={newWord.exampleMeaning} max={300} />
            </label>
            <textarea rows={2} value={newWord.exampleMeaning} onChange={e => setNewWord(n => ({ ...n, exampleMeaning: e.target.value }))} placeholder="Өгүүлбэрийн утгыг бичнэ үү..." style={textareaStyle} />
          </div>

          {(newWord.synonyms.length > 0 || newWord.antonyms.length > 0 || newWord.tags.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['synonyms', 'antonyms', 'tags'].map(field => newWord[field].length > 0 && (
                <div key={field}>
                  <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>
                    {field === 'synonyms' ? 'Ижил утгатай' : field === 'antonyms' ? 'Эсрэг утгатай' : 'Шошго'}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {newWord[field].map(v => (
                      <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg-alt)', border: '1.5px solid var(--border)', borderRadius: 100, padding: '4px 6px 4px 11px', fontSize: 12.5, fontWeight: 600 }}>
                        {v}
                        <button type="button" onClick={() => removeChip(field, v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, padding: '0 3px' }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-sub)', display: 'block', marginBottom: 6 }}>Жишээ өгүүлбэрийн аудио (заавал биш)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" onClick={() => audioFileRef.current?.click()} disabled={audioUploadBusy} className="btn btn-light" style={{ padding: '8px 14px', fontSize: 12.5 }}>
                {audioUploadBusy ? 'Байршуулж байна…' : '📁 Файл сонгох'}
              </button>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{newWord.audioUrl ? '✓ Аудио бэлэн' : 'Файл сонгогдоогүй'}</span>
              {newWord.audioUrl && (
                <button type="button" onClick={playPreviewAudio} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--purple)' }}>▶</button>
              )}
              {newWord.example && (
                <button type="button" onClick={regenerateAudio} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)' }}>🔁 AI-аар дахин үүсгэх</button>
              )}
              <input ref={audioFileRef} type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" onChange={handleAudioFile} style={{ display: 'none' }} />
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4 }}>MP3, WAV (хамгийн их 5MB)</div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-sub)' }}>
            <input type="checkbox" checked readOnly style={{ width: 16, height: 16 }} />
            Энэ үгийг миний үгс рүү хадгалах
          </label>

          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>📁 "{targetGroup}" бүлэгт нэмэгдэнэ</div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Цуцлах</button>
            <button className="btn btn-purple" onClick={addWord} disabled={addLoading} style={{ flex: 1 }}>
              {addLoading ? 'Хадгалж байна…' : '✓ Хадгалах үг'}
            </button>
          </div>
        </div>
      </div>

      <PreviewCard newWord={newWord} onPlayAudio={playPreviewAudio} onToggleStar={toggleStar} />
    </div>
  );
}
