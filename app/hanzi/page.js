'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import HanziTracer from '@/components/HanziTracer';

const HANZI_LIST = [
  { char: '你', pinyin: 'nǐ', meaning: 'Чи (та)', strokes: 7, level: 'HSK 1', category: 'Үндсэн' },
  { char: '好', pinyin: 'hǎo', meaning: 'Сайн', strokes: 6, level: 'HSK 1', category: 'Үндсэн' },
  { char: '我', pinyin: 'wǒ', meaning: 'Би', strokes: 7, level: 'HSK 1', category: 'Үндсэн' },
  { char: '是', pinyin: 'shì', meaning: 'Байна/тийм', strokes: 9, level: 'HSK 1', category: 'Үйл үг' },
  { char: '的', pinyin: 'de', meaning: 'Хамааруулах тусгаарлагч', strokes: 8, level: 'HSK 1', category: 'Хэсэг' },
  { char: '学', pinyin: 'xué', meaning: 'Суралцах', strokes: 8, level: 'HSK 1', category: 'Үйл үг' },
  { char: '中', pinyin: 'zhōng', meaning: 'Дундад', strokes: 4, level: 'HSK 1', category: 'Үндсэн' },
  { char: '文', pinyin: 'wén', meaning: 'Хэл, уран зохиол', strokes: 4, level: 'HSK 1', category: 'Үндсэн' },
  { char: '汉', pinyin: 'hàn', meaning: 'Хань (хятад)', strokes: 5, level: 'HSK 1', category: 'Нэр' },
  { char: '语', pinyin: 'yǔ', meaning: 'Хэл (яриа)', strokes: 9, level: 'HSK 1', category: 'Нэр' },
  { char: '人', pinyin: 'rén', meaning: 'Хүн', strokes: 2, level: 'HSK 1', category: 'Үндсэн' },
  { char: '大', pinyin: 'dà', meaning: 'Том', strokes: 3, level: 'HSK 1', category: 'Тэмдэг нэр' },
  { char: '小', pinyin: 'xiǎo', meaning: 'Жижиг', strokes: 3, level: 'HSK 1', category: 'Тэмдэг нэр' },
  { char: '山', pinyin: 'shān', meaning: 'Уул', strokes: 3, level: 'HSK 1', category: 'Байгаль' },
  { char: '水', pinyin: 'shuǐ', meaning: 'Ус', strokes: 4, level: 'HSK 1', category: 'Байгаль' },
  { char: '火', pinyin: 'huǒ', meaning: 'Гал', strokes: 4, level: 'HSK 1', category: 'Байгаль' },
  { char: '木', pinyin: 'mù', meaning: 'Мод', strokes: 4, level: 'HSK 1', category: 'Байгаль' },
  { char: '日', pinyin: 'rì', meaning: 'Нар, өдөр', strokes: 4, level: 'HSK 1', category: 'Байгаль' },
  { char: '月', pinyin: 'yuè', meaning: 'Сар', strokes: 4, level: 'HSK 1', category: 'Байгаль' },
  { char: '王', pinyin: 'wáng', meaning: 'Хаан', strokes: 4, level: 'HSK 2', category: 'Нэр' },
];

const LEVELS = ['Бүгд', 'HSK 1', 'HSK 2', 'HSK 3'];
const CATS   = ['Бүгд', 'Үндсэн', 'Үйл үг', 'Тэмдэг нэр', 'Байгаль', 'Нэр', 'Хэсэг'];

// Жишээ үг (compound words) ба санах холбоо (mnemonic)
const HANZI_EXTRA = {
  你: { ex: [['你好', 'nǐ hǎo', 'Сайн уу'], ['你们', 'nǐmen', 'Та нар']], link: '"Хүн" (亻) + "хувь" → нөгөө хүн = ЧИ' },
  好: { ex: [['你好', 'nǐ hǎo', 'Сайн уу'], ['好吃', 'hǎochī', 'Амттай']], link: '"Эмэгтэй" (女) + "хүүхэд" (子) = САЙН' },
  我: { ex: [['我们', 'wǒmen', 'Бид'], ['我的', 'wǒ de', 'Миний']], link: 'Гар + жад барьсан → өөрийгөө хамгаалагч = БИ' },
  是: { ex: [['是的', 'shì de', 'Тийм'], ['不是', 'bù shì', 'Биш']], link: '"Нар" (日) дор зөв зүйл = БАЙНА/ТИЙМ' },
  的: { ex: [['我的', 'wǒ de', 'Миний'], ['好的', 'hǎo de', 'Зүгээр']], link: '"Цагаан" (白) + халбага → эзэмшил тэмдэг' },
  学: { ex: [['学生', 'xuéshēng', 'Сурагч'], ['学习', 'xuéxí', 'Суралцах']], link: 'Хүүхэд (子) дээвэр дор ном үздэг = СУРАЛЦАХ' },
  中: { ex: [['中国', 'zhōngguó', 'Хятад'], ['中文', 'zhōngwén', 'Хятад хэл']], link: 'Дөрвөлжинг дундуур нь зүссэн зураас = ДУНД' },
  文: { ex: [['中文', 'zhōngwén', 'Хятад хэл'], ['文化', 'wénhuà', 'Соёл']], link: 'Хөндлөн зураасууд = бичиг, УРАН ЗОХИОЛ' },
  人: { ex: [['人们', 'rénmen', 'Хүмүүс'], ['中国人', 'zhōngguórén', 'Хятад хүн']], link: 'Хоёр хөл алхаж буй = ХҮН' },
  大: { ex: [['大学', 'dàxué', 'Их сургууль'], ['大人', 'dàrén', 'Том хүн']], link: 'Хүн (人) гараа дэлгэсэн = ТОМ' },
  小: { ex: [['小学', 'xiǎoxué', 'Бага сургууль'], ['小心', 'xiǎoxīn', 'Болгоомжтой']], link: 'Жижиг гурван цэг = ЖИЖИГ' },
  水: { ex: [['水果', 'shuǐguǒ', 'Жимс'], ['喝水', 'hē shuǐ', 'Ус уух']], link: 'Урсаж буй гол = УС' },
  火: { ex: [['火车', 'huǒchē', 'Галт тэрэг'], ['火山', 'huǒshān', 'Галт уул']], link: 'Дээш бялхах дөл = ГАЛ' },
  日: { ex: [['日本', 'rìběn', 'Япон'], ['生日', 'shēngrì', 'Төрсөн өдөр']], link: 'Дугуй нар тэмдэглэсэн = НАР/ӨДӨР' },
  月: { ex: [['月亮', 'yuèliang', 'Сар'], ['几月', 'jǐ yuè', 'Хэдэн сар']], link: 'Хавирган сар = САР' },
};

export default function HanziPage() {
  const { user, loading: authLoad } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState(HANZI_LIST[0]);
  const [streak, setStreak]     = useState(0);
  const [search, setSearch]     = useState('');
  const [lvl, setLvl]           = useState('Бүгд');
  const [cat, setCat]           = useState('Бүгд');
  const [practiced, setPrac]    = useState(new Set());
  const [calDays, setCalDays]   = useState([]);
  const [panel, setPanel]       = useState(null); // null | 'examples' | 'link'
  const tracerRef = useRef(null);

  function speak(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (user) {
      api.get('/api/streak').then(r => {
        const s = r.data.streak || 0;
        setStreak(s);
        const today = new Date();
        setCalDays(Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          return {
            label: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'][d.getDay()],
            active: i >= 7 - s,
            today: i === 6,
          };
        }));
      }).catch(() => {});
    }
  }, [authLoad, user]);

  const filtered = HANZI_LIST.filter(h => {
    const matchLvl = lvl === 'Бүгд' || h.level === lvl;
    const matchCat = cat === 'Бүгд' || h.category === cat;
    const q = search.toLowerCase();
    const matchSrch = !q || h.char.includes(q) || h.pinyin.toLowerCase().includes(q) || h.meaning.toLowerCase().includes(q);
    return matchLvl && matchCat && matchSrch;
  });

  const writingPct = Math.round((practiced.size / HANZI_LIST.length) * 100);

  if (authLoad) return null;

  return (
    <div style={{ paddingBottom: 32 }}>
      <PageHeader
        title="Ханз бичих дасгал 汉"
        subtitle="Хятад тэмдэгтийн бичилт, зурааслал, утгыг судал."
        streak={streak}
      />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '0 28px', marginBottom: 18 }}>
        {[
          { label: 'Нийт тэмдэгт',  value: HANZI_LIST.length, icon: '汉', color: 'var(--purple)', bg: 'var(--purple-light)' },
          { label: 'Дасгалласан',    value: practiced.size,    icon: '✏️',  color: '#10B981',       bg: '#ECFDF5' },
          { label: 'Өнөөдрийн зорилго', value: `${Math.min(practiced.size, 10)}/10`, icon: '🎯', color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'Цуваа',          value: streak,            icon: '🔥',  color: '#EF4444',       bg: '#FEF2F2' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, flexShrink: 0, color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '220px 1fr 248px', gap: 16 }}>

        {/* Left: Character list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content', maxHeight: 700 }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1.5px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 14 }}>🔍</span>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Хайх..." style={{ paddingLeft: 36, fontSize: 12, padding: '9px 10px 9px 36px' }} />
            </div>
          </div>
          {/* Level filter */}
          <div style={{ display: 'flex', gap: 4, padding: '8px 10px', overflowX: 'auto', borderBottom: '1.5px solid var(--border)' }}>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLvl(l)} style={{
                padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.12s',
                background: lvl === l ? 'var(--purple)' : 'var(--bg-alt)',
                color: lvl === l ? '#fff' : 'var(--text-sub)',
              }}>{l}</button>
            ))}
          </div>
          {/* Character list */}
          <div style={{ overflowY: 'auto', maxHeight: 540 }}>
            {filtered.map(h => {
              const isSel = selected?.char === h.char;
              const isPrac = practiced.has(h.char);
              return (
                <div key={h.char} onClick={() => { setSelected(h); setPanel(null); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                  cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background 0.12s',
                  background: isSel ? 'var(--purple-light)' : 'transparent',
                  borderLeft: isSel ? '3px solid var(--purple)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-alt)'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: isSel ? 'var(--purple)' : 'var(--bg-alt)',
                    border: `1.5px solid ${isSel ? 'var(--purple-dark)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900,
                    color: isSel ? '#fff' : 'var(--text)',
                  }}>{h.char}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: isSel ? 'var(--purple-dark)' : 'var(--text)' }}>{h.pinyin}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.meaning}</div>
                  </div>
                  {isPrac && <span style={{ fontSize: 12, color: '#10B981' }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Tracing canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selected ? (
            <>
              {/* Character header */}
              <div className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: 18, background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 38, fontWeight: 900, color: '#fff', flexShrink: 0,
                    boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
                  }}>{selected.char}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{selected.char}</span>
                      <span className="tag tag-purple">{selected.level}</span>
                      <span className="tag">{selected.category}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--purple)', marginBottom: 3 }}>{selected.pinyin}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-sub)' }}>{selected.meaning}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: 22, color: 'var(--purple)' }}>{selected.strokes}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>зурааслал</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" style={{ fontSize: 13, padding: '8px 14px' }}
                    onClick={() => speak(selected.char)}>🔊 Дуу</button>
                  <button className="btn btn-outline" style={{ fontSize: 13, padding: '8px 14px', background: panel === 'examples' ? 'var(--purple-light)' : undefined }}
                    onClick={() => setPanel(p => p === 'examples' ? null : 'examples')}>📋 Жишээ</button>
                  <button className="btn btn-outline" style={{ fontSize: 13, padding: '8px 14px', background: panel === 'link' ? 'var(--purple-light)' : undefined }}
                    onClick={() => setPanel(p => p === 'link' ? null : 'link')}>🔗 Холбоо</button>
                  <button className="btn btn-purple" style={{ fontSize: 13, padding: '8px 14px', marginLeft: 'auto' }}
                    onClick={() => setPrac(s => { const n = new Set(s); n.add(selected.char); return n; })}>
                    ✓ Хийсэн
                  </button>
                </div>

                {/* Жишээ үг панел */}
                {panel === 'examples' && (
                  <div style={{ marginTop: 14, padding: '14px 16px', background: 'var(--bg-alt)', borderRadius: 12, border: '1.5px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 10 }}>📋 ЖИШЭЭ ҮГ</div>
                    {(HANZI_EXTRA[selected.char]?.ex || []).length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {HANZI_EXTRA[selected.char].ex.map(([w, p, m]) => (
                          <div key={w} onClick={() => speak(w)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '6px 4px' }}>
                            <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{w}</span>
                            <span style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700 }}>{p}</span>
                            <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{m}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--muted)' }}>🔊</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>Энэ тэмдэгтэд жишээ үг удахгүй нэмэгдэнэ.</div>
                    )}
                  </div>
                )}

                {/* Санах холбоо панел */}
                {panel === 'link' && (
                  <div style={{ marginTop: 14, padding: '14px 16px', background: 'var(--purple-soft)', borderRadius: 12, border: '1.5px solid var(--purple-mid)' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple)', marginBottom: 8 }}>🔗 САНАХ ХОЛБОО</div>
                    <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, lineHeight: 1.5 }}>
                      {HANZI_EXTRA[selected.char]?.link || `"${selected.char}" (${selected.pinyin}) — ${selected.meaning}. Зурааслалыг дахин дахин бичиж тогтооё!`}
                    </div>
                  </div>
                )}
              </div>

              {/* Tracer */}
              <div className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ✏️ Бичих дасгал
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>— зурааслалыг дага</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <HanziTracer ref={tracerRef} key={selected.char} char={selected.char}
                    onComplete={() => setPrac(s => { const n = new Set(s); n.add(selected.char); return n; })} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 18px' }}
                    onClick={() => tracerRef.current?.replay()}>⟳ Дахин эхлэх</button>
                  <button className="btn btn-purple" style={{ fontSize: 13, padding: '8px 18px' }}
                    onClick={() => tracerRef.current?.showStrokes()}>▶ Зурааслал харах</button>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 64, marginBottom: 14 }}>汉</div>
              <h3 style={{ fontWeight: 800, color: 'var(--text)' }}>Тэмдэгт сонгоно уу</h3>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Writing level */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 14 }}>Бичилтийн түвшин</div>
              <span className="tag tag-purple">Lv.4</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 5 }}>
                <span>Дараагийн түвшин Lv.5</span>
                <span>{writingPct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${writingPct}%`, background: 'linear-gradient(90deg, var(--purple), var(--purple-dark))', borderRadius: 100, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{practiced.size} / {HANZI_LIST.length} тэмдэгт дасгалласан</div>
          </div>

          {/* Daily goal */}
          <div className="card">
            <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 12 }}>🎯 Өдрийн зорилго</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', position: 'relative', flexShrink: 0,
                background: `conic-gradient(var(--purple) ${Math.min(practiced.size, 10) * 36}deg, var(--border) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'var(--purple)' }}>
                  {Math.min(practiced.size, 10)}/10
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>Тэмдэгт дасгалла</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>10 тэмдэгт дасгаллаарай</div>
              </div>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(practiced.size, 10) * 10}%`, background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: 100, transition: 'width 0.4s' }} />
            </div>
          </div>

          {/* 7-day calendar */}
          <div className="card">
            <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 12 }}>7 хоногийн идэвх</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {calDays.map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, margin: '0 auto',
                    background: d.active ? (d.today ? 'var(--purple)' : '#C4B5FD') : 'var(--border)',
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Ханзын мод */}
          <div className="card">
            <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 10 }}>🌳 Ханзын мод</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '42%', background: '#10B981', borderRadius: 100 }} />
              </div>
              <span style={{ fontWeight: 800, color: '#10B981', fontSize: 13 }}>42%</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>Радикалуудын ойлголтоор 42% дууссан. Цааш үргэлжлүүлнэ үү!</p>
          </div>

          {/* Suggested lessons */}
          <div className="card">
            <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 12 }}>💡 Санал болгох</div>
            {[
              { icon: '🌟', title: '水 радикал', sub: '12 тэмдэгт' },
              { icon: '✏️', title: '人 бүтэц', sub: '8 тэмдэгт' },
              { icon: '🎯', title: 'HSK 2 бичилт', sub: '20 тэмдэгт' },
            ].map((l, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px',
                borderRadius: 10, cursor: 'pointer', transition: 'background 0.12s', marginBottom: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{l.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.sub}</div>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
