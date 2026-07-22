'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import MODELS, { CATEGORIES, RELATED } from '@/lib/memoryModels';
import api from '@/lib/api';

const TABS = ['Тайлбар', 'Үндсэн бүтэц', 'Давуу тал', 'Хязгаарлалт', 'Судалгаа, ишлэл'];

export default function MemoryPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [streak, setStreak]   = useState(0);
  const [cat, setCat]         = useState('Бүх загвар');
  const [selId, setSelId]     = useState(null);
  const [tab, setTab]         = useState(TABS[0]);
  const [bookmarks, setBm]    = useState([]);
  const [noteText, setNote]   = useState('');
  const [myNotes, setMyNotes] = useState({}); // { modelId: [ {id,text,date} ] }
  const [brainNews, setBrainNews] = useState(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      api.get('/api/news/brain').then(r => setBrainNews(r.data)).catch(() => setBrainNews([]));
    }
  }, [authLoad, user]);

  useEffect(() => {
    try {
      setBm(JSON.parse(localStorage.getItem('voca_mem_bookmarks') || '[]'));
      setMyNotes(JSON.parse(localStorage.getItem('voca_mem_notes') || '{}'));
    } catch {}
  }, []);

  function toggleBookmark(id) {
    setBm(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('voca_mem_bookmarks', JSON.stringify(next));
      return next;
    });
  }

  function saveNote() {
    if (!noteText.trim() || !selId) return;
    setMyNotes(prev => {
      const list = prev[selId] || [];
      const next = { ...prev, [selId]: [{ id: Date.now(), text: noteText.trim(), date: new Date().toLocaleString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }, ...list] };
      localStorage.setItem('voca_mem_notes', JSON.stringify(next));
      return next;
    });
    setNote('');
  }
  function deleteNote(nid) {
    setMyNotes(prev => {
      const next = { ...prev, [selId]: (prev[selId] || []).filter(n => n.id !== nid) };
      localStorage.setItem('voca_mem_notes', JSON.stringify(next));
      return next;
    });
  }

  if (authLoad) return null;

  const counts = { 'Бүх загвар': MODELS.length };
  CATEGORIES.forEach(c => { counts[c] = MODELS.filter(m => m.category === c).length; });

  const filtered = cat === 'Бүх загвар' ? MODELS : MODELS.filter(m => m.category === cat);
  const sel = MODELS.find(m => m.id === selId);
  const notes = (sel && myNotes[sel.id]) || [];
  const related = (sel && RELATED[sel.id] || []).map(id => MODELS.find(m => m.id === id)).filter(Boolean);

  function selectModel(id) { setSelId(id); setTab(TABS[0]); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function backToGrid() { setSelId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <div style={{ paddingBottom: 48 }}>
      <PageHeader title="🧠 Ой тогтоолтын олон улсын судалгааны загварууд"
        subtitle="Ой тогтоолтыг судлах, сайжруулахад ашигладаг үндсэн онол, загварууд." streak={streak} />

      {!sel && (
      <div className="responsive-sidebar" style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '230px minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        {/* ── Categories ── */}
        <div className="card" style={{ padding: 14 }}>
          <h3 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', padding: '4px 8px 10px' }}>Ангилалууд</h3>
          {['Бүх загвар', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
              padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: cat === c ? 'var(--purple-light)' : 'transparent',
              color: cat === c ? 'var(--purple)' : 'var(--text-sub)', fontWeight: cat === c ? 800 : 600,
              fontSize: 13.5, marginBottom: 2, textAlign: 'left',
            }}>
              <span>{c}</span>
              <span style={{ fontSize: 11, fontWeight: 800, background: cat === c ? 'var(--purple)' : 'var(--bg-alt)', color: cat === c ? '#fff' : 'var(--muted)', borderRadius: 8, padding: '2px 8px' }}>{counts[c]}</span>
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>{cat} <span style={{ color: 'var(--muted)', fontWeight: 700 }}>({filtered.length})</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {filtered.map(m => (
              <div key={m.id} onClick={() => selectModel(m.id)} style={{
                background: '#fff', border: `1.5px solid ${selId === m.id ? 'var(--purple)' : 'var(--border)'}`,
                borderRadius: 16, padding: '18px 16px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
              }}
              onMouseEnter={e => { if (selId !== m.id) { e.currentTarget.style.borderColor = 'var(--purple-mid)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(124,58,237,0.1)'; } }}
              onMouseLeave={e => { if (selId !== m.id) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; } }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{m.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 5, lineHeight: 1.3 }}>{m.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>{m.category}</div>
                <p style={{ fontSize: 11.5, color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: 28, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.summary}</p>
                <button onClick={e => { e.stopPropagation(); toggleBookmark(m.id); }} style={{
                  position: 'absolute', bottom: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, color: bookmarks.includes(m.id) ? 'var(--purple)' : 'var(--muted)',
                }}>{bookmarks.includes(m.id) ? '🔖' : '🏷️'}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {!sel && (
        <div style={{ padding: '24px 28px 0' }}>
          <h2 style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', marginBottom: 14 }}>🧠 Тархи судлалын шинэ ололтууд</h2>
          {brainNews === null && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Ачаалж байна...</p>}
          {brainNews?.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Одоогоор мэдээ татагдсангүй.</p>}
          {brainNews?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {brainNews.slice(0, 6).map(n => (
                <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="card" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 16 }}>{n.emoji}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: n.color }}>{n.source}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>{n.title}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{n.summary}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Detail ── */}
      {sel && (
        <div id="mem-detail" style={{ padding: '4px 28px 0' }}>
          <div className="card" style={{ padding: '24px 26px' }}>
            {/* top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button onClick={backToGrid} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>← Буцах</button>
              <button onClick={() => toggleBookmark(sel.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: bookmarks.includes(sel.id) ? 'var(--purple-light)' : 'var(--bg-alt)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: bookmarks.includes(sel.id) ? 'var(--purple)' : 'var(--text-sub)', fontWeight: 800, fontSize: 13, fontFamily: 'inherit' }}>
                {bookmarks.includes(sel.id) ? '🔖 Хадгалсан' : '🏷️ Хадгалах'}
              </button>
            </div>

            {/* diagram + info */}
            <div className="responsive-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22 }}>
              <Diagram model={sel} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <ResearcherAvatar model={sel} />
                  <h2 style={{ fontWeight: 900, fontSize: 24, color: 'var(--text)' }}>{sel.title}</h2>
                </div>
                <span className="tag tag-purple" style={{ marginBottom: 14, display: 'inline-block' }}>{sel.category}</span>
                <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{sel.summary}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    ['👤', 'Судлаачид', sel.authors],
                    ['📅', 'Он', sel.year],
                    ['🏷️', 'Ангилал', sel.category],
                    ['🎯', 'Гол ойлголт', sel.concept],
                    ['🔗', 'Холбоотой үзэгдэл', sel.related],
                  ].map(([ic, label, val]) => (
                    <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 15, width: 20, flexShrink: 0 }}>{ic}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', width: 130, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* tabs */}
            <div style={{ display: 'flex', gap: 26, borderBottom: '1.5px solid var(--border)', marginBottom: 18, overflowX: 'auto' }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap',
                  color: tab === t ? 'var(--purple)' : 'var(--muted)',
                  borderBottom: tab === t ? '2.5px solid var(--purple)' : '2.5px solid transparent', marginBottom: -1.5,
                }}>{t}</button>
              ))}
            </div>

            {/* tab content */}
            <div style={{ minHeight: 120 }}>
              {tab === 'Тайлбар' && <p style={{ color: 'var(--text-sub)', fontSize: 14.5, lineHeight: 1.7 }}>{sel.summary}</p>}

              {tab === 'Үндсэн бүтэц' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {sel.structure.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0, marginTop: 5 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)', marginBottom: 3 }}>{s.title}</div>
                        <div style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.6 }}>{s.text}</div>
                        <div style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 600, marginTop: 3 }}>Жишээ: {s.ex}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'Давуу тал' && <ListBlock items={sel.advantages} color="var(--green)" mark="✓" />}
              {tab === 'Хязгаарлалт' && <ListBlock items={sel.limitations} color="var(--red)" mark="!" />}

              {tab === 'Судалгаа, ишлэл' && (
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>ХЭРЭГЛЭЭ</h4>
                  <ListBlock items={sel.applications} color="var(--purple)" mark="→" />
                  <h4 style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)', margin: '18px 0 10px' }}>ЭХ СУРВАЛЖ</h4>
                  {sel.references.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', background: 'var(--bg-alt)', borderRadius: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12.5, color: 'var(--text-sub)', fontStyle: 'italic', lineHeight: 1.5 }}>{r}</span>
                      <button onClick={() => { navigator.clipboard?.writeText(r); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--purple)', flexShrink: 0, fontFamily: 'inherit' }}>Хуулах</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* related */}
            {related.length > 0 && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1.5px solid var(--border)' }}>
                <h4 style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>🔮 Та мөн уншаарай</h4>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {related.map(r => (
                    <button key={r.id} onClick={() => selectModel(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-alt)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                      <span style={{ fontSize: 16 }}>{r.icon}</span> {r.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes editor */}
          <div className="card" style={{ marginTop: 16, padding: '20px 24px' }}>
            <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 12 }}>✍️ Тайлбар, тэмдэглэл</h3>
            <textarea value={noteText} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Энэ загвартай холбоотой өөрийн ойлголт, тэмдэглэлээ бичнэ үү..."
              style={{ width: '100%', resize: 'vertical', marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={saveNote} disabled={!noteText.trim()} className="btn btn-purple" style={{ padding: '10px 22px' }}>Хадгалах</button>
            </div>
          </div>

          {/* My notes */}
          {notes.length > 0 && (
            <div className="card" style={{ marginTop: 16, padding: '20px 24px' }}>
              <h3 style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>Миний тэмдэглэлүүд ({notes.length})</h3>
              {notes.map(n => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>📝</span>
                  <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>{n.text}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{n.date}</span>
                  <button onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--muted)', flexShrink: 0 }}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ListBlock({ items, color, mark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{mark}</span>
          <span style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Судлаачийн avatar: PD зураг байвал бодит зураг, үгүй бол эхний
   судлаачийнхаа нэрийн эхний үсгээр өнгөт дугуй (default avatar-тай ижил хэв маяг) ── */
function ResearcherAvatar({ model }) {
  if (model.photo?.src) {
    return (
      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--purple-mid)' }}>
        <img src={model.photo.src} alt={model.authors} title={model.photo.credit} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  const initial = (model.authors || model.title || '?').trim()[0]?.toUpperCase() || '?';
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: 'var(--purple-light)',
      border: '2px solid var(--purple-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 17, fontWeight: 900, color: 'var(--purple)',
    }}>{initial}</div>
  );
}

/* ── Diagram renderer ── */
function Diagram({ model }) {
  const box = (s, w) => (
    <div style={{ background: `${s.color}18`, border: `2px solid ${s.color}`, borderRadius: 12, padding: '12px 10px', textAlign: 'center', width: w, minHeight: 70, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text)', lineHeight: 1.3 }}>{s.title.split('(')[0].trim()}</div>
      <div style={{ fontSize: 10, color: s.color, fontWeight: 700, marginTop: 2 }}>{(s.title.match(/\(([^)]+)\)/) || [])[1] || ''}</div>
    </div>
  );

  const wrap = { background: 'linear-gradient(160deg,#F8F5FF,#EDE9FF)', borderRadius: 16, padding: '24px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, border: '1.5px solid var(--border)' };

  if (model.diagram === 'flow3' || model.diagram === 'components' || model.diagram === 'generic') {
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {model.structure.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {box(s, 100)}
              {i < model.structure.length - 1 && model.diagram !== 'components' && <span style={{ color: 'var(--purple)', fontSize: 22, fontWeight: 900 }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (model.diagram === 'pyramid') {
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {model.structure.map((s, i) => (
            <div key={i} style={{ width: `${60 + i * 60}px`, background: s.color, color: '#fff', borderRadius: 8, padding: '8px', textAlign: 'center', fontWeight: 800, fontSize: 11 }}>{s.title.split('(')[0].trim()}</div>
          ))}
        </div>
      </div>
    );
  }

  if (model.diagram === 'tree') {
    return (
      <div style={wrap}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'var(--purple)', color: '#fff', borderRadius: 10, padding: '8px 16px', fontWeight: 800, fontSize: 12, display: 'inline-block', marginBottom: 14 }}>Урт хугацааны ой</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {model.structure.map((s, i) => (
              <div key={i} style={{ background: `${s.color}22`, border: `2px solid ${s.color}`, borderRadius: 10, padding: '8px 6px', fontWeight: 700, fontSize: 10.5, color: 'var(--text)', width: 78 }}>{s.title.split('(')[0].trim()}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (model.diagram === 'levels') {
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '90%' }}>
          {model.structure.map((s, i) => (
            <div key={i} style={{ background: `${s.color}22`, border: `2px solid ${s.color}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 900, color: s.color, fontSize: 14 }}>{i + 1}</span>
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{s.title.split('(')[0].trim()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (model.diagram === 'curve') {
    return (
      <div style={wrap}>
        <svg width="240" height="160" viewBox="0 0 240 160">
          <line x1="30" y1="10" x2="30" y2="140" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="30" y1="140" x2="230" y2="140" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M30 18 Q70 110 130 128 T230 138" fill="none" stroke="#EF4444" strokeWidth="3" />
          <path d="M30 18 Q90 70 150 80 T230 90" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="5,4" />
          <text x="120" y="156" textAnchor="middle" fontSize="10" fill="#9CA3AF">Хугацаа →</text>
          <text x="14" y="80" textAnchor="middle" fontSize="10" fill="#9CA3AF" transform="rotate(-90 14 80)">Санах %</text>
          <circle cx="200" cy="92" r="4" fill="#10B981" /><text x="208" y="96" fontSize="9" fill="#10B981">давталттай</text>
          <circle cx="200" cy="135" r="4" fill="#EF4444" /><text x="208" y="139" fontSize="9" fill="#EF4444">давталтгүй</text>
        </svg>
      </div>
    );
  }

  return <div style={wrap}><span style={{ fontSize: 64 }}>{model.icon}</span></div>;
}
