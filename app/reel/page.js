'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const REELS = [
  {
    id: 1, char: '你好', pinyin: 'nǐ hǎo', meaning: 'Сайн уу',
    example: '你好，我叫小明。', exMn: 'Сайн уу, миний нэр Сяо Мин.',
    level: 'HSK 1', color: '#7C3AED', bg: 'linear-gradient(160deg, #7C3AED 0%, #4C1D95 100%)',
    tip: 'Энэ бол хамгийн анхны мэндчилгээ юм. Өглөө, өдөр, орой ямар ч үед хэрэглэнэ.',
    likes: 234, saves: 89,
  },
  {
    id: 2, char: '谢谢', pinyin: 'xiè xiè', meaning: 'Баярлалаа',
    example: '谢谢你的帮助！', exMn: 'Таны тусламжид баярлалаа!',
    level: 'HSK 1', color: '#EF4444', bg: 'linear-gradient(160deg, #EF4444 0%, #7F1D1D 100%)',
    tip: '谢谢 гэдгийг давтан хэлэхэд илүү баяртай харагддаг: 谢谢谢谢！',
    likes: 187, saves: 63,
  },
  {
    id: 3, char: '再见', pinyin: 'zài jiàn', meaning: 'Баяртай',
    example: '再见，明天见！', exMn: 'Баяртай, маргааш уулзъя!',
    level: 'HSK 1', color: '#10B981', bg: 'linear-gradient(160deg, #10B981 0%, #065F46 100%)',
    tip: '再 = Дахин, 见 = Уулзах. Утга нь "Дахин уулзая" гэсэн утгатай!',
    likes: 312, saves: 110,
  },
  {
    id: 4, char: '学习', pinyin: 'xué xí', meaning: 'Суралцах',
    example: '我喜欢学习汉语。', exMn: 'Би хятад хэл сурахдаа дуртай.',
    level: 'HSK 1', color: '#3B82F6', bg: 'linear-gradient(160deg, #3B82F6 0%, #1E3A8A 100%)',
    tip: '学 = Суралцах, 习 = Дасгалжуулах. Хоёулаа нийлж "суралцах" утга өгдөг.',
    likes: 156, saves: 74,
  },
  {
    id: 5, char: '朋友', pinyin: 'péng yǒu', meaning: 'Найз',
    example: '他是我最好的朋友。', exMn: 'Тэр бол миний хамгийн сайн найз.',
    level: 'HSK 1', color: '#F59E0B', bg: 'linear-gradient(160deg, #F59E0B 0%, #78350F 100%)',
    tip: '朋 болон 友 хоёулаа "найз" гэсэн утгатай тэмдэгт. Хоёулаа нийлснээр хүчтэй болдог!',
    likes: 278, saves: 95,
  },
];

export default function ReelPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [idx, setIdx]         = useState(0);
  const [liked, setLiked]     = useState(new Set());
  const [saved, setSaved]     = useState(new Set());
  const [showTip, setShowTip] = useState(false);
  const [addedXP, setXP]      = useState(null);
  const containerRef = useRef(null);
  const startYRef    = useRef(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
  }, [authLoad, user]);

  function goNext() {
    if (idx < REELS.length - 1) {
      setIdx(i => i + 1);
      setShowTip(false);
    }
  }

  function goPrev() {
    if (idx > 0) {
      setIdx(i => i - 1);
      setShowTip(false);
    }
  }

  function toggleLike(id) {
    setLiked(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function toggleSave(id) {
    setSaved(s => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); } else {
        n.add(id);
        api.post('/api/words', {
          front: REELS.find(r => r.id === id)?.char,
          back: REELS.find(r => r.id === id)?.meaning,
          hint: REELS.find(r => r.id === id)?.pinyin,
        }).catch(() => {});
        setXP('+15 XP');
        setTimeout(() => setXP(null), 2000);
      }
      return n;
    });
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx]);

  function onTouchStart(e) { startYRef.current = e.touches[0].clientY; }
  function onTouchEnd(e) {
    if (startYRef.current === null) return;
    const dy = startYRef.current - e.changedTouches[0].clientY;
    if (dy > 50) goNext();
    if (dy < -50) goPrev();
    startYRef.current = null;
  }

  if (authLoad) return null;

  const reel = REELS[idx];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f', overflow: 'hidden', position: 'relative' }}>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
      }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: -0.5 }}>
          ▶ Reel
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="tag tag-purple" style={{ fontSize: 12, padding: '4px 10px' }}>{reel.level}</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {REELS.map((_, i) => (
              <div key={i} onClick={() => { setIdx(i); setShowTip(false); }} style={{
                width: i === idx ? 20 : 6, height: 6, borderRadius: 100, cursor: 'pointer',
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: reel.bg, transition: 'background 0.4s ease', position: 'relative',
        }}
      >
        {/* XP popup */}
        {addedXP && (
          <div style={{
            position: 'absolute', top: 80, right: 80, zIndex: 30,
            background: '#10B981', color: '#fff', fontWeight: 900, fontSize: 18,
            padding: '10px 20px', borderRadius: 100, boxShadow: '0 4px 20px rgba(16,185,129,0.5)',
            animation: 'float 1.5s ease forwards',
          }}>
            {addedXP}
          </div>
        )}

        {/* Main content */}
        <div style={{ textAlign: 'center', padding: '0 40px', maxWidth: 480 }}>
          {/* Big character */}
          <div style={{
            fontSize: 110, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 8,
            textShadow: '0 8px 40px rgba(0,0,0,0.4)',
            animation: 'scale-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            {reel.char}
          </div>

          {/* Pinyin */}
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.85)', fontWeight: 700, marginBottom: 10, letterSpacing: 2 }}>
            {reel.pinyin}
          </div>

          {/* Meaning */}
          <div style={{ fontSize: 22, color: '#fff', fontWeight: 800, marginBottom: 24 }}>
            {reel.meaning}
          </div>

          {/* Example */}
          <div style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
            borderRadius: 18, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginBottom: 6 }}>{reel.example}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{reel.exMn}</div>
          </div>

          {/* Tip toggle */}
          <button onClick={() => setShowTip(t => !t)} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', borderRadius: 100, padding: '8px 20px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.14s',
            backdropFilter: 'blur(6px)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            💡 {showTip ? 'Нуух' : 'Зөвлөмж харах'}
          </button>

          {showTip && (
            <div style={{
              marginTop: 12, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
              borderRadius: 16, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.25)',
              fontSize: 13, color: '#fff', lineHeight: 1.6, fontWeight: 500,
            }}>
              {reel.tip}
            </div>
          )}
        </div>

        {/* Nav arrows */}
        <button onClick={goPrev} disabled={idx === 0} style={{
          position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: idx === 0 ? 0.3 : 1, backdropFilter: 'blur(6px)', transition: 'all 0.14s',
        }}>‹</button>
        <button onClick={goNext} disabled={idx === REELS.length - 1} style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: idx === REELS.length - 1 ? 0.3 : 1, backdropFilter: 'blur(6px)', transition: 'all 0.14s',
        }}>›</button>
      </div>

      {/* Bottom actions */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        padding: '0 0 24px', display: 'flex', justifyContent: 'center', gap: 16,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
        paddingTop: 40,
      }}>
        {/* Like */}
        <button onClick={() => toggleLike(reel.id)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 18, padding: '12px 20px', cursor: 'pointer', backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: 26, filter: liked.has(reel.id) ? 'drop-shadow(0 0 8px #EF4444)' : 'none' }}>
            {liked.has(reel.id) ? '❤️' : '🤍'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>
            {reel.likes + (liked.has(reel.id) ? 1 : 0)}
          </span>
        </button>

        {/* Save to vocab */}
        <button onClick={() => toggleSave(reel.id)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          background: saved.has(reel.id) ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.12)',
          border: `1px solid ${saved.has(reel.id) ? '#10B981' : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 18, padding: '12px 20px', cursor: 'pointer', backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: 26 }}>{saved.has(reel.id) ? '✅' : '📌'}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>
            {saved.has(reel.id) ? 'Хадгалсан' : 'Хадгалах'}
          </span>
        </button>

        {/* Share */}
        <button style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 18, padding: '12px 20px', cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: 26 }}>↗</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Хуваалцах</span>
        </button>

        {/* Next */}
        <button onClick={goNext} disabled={idx === REELS.length - 1} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          background: 'rgba(124,58,237,0.6)', border: '1px solid rgba(124,58,237,0.8)',
          borderRadius: 18, padding: '12px 20px', cursor: 'pointer', backdropFilter: 'blur(8px)',
          opacity: idx === REELS.length - 1 ? 0.4 : 1, transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: 26 }}>▶</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Дараах</span>
        </button>
      </div>

      <style>{`
        @keyframes scale-in { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes float { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
      `}</style>
    </div>
  );
}
