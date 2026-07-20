'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import api from '@/lib/api';
import { shuffle, FlashQ, ChoiceQ, TypeQ } from '@/components/exercises/WordQuestions';
import FillBlankGame from '@/components/exercises/FillBlankGame';
import PronounceGame from '@/components/exercises/PronounceGame';
import { Result } from '@/components/exercises/ExerciseUI';

const TYPE_META = {
  flashcard: { title: 'Флаш карт', icon: '🗂️' },
  choice:    { title: 'Сонголттой тест', icon: '📝' },
  fill:      { title: 'Дутуу үг нөхөх', icon: '🔤' },
  pronounce: { title: 'Дуудлага дасгал', icon: '🎤' },
  listen:    { title: 'Сонсох дасгал', icon: '🎧' },
  writing:   { title: 'Бичих дасгал', icon: '⌨️' },
};
const SESSION_SIZE = 15;

function norm(w) {
  return { ...w, front: w.word, back: w.meaning, hint: w.reading };
}

export default function LessonPracticePage() {
  const { user, loading: authLoad } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const { type } = useParams();
  const meta = TYPE_META[type];

  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pool, setPool]         = useState([]);
  const [idx, setIdx]           = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked]     = useState(null);
  const [typed, setTyped]       = useState('');
  const [known, setKnown]       = useState(0);
  const [wrong, setWrong]       = useState(0);
  const [done, setDone]         = useState(false);
  const [examXp, setExamXp]     = useState(null);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) {
      // vocab/exam-ийн адилаар хэрэглэгчийн БҮХ хэл дээрх үгсийг ашиглана —
      // одоо сонгосон курсын хэлээр шүүвэл олон хэлээр үг нэмсэн хэрэглэгч
      // дасгал хийх боломжгүй болно (жишээ нь: zh курс сонгоотой атлаа зөвхөн
      // en үг нэмсэн бол хоосон харагдана).
      api.get('/api/words').then(({ data }) => {
        const words = Array.isArray(data) ? data : [];
        setAllWords(words);
        setPool(shuffle(words).slice(0, SESSION_SIZE));
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [authLoad, user, lang]);

  useEffect(() => {
    if (!done) return;
    api.post('/api/streak/checkin').catch(() => {});
    api.post('/api/stats/exam', { correct: known, total: known + wrong }).then(({ data }) => setExamXp(data)).catch(() => {});
  }, [done]);

  function retry() {
    setPool(shuffle(allWords).slice(0, SESSION_SIZE));
    setIdx(0); setKnown(0); setWrong(0); setDone(false); setExamXp(null);
    setRevealed(false); setPicked(null); setTyped('');
  }

  function answer(correct) {
    if (correct) setKnown(k => k + 1); else setWrong(w => w + 1);
    const nx = idx + 1;
    if (nx >= pool.length) setDone(true);
    else { setIdx(nx); setRevealed(false); setPicked(null); setTyped(''); }
  }

  if (authLoad || loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner" /></div>;
  if (!meta) return <div style={{ padding: 40, textAlign: 'center' }}><h2>Дасгал олдсонгүй</h2></div>;

  if (allWords.length < 5) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>📝</div>
        <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Эхлээд үг нэмээрэй</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>Дасгал хийхийн тулд хамгийн багадаа 5 үг "Үгс" хуудсанд нэмсэн байх шаардлагатай.</p>
        <Link href="/vocab" className="btn btn-purple" style={{ textDecoration: 'none' }}>Үгс хуудас руу →</Link>
      </div>
    );
  }

  if (done) {
    const total = known + wrong || pool.length;
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 24px 48px' }}>
        <Result score={known} total={total} onExit={() => router.push('/lessons')} onRetry={retry} exitLabel="← Буцах" />
        {!!examXp?.xp && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <span style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)', borderRadius: 100, padding: '9px 16px', fontWeight: 800, fontSize: 13.5, display: 'inline-block' }}>
              🎉 +{examXp.xp} XP нэмэгдлээ!
            </span>
          </div>
        )}
      </div>
    );
  }

  // fill/pronounce — бүрэн бие даасан, дотроо асуулт/оноогоо удирддаг тул шууд render
  if (type === 'fill' || type === 'pronounce') {
    const normPool = pool.map(norm).filter(w => w.front && w.back);
    const speechLang = lang === 'en' ? 'en-US' : 'zh-CN';
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 24px 40px' }}>
        <Header meta={meta} onExit={() => router.push('/lessons')} />
        {type === 'fill'
          ? <FillBlankGame words={normPool} onExit={() => router.push('/lessons')} exitLabel="← Буцах" />
          : <PronounceGame words={normPool} onExit={() => router.push('/lessons')} speechLang={speechLang} exitLabel="← Буцах" />}
      </div>
    );
  }

  // flashcard/choice/listen/writing — нэг асуулт тутамд эргэлддэг энгийн session
  const cur = pool[idx];
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 24px 40px' }}>
      <Header meta={meta} onExit={() => router.push('/lessons')} idx={idx} total={pool.length} />
      {type === 'flashcard' && <FlashQ word={cur} revealed={revealed} onReveal={() => setRevealed(true)} onAnswer={answer} />}
      {type === 'choice'    && <ChoiceQ word={cur} all={allWords} field="meaning" prompt="Энэ үгийн утга юу вэ?" picked={picked} setPicked={setPicked} onNext={answer} />}
      {type === 'listen'    && <ChoiceQ word={cur} all={allWords} field="word" prompt="Дуу сонсоод зөв хариултыг сонгоно уу." listen picked={picked} setPicked={setPicked} onNext={answer} />}
      {type === 'writing'   && <TypeQ word={cur} typed={typed} setTyped={setTyped} revealed={revealed} onCheck={() => setRevealed(true)} onNext={answer} />}
    </div>
  );
}

function Header({ meta, onExit, idx, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <button onClick={onExit} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text)', fontFamily: 'inherit' }}>✕</button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>{meta.icon} {meta.title}</div>
        {total != null && <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{idx + 1} / {total}</div>}
      </div>
      <div style={{ width: 22 }} />
    </div>
  );
}
