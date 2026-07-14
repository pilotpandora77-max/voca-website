'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { getCourses } from '@/lib/courses';
import { useLang } from '@/lib/LangContext';

// Pinyin аялгын тэмдгийг арилгах
function stripTone(s = '') {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s'\u00b7-]/g, '').toLowerCase();
}

// Локал хайлтын сан — курсын Хятад үгсээс
const LOCAL_ZH = getCourses('zh').flatMap(c => c.words).map(w => ({
  simplified: w.target, traditional: w.target, pinyin: w.reading, reading: w.reading,
  mn: w.mn, meaning: w.mn, english: w.target, definitions: [w.mn],
  examples: w.examples, hsk: 'HSK 1',
}));

// Локал хайлтын сан — курсын Англи үгсээс
const LOCAL_EN = getCourses('en').flatMap(c => c.words).map(w => ({
  simplified: w.target, traditional: w.target, pinyin: w.reading, reading: w.reading,
  mn: w.mn, meaning: w.mn, english: w.target, definitions: w.type ? [w.type] : [],
  examples: w.examples, related: w.related, level: 'A1',
}));

// Backend-ийн /api/english гарц бүрийг дэлгэцийн ерөнхий бүтэцрүү хөрвүүлэх
function normalizeEnEntry(e) {
  return {
    simplified: e.word, traditional: e.word, pinyin: e.ipa, reading: e.ipa,
    mn: e.mn, meaning: e.mn, english: e.word, definitions: e.pos ? [e.pos] : [],
    examples: e.example ? [{ en: e.example, mn: '' }] : [], level: e.level,
  };
}

function HanziAnimate({ char, size = 230 }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!char || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    let cancelled = false;
    import('hanzi-writer').then(m => {
      const HanziWriter = m.default;
      const writer = HanziWriter.create(containerRef.current, char, {
        width: size, height: size, padding: 24,
        showOutline: true,
        strokeColor: '#7C3AED',
        outlineColor: '#DDD6FE',
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
      });
      function loop() {
        if (cancelled) return;
        writer.animateCharacter({ onComplete: () => { if (!cancelled) setTimeout(loop, 900); } });
      }
      loop();
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [char]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <rect x={1} y={1} width={size-2} height={size-2} fill="none" stroke="#E5E5E5" strokeWidth={2} rx={12} />
        <line x1={size/2} y1={0} x2={size/2} y2={size} stroke="#E5E5E5" strokeWidth={1} strokeDasharray="6,4" />
        <line x1={0} y1={size/2} x2={size} y2={size/2} stroke="#E5E5E5" strokeWidth={1} strokeDasharray="6,4" />
      </svg>
      <div ref={containerRef} style={{ width: size, height: size, borderRadius: 12 }} />
    </div>
  );
}

const FILTER_TABS = ['Бүгд', 'Үг', 'Хэлц', 'Жишээ', 'Идиом'];
const LANG_MODES  = [
  { key: 'auto',   label: '🔄 Авто' },
  { key: 'zh',     label: '汉 Хятад' },
  { key: 'pinyin', label: 'Pīn Pinyin' },
  { key: 'mn',     label: 'Мн Монгол' },
  { key: 'en',     label: 'EN Англи' },
];

function speak(text, lang = 'zh-CN') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

export default function DictionaryPage() {
  const { user, loading: authLoad } = useAuth();
  const { lang: courseLang } = useLang();
  const isEn = courseLang === 'en';
  const router = useRouter();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [streak, setStreak]     = useState(0);
  const [filter, setFilter]     = useState('Бүгд');
  const [langMode, setLang]     = useState('auto');
  const [addedMsg, setAdded]    = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [tracerChar, setTracerChar] = useState('');

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
  }, [authLoad, user]);

  useEffect(() => {
    const chars = selected?.simplified || selected?.traditional || '';
    setTracerChar(chars[0] || '');
  }, [selected]);

  function detectLang(q) {
    if (langMode !== 'auto') return langMode;
    if (/[一-鿿]/.test(q)) return 'zh';
    if (/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(q) || /[a-z]+[0-9]/.test(q)) return 'pinyin';
    if (/^[a-zA-Z\s'-]+$/.test(q)) return 'en';
    return 'mn';
  }

  // Mongolian → Chinese direct mapping (for fast exact lookup)
  const MN_ZH = {
    // Төлөөний үг
    'би': '我', 'чи': '你', 'та': '您', 'тэр': '他', 'тэр эм': '她',
    'бид': '我们', 'та нар': '你们', 'тэд': '他们',
    // Мэндчилгээ
    'сайн уу': '你好', 'сайн байна уу': '你好吗', 'баярлалаа': '谢谢',
    'баяртай': '再见', 'өглөөний мэнд': '早上好', 'оройн мэнд': '晚上好',
    'уучлаарай': '对不起', 'болж байна': '没关系',
    // Тоо
    'нэг': '一', 'хоёр': '二', 'гурав': '三', 'дөрөв': '四', 'тав': '五',
    'зургаа': '六', 'долоо': '七', 'найм': '八', 'ес': '九', 'арав': '十',
    'зуу': '百', 'мянга': '千', 'арав мянга': '万',
    // Гэр бүл
    'ааваа': '爸爸', 'эжий': '妈妈', 'ах': '哥哥', 'эгч': '姐姐',
    'дүү эрэгтэй': '弟弟', 'дүү эмэгтэй': '妹妹', 'өвөө': '爷爷', 'эмээ': '奶奶',
    'найз': '朋友', 'нөхөр': '丈夫', 'эхнэр': '妻子',
    // Цаг хугацаа
    'өнөөдөр': '今天', 'маргааш': '明天', 'өчигдөр': '昨天',
    'одоо': '现在', 'цаг': '时间', 'жил': '年', 'сар': '月', 'өдөр': '天',
    'долоо хоног': '星期', 'даваа': '星期一', 'мягмар': '星期二',
    'лхагва': '星期三', 'пүрэв': '星期四', 'баасан': '星期五',
    'бямба': '星期六', 'ням': '星期日',
    // Үйл үг
    'идэх': '吃', 'уух': '喝', 'явах': '去', 'ирэх': '来', 'харах': '看',
    'сонсох': '听', 'хэлэх': '说', 'уншах': '读', 'бичих': '写',
    'сурах': '学习', 'ажиллах': '工作', 'унтах': '睡觉', 'тоглох': '玩',
    'дуртай': '喜欢', 'хайрлах': '爱', 'мэдэх': '知道', 'болох': '可以',
    'хүсэх': '想', 'авах': '买', 'өгөх': '给',
    // Тэмдэг нэр
    'сайн': '好', 'муу': '坏', 'том': '大', 'жижиг': '小', 'олон': '多',
    'цөөн': '少', 'хурдан': '快', 'удаан': '慢', 'шинэ': '新', 'хуучин': '旧',
    'халуун': '热', 'хүйтэн': '冷', 'хямд': '便宜', 'үнэтэй': '贵',
    'гоё': '漂亮', 'муухай': '丑', 'аз жаргалтай': '高兴', 'гунигтай': '难过',
    // Нэр үг
    'хүн': '人', 'хүүхэд': '孩子', 'ном': '书', 'ус': '水', 'хоол': '食物',
    'цай': '茶', 'кофе': '咖啡', 'гэр': '家', 'сургууль': '学校',
    'ажлын газар': '公司', 'дэлгүүр': '商店', 'зам': '路', 'машин': '车',
    'утас': '手机', 'компьютер': '电脑', 'мөнгө': '钱', 'хэл': '语言',
    'үг': '词', 'хятад': '中文', 'монгол': '蒙古语',
    // Асуух үг
    'юу': '什么', 'хэн': '谁', 'хаана': '哪里', 'хэзээ': '什么时候',
    'яагаад': '为什么', 'хэрхэн': '怎么', 'хэд': '多少',
  };

  // Chinese → Mongolian reverse mapping (auto-generated from MN_ZH)
  const ZH_MN = Object.fromEntries(Object.entries(MN_ZH).map(([mn, zh]) => [zh, mn]));

  async function search(e) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true); setSearched(true); setSelected(null);

    if (isEn) {
      try {
        const list = await searchEn(q);
        setResults(list);
        if (list.length === 1) setSelected(list[0]);
      } catch {
        setResults(localSearchEn(q));
      }
      setLoading(false);
      return;
    }

    try {
      const lang = detectLang(q);
      let list = [];

      // Монгол үг бол эхлээд MN_ZH direct mapping шалгана — backend-ийн
      // буруу English partial match-аас урьдчилан сэргийлнэ
      if (lang === 'mn') {
        const zhChar = MN_ZH[q.toLowerCase()];
        if (zhChar) {
          const { data } = await api.get(`/api/dictionary?q=${encodeURIComponent(zhChar)}`);
          list = Array.isArray(data) ? data : [];
        }
      }

      // MN_ZH-д олдоогүй бол backend-рүү хайна (ханз/pinyin/backend mn field)
      if (list.length === 0) {
        try {
          const { data } = await api.get(`/api/dictionary?q=${encodeURIComponent(q)}`);
          list = Array.isArray(data) ? data : (data && !data.error ? [data] : []);
        } catch {}
      }

      // Backend хоосон бол локал (курсын) сангаас pinyin/ханз/монголоор хайна
      if (list.length === 0) {
        list = localSearch(q, lang);
      }

      setResults(list);
      if (list.length === 1) setSelected(list[0]);
    } catch {
      setResults(localSearch(q, detectLang(q)));
    }
    setLoading(false);
  }

  // Англи горим: курсын (баялаг метадатай) сан + backend-ийн 8600+ үгтэй толь хосолно
  async function searchEn(q) {
    const nq = q.toLowerCase();
    const localHits = LOCAL_EN.filter(w =>
      w.simplified.toLowerCase().includes(nq) || (w.mn || '').toLowerCase().includes(nq));
    let backendHits = [];
    try {
      const { data } = await api.get('/api/english', { params: { q } });
      backendHits = Array.isArray(data) ? data.map(normalizeEnEntry) : [];
    } catch {}
    const seen = new Set(localHits.map(w => w.simplified.toLowerCase()));
    const merged = [...localHits, ...backendHits.filter(w => !seen.has(w.simplified.toLowerCase()))];
    return merged.length ? merged : localSearchEn(q);
  }

  function localSearchEn(q) {
    const nq = q.toLowerCase();
    return LOCAL_EN.filter(w => w.simplified.toLowerCase().includes(nq) || (w.mn || '').toLowerCase().includes(nq)).slice(0, 20);
  }

  function localSearch(q, lang) {
    const nq = stripTone(q);
    return LOCAL_ZH.filter(w => {
      if (lang === 'zh') return w.simplified.includes(q);
      if (lang === 'pinyin') return stripTone(w.pinyin).includes(nq);
      if (lang === 'en') return (w.english || '').toLowerCase().includes(q.toLowerCase());
      if (lang === 'mn') return (w.mn || '').toLowerCase().includes(q.toLowerCase());
      // auto: бүгдээр
      return w.simplified.includes(q) || stripTone(w.pinyin).includes(nq) || (w.mn || '').toLowerCase().includes(q.toLowerCase());
    }).slice(0, 20);
  }

  async function addToVocab(word) {
    try {
      const wordVal   = word.simplified || word.traditional || word.word || word.hanzi || query;
      const mnMeaning = word.mn || ZH_MN[word.simplified] || ZH_MN[word.traditional] || '';
      const enMeaning = isEn ? '' : (Array.isArray(word.definitions) ? word.definitions.join('; ') : (word.english || word.meaning || ''));
      const meaning   = mnMeaning || enMeaning;
      const reading   = word.pinyin || word.reading || '';

      if (!wordVal || !meaning) {
        setAdded('⚠️ Мэдээлэл дутуу байна');
        setTimeout(() => setAdded(''), 2500);
        return;
      }
      await api.post('/api/words', {
        front: wordVal, back: meaning, hint: reading,
        word: wordVal, meaning, meaningEn: enMeaning, reading, lang: isEn ? 'en' : 'zh',
      });
      setAdded('✓ Нэмэгдлэ!');
      setTimeout(() => setAdded(''), 2500);
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Алдаа гарлаа';
      setAdded(`⚠️ ${msg}`);
      setTimeout(() => setAdded(''), 3000);
    }
  }

  function playAudio(word) {
    const text = word.simplified || word.traditional || word.word || word.hanzi || '';
    if (!text) return;
    setSpeaking(true);
    speak(text, isEn ? 'en-US' : 'zh-CN');
    setTimeout(() => setSpeaking(false), 2000);
  }

  if (authLoad) return null;

  return (
    <div style={{ paddingBottom: 32 }}>
      <PageHeader
        title="Толь бичиг 📖"
        subtitle={isEn ? 'Англи, монгол үгээр хайж утга, жишээ, дуудлагыг мэд.' : 'Хятад, монгол, pinyin-ээр хайж үгийн утга, жишээ, дуудлагыг мэд.'}
        streak={streak}
      />

      <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>

        {/* Main column */}
        <div>
          {/* Search bar */}
          <form onSubmit={search} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 16 }}>🔍</span>
              <input type="search" value={query} onChange={e => setQuery(e.target.value)}
                placeholder={isEn ? 'Хайх... (hello, сайн уу)' : 'Хайх... (你好, nǐ hǎo, сайн уу)'}
                style={{ paddingLeft: 44, background: '#fff', borderRadius: 14 }} />
            </div>
            <button type="submit" className="btn btn-purple" style={{ padding: '11px 22px' }}>Хайх</button>
          </form>

          {/* Language mode + Filter tabs row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {/* Language selector — Хятад олон бичгийн систем илрүүлэхэд л хэрэгтэй тул Англи горимд нуугдана */}
            {!isEn && (
              <div style={{ display: 'flex', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                {LANG_MODES.map(m => (
                  <button key={m.key} onClick={() => setLang(m.key)} style={{
                    padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                    fontFamily: 'inherit', transition: 'all 0.12s',
                    background: langMode === m.key ? 'var(--purple)' : 'transparent',
                    color: langMode === m.key ? '#fff' : 'var(--text-sub)',
                  }}>
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Filter tabs */}
            {FILTER_TABS.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.14s',
                background: filter === t ? 'var(--purple)' : '#fff',
                color: filter === t ? '#fff' : 'var(--text-sub)',
                boxShadow: filter === t ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
              }}>
                {t}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>}

          {/* Results list */}
          {!loading && searched && !selected && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map((item, i) => (
                <div key={i} className="card" style={{ cursor: 'pointer', transition: 'all 0.14s', display: 'flex', gap: 18, alignItems: 'center', padding: '16px 20px' }}
                onClick={() => setSelected(item)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-mid)'; e.currentTarget.style.background = 'var(--purple-soft)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--purple)' }}>
                    {item.simplified || item.traditional || item.word || item.hanzi || query}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: 'var(--purple)', fontWeight: 700, marginBottom: 3 }}>
                      {item.pinyin || item.reading}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      <span>{Array.isArray(item.definitions) ? item.definitions.slice(0, 2).join(' · ') : (item.english || item.meaning || '')}</span>
                      {(item.mn || ZH_MN[item.simplified] || ZH_MN[item.traditional]) && (
                        <span style={{ color: 'var(--purple)', fontWeight: 600, marginLeft: 6 }}>
                          · {item.mn || ZH_MN[item.simplified] || ZH_MN[item.traditional]}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: 20 }}>›</span>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && searched && results.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
              <p style={{ color: 'var(--text-sub)', fontWeight: 700, marginBottom: 6 }}>"{query}" үр дүн олдсонгүй</p>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Хятад тэмдэгт, pinyin, эсвэл монгол үгээр хайж үзнэ үү</p>
            </div>
          )}

          {/* Word detail */}
          {selected && !loading && (
            <div>
              {results.length > 1 && (
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)',
                  fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: 'inherit', padding: 0, transition: 'color 0.14s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--purple)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}
                >
                  ← Буцах
                </button>
              )}

              {/* Main word card */}
              <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Audio button */}
                  <button onClick={() => playAudio(selected)} style={{
                    width: 56, height: 56, borderRadius: 14, background: speaking ? 'var(--purple)' : 'var(--purple-light)',
                    border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 24, cursor: 'pointer', flexShrink: 0,
                    transition: 'all 0.2s', color: speaking ? '#fff' : 'var(--purple)',
                  }}>
                    {speaking ? '🔊' : '🔉'}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 42, fontWeight: 900, color: 'var(--text)' }}>
                        {selected.simplified || selected.traditional || selected.word || selected.hanzi}
                      </span>
                      {selected.traditional && selected.traditional !== selected.simplified && (
                        <span style={{ fontSize: 22, color: 'var(--muted)', fontWeight: 700 }}>({selected.traditional})</span>
                      )}
                      <button onClick={() => addToVocab(selected)} style={{
                        marginLeft: 'auto', background: addedMsg.startsWith('✓') ? '#ECFDF5' : 'var(--purple-light)',
                        border: `1.5px solid ${addedMsg.startsWith('✓') ? '#10B981' : 'var(--purple-mid)'}`,
                        color: addedMsg.startsWith('✓') ? '#10B981' : 'var(--purple)',
                        borderRadius: 10, padding: '7px 14px',
                        fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}>
                        {addedMsg || '+ Үгэнд нэмэх'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18, color: 'var(--purple)', fontWeight: 700 }}>
                        {selected.pinyin || selected.reading}
                      </span>
                      <button onClick={() => playAudio(selected)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                        color: 'var(--muted)', padding: '2px 6px', borderRadius: 6, fontFamily: 'inherit',
                      }}>🔊</button>
                      <span className="tag tag-purple">Үг</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {/* English */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: '#6B7280', borderRadius: 5, padding: '2px 6px', flexShrink: 0 }}>EN</span>
                        <span style={{ fontSize: 15, color: 'var(--text-sub)', fontWeight: 500, lineHeight: 1.55 }}>
                          {Array.isArray(selected.definitions)
                            ? selected.definitions.join(' / ')
                            : (selected.english || selected.meaning || '')}
                        </span>
                      </div>
                      {/* Mongolian */}
                      {(selected.mn || ZH_MN[selected.simplified] || ZH_MN[selected.traditional]) && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--purple)', borderRadius: 5, padding: '2px 6px', flexShrink: 0 }}>МН</span>
                          <span style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600, lineHeight: 1.55 }}>
                            {selected.mn || ZH_MN[selected.simplified] || ZH_MN[selected.traditional]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1.5px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Хэлний төрөл</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-sub)', fontSize: 13 }}>{isEn ? 'Англи' : 'Хятад (Мандарин)'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{isEn ? 'CEFR түвшин' : 'HSK түвшин'}</div>
                    <span className="tag tag-purple">{isEn ? (selected.level || 'A1') : 'HSK 1'}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 5 }}>Түгээмэл байдал</div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: i < 6 ? 'var(--purple)' : 'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Example sentences */}
              {(() => {
                const exampleList = selected.examples && selected.examples.length > 0 ? selected.examples
                  : (isEn ? [] : [
                    { zh: `${selected.simplified || selected.word || ''}，你好！`, mn: 'Жишээ өгүүлбэр 1' },
                    { zh: `我喜欢${selected.simplified || selected.word || ''}。`, mn: 'Би дуртай.' },
                  ]);
                if (exampleList.length === 0) return null;
                return (
                  <div className="card" style={{ marginBottom: 14 }}>
                    <h3 style={{ fontWeight: 900, fontSize: 15, marginBottom: 14 }}>Жишээ өгүүлбэрүүд</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {exampleList.slice(0, 3).map((ex, i) => {
                        const text = ex.zh || ex.en || '';
                        const sub  = ex.mn || ex.english || '';
                        return (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                            background: 'var(--bg-alt)', borderRadius: 12, border: '1.5px solid var(--border)',
                          }}>
                            <button onClick={() => speak(text, isEn ? 'en-US' : 'zh-CN')} style={{
                              width: 30, height: 30, borderRadius: '50%', background: 'var(--purple-light)',
                              border: '1.5px solid var(--purple-mid)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: 13, color: 'var(--purple)', cursor: 'pointer', flexShrink: 0,
                            }}>▶</button>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{text}</div>
                              {sub && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Related words */}
              {(!isEn || (selected.related && selected.related.length > 0)) && (
              <div className="card">
                <h3 style={{ fontWeight: 900, fontSize: 15, marginBottom: 14 }}>Холбоотой үгс</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(selected.related && selected.related.length > 0 ? selected.related : (isEn ? [] : ['你', '好', '大家好', '您好', '早上好'])).map(w => (
                    <button key={w} onClick={() => { setQuery(w); if (!isEn) setLang('zh'); setTimeout(search, 0); }} style={{
                      background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12,
                      padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit',
                      textAlign: 'center', transition: 'all 0.14s', minWidth: 72,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.background = 'var(--purple-soft)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 3 }}>{w}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>🔊</div>
                    </button>
                  ))}
                </div>
              </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!searched && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 14, animation: 'float 3s ease infinite' }}>📖</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{isEn ? 'Англи үг хайж эхлэцгээе' : 'Хятад үг хайж эхлэцгээе'}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18 }}>{isEn ? 'Англи үг эсвэл монгол утгаар хайж болно' : 'Хятад тэмдэгт, pinyin, эсвэл монгол утгаар хайж болно'}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                {(isEn ? ['hello', 'thank you', 'сайн уу', 'study', 'friend'] : ['你好', 'nǐ hǎo', 'сайн уу', '学习', '汉语']).map(ex => (
                  <button key={ex} onClick={() => { setQuery(ex); }} style={{
                    background: 'var(--purple-light)', border: '1.5px solid var(--purple-mid)',
                    color: 'var(--purple)', borderRadius: 100, padding: '7px 16px',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{ex}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Ханз зурлагын дараалал — зөвхөн Хятад курст */}
            {!isEn && tracerChar && (
              <div className="card" style={{ padding: '16px 12px' }}>
                <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 10 }}>汉 Зурлагын дараалал</div>
                {/* Олон тэмдэгт бол сонгох товч */}
                {(selected.simplified || selected.traditional || '').length > 1 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {[...(selected.simplified || selected.traditional || '')].map((c, i) => (
                      <button key={i} onClick={() => setTracerChar(c)} style={{
                        width: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                        borderColor: tracerChar === c ? 'var(--purple)' : 'var(--border)',
                        background: tracerChar === c ? 'var(--purple)' : '#fff',
                        color: tracerChar === c ? '#fff' : 'var(--text)',
                        fontWeight: 800, fontSize: 17, cursor: 'pointer', fontFamily: 'inherit',
                      }}>{c}</button>
                    ))}
                  </div>
                )}
                <HanziAnimate key={tracerChar} char={tracerChar} size={230} />
              </div>
            )}

            {/* Цээжлэхэд туслах */}
            <div className="card">
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 14 }}>Цээжлэхэд туслах</div>
              <div style={{ display: 'flex', gap: 10, padding: '11px 12px', background: 'var(--bg-alt)', borderRadius: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>🔥</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>SRS давтамж</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Маргааш давтах болно</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, padding: '11px 12px', background: 'var(--bg-alt)', borderRadius: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>📅</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>Маргааш</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Дараагийн давталт</div>
                </div>
              </div>
              <button className="btn btn-purple" onClick={() => addToVocab(selected)} style={{ width: '100%', fontSize: 13, padding: '10px' }}>
                🔄 Одоо нэмэх
              </button>
              {addedMsg && (
                <div style={{
                  marginTop: 8, fontSize: 12, fontWeight: 700, textAlign: 'center', padding: '6px',
                  color: addedMsg.startsWith('✓') ? '#10B981' : '#EF4444',
                }}>
                  {addedMsg}
                </div>
              )}
            </div>

            {/* Хурдан үйлдэл */}
            <div className="card">
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 12 }}>Хурдан үйлдэл</div>
              {[
                { icon: '🔊', label: 'Дуу сонсох', action: () => playAudio(selected) },
                { icon: '📋', label: 'Хуулбарлах', action: () => navigator.clipboard?.writeText(selected.simplified || selected.word || '') },
                { icon: '↗', label: 'Хуваалцах', action: () => {} },
                { icon: '+', label: 'Жишээ нэмэх', action: () => {} },
              ].map((a, i, arr) => (
                <div key={i} onClick={a.action} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px',
                  borderRadius: 10, cursor: 'pointer', transition: 'background 0.14s',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'var(--purple)' }}>{a.icon}</div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', flex: 1 }}>{a.label}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 16 }}>›</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="card">
              <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 10 }}>✏️ Тэмдэглэл</div>
              <textarea placeholder="Энэ үгийн талаар тэмдэглэл бичих..." style={{ minHeight: 80, resize: 'vertical', fontSize: 13 }} />
            </div>
          </div>
        )}

        {!selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ textAlign: 'center', padding: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💡</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>Хайлтын зөвлөмж</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                {isEn ? (
                  <>
                    <p>EN — Англи үг</p>
                    <p>Мн — Монгол утга</p>
                    <p style={{ marginTop: 8, color: 'var(--purple)', fontWeight: 600 }}>Аль ч талаас нь бичиж хайж болно</p>
                  </>
                ) : (
                  <>
                    <p>汉 — Хятад тэмдэгт</p>
                    <p>Pīn — pinyin</p>
                    <p>Мн — Монгол утга</p>
                    <p style={{ marginTop: 8, color: 'var(--purple)', fontWeight: 600 }}>Авто горим дээр өөрөө таних</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
