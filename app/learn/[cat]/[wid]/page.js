'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import api from '@/lib/api';
import { findCategory } from '@/lib/courses';
import { pullLegacy, pushLegacy } from '@/lib/userdata';

const RATINGS = [
  { key: 'again', label: 'Мэдэхгүй байна', sub: 'Дахин давтах', bg: '#FEF2F2', bd: '#FCA5A5', c: '#DC2626', emoji: '🙁' },
  { key: 'soon',  label: 'Тэр чигээр нь',  sub: 'Дараа нь давтах', bg: '#FEFCE8', bd: '#FDE68A', c: '#CA8A04', emoji: '🙂' },
  { key: 'known', label: 'Маш сайн мэднэ', sub: 'Сайн санаж байна', bg: '#F0FDF4', bd: '#86EFAC', c: '#16A34A', emoji: '😄' },
];

export default function WordPage() {
  const { user, loading: authLoad } = useAuth();
  const { lang, langInfo } = useLang();
  const router = useRouter();
  const { cat, wid } = useParams();
  const category = findCategory(lang, cat);
  const idx = category ? category.words.findIndex(w => w.id === wid) : -1;
  const word = idx >= 0 ? category.words[idx] : null;

  function speak(t) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = langInfo.sttLang; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  const [fav, setFav]   = useState(false);
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  useEffect(() => {
    if (!category || !word) return;
    try {
      const favs = JSON.parse(localStorage.getItem('voca_learn_fav') || '[]');
      setFav(favs.includes(`${lang}:${cat}:${wid}`));
      const notes = JSON.parse(localStorage.getItem('voca_word_notes') || '{}');
      const n = notes[`${lang}:${cat}:${wid}`] || '';
      setNote(n); setSavedNote(n);
    } catch {}
    // mark as learned (viewed)
    try {
      const prog = JSON.parse(localStorage.getItem('voca_learn_progress') || '{}');
      const ck = `${lang}:${cat}`;
      const cp = prog[ck] || {};
      if (!cp[wid]?.learned) { cp[wid] = { ...cp[wid], learned: true }; prog[ck] = cp; pushLegacy('voca_learn_progress', 'learnProgress', prog); }
    } catch {}
    speak(word.target);
  }, [cat, wid, lang]);

  if (authLoad) return null;
  if (!category || !word) return <div style={{ padding: 40, textAlign: 'center' }}><h2>Үг олдсонгүй</h2><Link href="/learn" className="btn btn-purple" style={{ marginTop: 16, textDecoration: 'none' }}>Буцах</Link></div>;

  const prev = idx > 0 ? category.words[idx - 1] : null;
  const next = idx < category.words.length - 1 ? category.words[idx + 1] : null;

  function toggleFav() {
    try {
      const favs = JSON.parse(localStorage.getItem('voca_learn_fav') || '[]');
      const key = `${lang}:${cat}:${wid}`;
      const nx = favs.includes(key) ? favs.filter(x => x !== key) : [...favs, key];
      pushLegacy('voca_learn_fav', 'saved', nx);
      setFav(nx.includes(key));
    } catch {}
  }
  function saveNote() {
    try {
      const notes = JSON.parse(localStorage.getItem('voca_word_notes') || '{}');
      notes[`${lang}:${cat}:${wid}`] = note;
      pushLegacy('voca_word_notes', 'notes', notes);
      setSavedNote(note);
    } catch {}
  }
  function rate(key) {
    try {
      const prog = JSON.parse(localStorage.getItem('voca_learn_progress') || '{}');
      const ck = `${lang}:${cat}`;
      const cp = prog[ck] || {};
      cp[wid] = { ...cp[wid], learned: true, rating: key, ratedAt: Date.now() };
      prog[ck] = cp; pushLegacy('voca_learn_progress', 'learnProgress', prog);
    } catch {}
    // save to backend vocab
    if (key !== 'again') {
      api.post('/api/words', { front: word.target, back: word.mn, hint: word.reading, word: word.target, meaning: word.mn, reading: word.reading, lang }).catch(() => {});
    }
    if (next) router.push(`/learn/${cat}/${next.id}`);
    else router.push(`/learn/${cat}`);
  }

  return (
    <div style={{ padding: '20px 28px 120px' }}>
      {/* Breadcrumb + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--muted)', marginBottom: 14, flexWrap: 'wrap' }}>
        <Link href="/learn" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Үгсийн сан</Link> ›
        <Link href={`/learn/${cat}`} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{category.name}</Link> ›
        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{word.word}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <button onClick={() => prev && router.push(`/learn/${cat}/${prev.id}`)} disabled={!prev} className="btn btn-ghost" style={{ padding: '9px 16px', opacity: prev ? 1 : 0.4 }}>← Өмнөх үг</button>
        <div style={{ flex: 1, height: 8, background: 'var(--bg-alt)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((idx + 1) / category.words.length) * 100}%`, background: 'var(--purple)', borderRadius: 6 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--muted)' }}>{idx + 1} / {category.words.length}</span>
        <button onClick={() => next && router.push(`/learn/${cat}/${next.id}`)} disabled={!next} className="btn btn-ghost" style={{ padding: '9px 16px', opacity: next ? 1 : 0.4 }}>Дараах үг →</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: 20, alignItems: 'start' }}>
        {/* ── Main ── */}
        <div>
          {/* Word card */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
              <div style={{ width: 150, height: 130, borderRadius: 16, background: `${category.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, flexShrink: 0 }}>{word.emoji || '🔤'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text)' }}>{word.word}</h1>
                  <button onClick={() => speak(word.word)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, color: 'var(--purple)' }}>🔊</button>
                  <button onClick={toggleFav} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: fav ? '#F59E0B' : 'var(--border)' }}>{fav ? '⭐' : '☆'}</button>
                </div>
                <div style={{ fontSize: 18, color: 'var(--muted)', marginTop: 4 }}>[{word.ipa}]</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>{word.mn}</div>
              </div>
            </div>
            {/* Definition */}
            <div style={{ marginTop: 18, padding: '14px 18px', background: 'var(--purple-light)', borderRadius: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--purple)', marginBottom: 4 }}>💡 Тайлбар</div>
              <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5 }}>"{word.word}" — {word.mn} ({word.type}). {word.examples[0]?.mn}</div>
            </div>
          </div>

          {/* Examples */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 14 }}>Жишээ өгүүлбэр</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {word.examples.map((ex, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-alt)', borderRadius: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: ex.en.replace(new RegExp(`(${word.word})`, 'gi'), '<span style="color:#7C3AED;font-weight:800">$1</span>') }} />
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{ex.mn}</div>
                  </div>
                  <button onClick={() => speak(ex.en)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--purple)' }}>🔊</button>
                </div>
              ))}
            </div>
          </div>

          {/* Memory + image */}
          {(word.mnemonic || word.emoji) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="card">
                <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Санах аргууд</h3>
                <div style={{ padding: '14px 16px', background: 'var(--purple-light)', borderRadius: 12 }}>
                  <div style={{ fontWeight: 800, color: 'var(--purple)', fontSize: 14 }}>🧠 {word.mnemonic || `${word.word} = ${word.mn}`}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Зураглалт санах ой</h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>{word.emoji || '🖼️'}</div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>Тэмдэглэл</h3>
              {note !== savedNote && <button onClick={saveNote} className="btn btn-purple" style={{ padding: '6px 14px', fontSize: 12 }}>Хадгалах</button>}
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Энэ үгийн талаар өөрийн тэмдэглэл бичнэ үү..." style={{ width: '100%', resize: 'vertical' }} />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 8 }}>Үгийн төрөл</div>
            <span className="tag tag-blue">{word.type}</span>
          </div>
          {word.synonyms.length > 0 && <SideList title="Синоним" items={word.synonyms} />}
          {word.antonyms.length > 0 && <SideList title="Антоним" items={word.antonyms} />}
          {word.related.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>Холбоотой үгс</div>
              {word.related.map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: 'var(--text-sub)', fontWeight: 600 }}>
                  {r} <span style={{ color: 'var(--muted)' }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Rating bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 'var(--sidebar-w)', right: 0, zIndex: 50,
        background: '#fff', borderTop: '1.5px solid var(--border)', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        padding: '14px 28px', display: 'flex', gap: 12,
      }} className="word-ratebar">
        {RATINGS.map(r => (
          <button key={r.key} onClick={() => rate(r.key)} style={{
            flex: 1, padding: '12px', borderRadius: 14, border: `2px solid ${r.bd}`, background: r.bg, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: r.c }}>{r.emoji} {r.label}</span>
            <span style={{ fontSize: 11.5, color: r.c, opacity: 0.8, fontWeight: 600 }}>{r.sub}</span>
          </button>
        ))}
      </div>
      <style>{`@media (max-width:768px){ .word-ratebar{ left:0 !important; } }`}</style>
    </div>
  );
}

function SideList({ title, items }) {
  return (
    <div className="card">
      <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>{title}</div>
      {items.map(it => (
        <div key={it} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', fontSize: 14, color: 'var(--text-sub)', fontWeight: 600 }}>
          {it}
          <button onClick={() => speak(it)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--purple)' }}>🔊</button>
        </div>
      ))}
    </div>
  );
}
