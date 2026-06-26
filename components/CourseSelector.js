'use client';
import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/lib/LangContext';
import { LANGS } from '@/lib/courses';

export default function CourseSelector() {
  const { lang, setLang, langInfo } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
        border: '1.5px solid var(--border)', borderRadius: 12, padding: '7px 12px',
        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13, color: 'var(--text)',
      }}>
        <span style={{ fontSize: 18 }}>{langInfo.flag}</span>
        <span>{langInfo.native}</span>
        <span style={{ color: 'var(--muted)', fontSize: 11, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 240, zIndex: 200,
          background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14,
          boxShadow: '0 12px 32px rgba(0,0,0,0.14)', padding: 8, overflow: 'hidden',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', letterSpacing: 0.6, padding: '8px 10px 6px', textTransform: 'uppercase' }}>Миний хэлүүд</div>
          {LANGS.map(l => {
            const active = l.code === lang;
            return (
              <button key={l.code} disabled={l.soon}
                onClick={() => { if (!l.soon) { setLang(l.code); setOpen(false); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 10px',
                  borderRadius: 10, border: 'none', cursor: l.soon ? 'default' : 'pointer', fontFamily: 'inherit',
                  background: active ? 'var(--purple-light)' : 'transparent', textAlign: 'left', opacity: l.soon ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!active && !l.soon) e.currentTarget.style.background = 'var(--bg-alt)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ fontSize: 22 }}>{l.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: active ? 'var(--purple)' : 'var(--text)' }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{l.native}</div>
                </div>
                {active && <span style={{ color: 'var(--purple)', fontWeight: 900 }}>✓</span>}
                {l.soon && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', background: 'var(--bg-alt)', borderRadius: 6, padding: '2px 6px' }}>Удахгүй</span>}
              </button>
            );
          })}
          <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />
          <button onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', color: 'var(--text-sub)', fontWeight: 700, fontSize: 13 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>＋</span>
            Шинэ хэл нэмэх
          </button>
        </div>
      )}
    </div>
  );
}
