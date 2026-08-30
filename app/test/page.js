'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useLang } from '@/lib/LangContext';
import api from '@/lib/api';
import PageHeader from '@/components/PageHeader';

// 36 холимог сэдэвт (Past Simple↔Present Perfect, Articles, Prepositions,
// Quantifiers, Stative verbs гэх мэт) дүрмийн шалгалтын асуулт — асуулт болон
// сонголтуудын дараалал удаа бүр санамсаргүйгээр холилдоно.
const QUESTIONS = [
  { q: "After thinking it over for days, she finally ___ the decision yesterday.",
    options: ["maked", "has made", "make", "made"], correct: "made",
    explain: '"yesterday" тодорхой өнгөрсөн цаг заасан тул Past Simple ("made") хэрэглэнэ — тодорхой цаг заасан үед Present Perfect ("has made") хэрэглэгддэггүй.' },
  { q: "The accident ___ near the school last week.",
    options: ["occured", "occurring", "has occurred", "occurred"], correct: "occurred",
    explain: '"occur" -ийн Past Simple хэлбэрт сүүлийн гийгүүлэгчийг давхарлана: "occurred" (нэг "r"-тэй "occured" алдаатай хэлбэр).' },
  { q: "Did she ___ the letter before she left?",
    options: ["wrote", "written", "write", "writes"], correct: "write",
    explain: '"did" орсон асуултад үйл үг үндсэн хэлбэрээрээ ордог: "did she write", "did she wrote" биш.' },
  { q: "I looked everywhere, but I couldn't find ___.",
    options: ["nothing", "something", "everything", "anything"], correct: "anything",
    explain: '"couldn\'t" (үгүйсгэсэн) өгүүлбэрт "any-" бүлгийн үг хэрэглэнэ; "nothing" өөрөө сөрөг санаатай тул давхар үгүйсгэл болно.' },
  { q: "Is there ___ in the fridge?",
    options: ["cold anything", "something cold", "cold something", "anything cold"], correct: "anything cold",
    explain: 'Асуултын өгүүлбэрт "any-" хэрэглэнэ; мөн тэмдэг нэрийг ("cold") indefinite pronoun-ийн ард залгана.' },
  { q: "[Утсаар ярьж байна] Hello, ___ is Michael. Is ___ Sarah?",
    options: ["That / this", "This / this", "That / that", "This / that"], correct: "This / that",
    explain: 'Утсаар ярихдаа өөрийгөө танилцуулахдаа "this" ("This is Michael"), нөгөө хүнийг асуухдаа "that" ("Is that Sarah?") хэрэглэдэг.' },
  { q: "___ any information about the new policy yet?",
    options: ["Are there", "Have there", "Do there", "Is there"], correct: "Is there",
    explain: '"information" тоологдоггүй, ганц биетэй үг тул "Is there" хэрэглэнэ, "Are there" биш.' },
  { q: "I don't have ___ news to share today.",
    options: ["many", "a few", "several", "much"], correct: "much",
    explain: '"news" төгсгөлдөө "-s"-тэй боловч тоологдоггүй ганц тооны үг (мэдээ) тул "much" хэрэглэнэ.' },
  { q: "There's ___ traffic today — I might be late.",
    options: ["too many", "too a lot of", "too lot of", "too much"], correct: "too much",
    explain: '"traffic" тоологдоггүй үг тул "much"; мөн "too a lot of" гэсэн хэлбэр өгүүлбэрт байдаггүй.' },
  { q: "She's in her room ___ about her future — she's been there for hours.",
    options: ["thinks", "think", "thought", "thinking"], correct: "thinking",
    explain: 'Энд "think" тодорхой, идэвхтэй, удаан хугацаанд тунгаан бодож буй үйл ажиллагааг заана — санал бодол (stative) утгаараа биш тул Continuous авна.' },
  { q: "We can't go out — we ___ a meeting right now.",
    options: ["have", "has", "having", "are having"], correct: "are having",
    explain: 'Энд "have" нь "хийж байгаа" (meeting-д оролцож байгаа action) утгатай тул Continuous авна.' },
  { q: "___ you ever been to Italy?",
    options: ["Did", "Were", "Do", "Have"], correct: "Have",
    explain: 'Тодорхойгүй цаг, амьдралын туршлага асуухад Present Perfect ("Have...been") хэрэглэнэ.' },
  { q: "Yes, I ___ there last summer.",
    options: ["have been", "have gone", "was going", "went"], correct: "went",
    explain: '"last summer" тодорхой өнгөрсөн цаг заасан тул хариулахдаа Present Perfect биш Past Simple ("went") хэрэглэнэ.' },
  { q: "Where's Tom? He ___ to the store — he should be back soon.",
    options: ["has been", "went", "is going", "has gone"], correct: "has gone",
    explain: '"has gone" гэдэг нь тухайн хүн одоо тэнд байгаа/буцаж ирээгүй байгааг илэрхийлнэ ("has been" бол очоод буцаж ирсэн гэсэн санаа).' },
  { q: "I haven't eaten ___ this morning.",
    options: ["for", "from", "during", "since"], correct: "since",
    explain: '"this morning" тодорхой эхлэлийн цэг заасан тул "since" хэрэглэнэ; "for" үргэлжилсэн хугацааны уртын хамт ордог.' },
  { q: "Have you finished the report ___?",
    options: ["already", "just", "ever", "yet"], correct: "yet",
    explain: 'Асуултад "хараахан/одоохондоо" гэсэн санааг илэрхийлэхэд "yet" хэрэглэнэ; "already" ихэвчлэн батлах өгүүлбэрт ордог.' },
  { q: "She ___ eaten octopus, but she wants to try it someday.",
    options: ["hasn't never", "doesn't never", "has ever", "has never"], correct: "has never",
    explain: '"never" өөрөө сөрөг санаа агуулдаг тул "hasn\'t never" давхар үгүйсгэл болно; "has ever" батлах өгүүлбэрт ашиглагддаггүй.' },
  { q: "I ___ arrived — give me a minute to catch my breath.",
    options: ["just have", "am just", "just am", "have just"], correct: "have just",
    explain: '"just" Present Perfect-д have/has-ийн яг ард ордог: "have just arrived".' },
  { q: "Careful, that glass is right on the edge — it ___ fall!",
    options: ["will", "would", "is", "is going to"], correct: "is going to",
    explain: 'Одоо харагдаж буй нотолгоо (шилний байрлал) дээр үндэслэсэн ойрын ирээдүйн таамаглалд "going to" хэрэглэнэ.' },
  { q: "A: We're out of milk. B: Don't worry, I ___ get some from the shop.",
    options: ["am going to", "am", "do", "will"], correct: "will",
    explain: 'Тухайн мөчид гарсан шийдвэр (спонтан) тул "will" хэрэглэнэ; "am going to" урьдчилан төлөвлөсөн шийдвэрт хэрэглэгддэг.' },
  { q: "I'll call you when I ___ home.",
    options: ["will get", "am getting", "got", "get"], correct: "get",
    explain: 'Цагийн зүйл өгүүлбэр (when/if)-д ирээдүйг заахдаа Present Simple хэрэглэдэг, "will" биш.' },
  { q: "She's ___ honest person, but he's ___ liar.",
    options: ["a / an", "an / an", "a / a", "an / a"], correct: "an / a",
    explain: '"honest"-ийн эхний "h" дуудагддаггүй тул "an"; "liar" гийгүүлэгч авиагаар эхэлдэг тул "a".' },
  { q: "___ Lions are dangerous animals, but ___ lion at the zoo seemed calm.",
    options: ["The / the", "— / a", "The / a", "— / the"], correct: "— / the",
    explain: 'Ерөнхий утгаар бүх зүйл ангийг нэрлэхэд article авахгүй ("Lions..."); харин тодорхой, аль хэдийн мэдэгдэж буй ганц амьтанд ("the lion at the zoo") "the" хэрэглэнэ.' },
  { q: "This is ___ best restaurant in the city, and it's also ___ oldest one.",
    options: ["a / an", "a / the", "the / a", "the / the"], correct: "the / the",
    explain: 'Хамгийн дээд зэрэглэлийн (superlative) "best", "oldest" зэрэг үгсийн өмнө үргэлж "the" хэрэглэнэ.' },
  { q: "The meeting is ___ 9 am ___ Friday ___ March.",
    options: ["in / at / on", "on / in / at", "at / in / on", "at / on / in"], correct: "at / on / in",
    explain: 'Тодорхой цаг мөч → "at", өдөр → "on", сар → "in" — жижигээс томруу дараалалтай.' },
  { q: "We were sitting ___ the train when it suddenly stopped, and I dropped my phone ___ the floor.",
    options: ["in / on", "on / in", "in / in", "on / on"], correct: "on / on",
    explain: 'Олон нийтийн том тээврийн хэрэгсэл (train)-д "on" хэрэглэнэ; мөн гадаргуу дээр байрлахад ч "on" хэрэглэнэ ("on the floor").' },
  { q: "Please ___ me — this is important!",
    options: ["listen", "hear", "hear to", "listen to"], correct: "listen to",
    explain: '"listen" үргэлж "to"-той хамт ордог тогтмол хэлц: "listen to me" ("hear" бол угаасаа өөр үг авдаггүй).' },
  { q: "She's been ___ her husband ___ ten years.",
    options: ["married with / since", "married to / since", "married with / for", "married to / for"], correct: "married to / for",
    explain: '"married" үргэлж "to"-той хамт ордог; "ten years" үргэлжилсэн хугацааны урт тул "for" хэрэглэнэ.' },
  { q: "He ___ late for meetings — he's always exactly on time.",
    options: ["never is", "isn't never", "never doesn't", "is never"], correct: "is never",
    explain: '"to be" үйл үгтэй бол давтамжийн дайвар үг ("never") ЯГ ард нь ордог: "is never".' },
  { q: "___ are going to the concert tonight. (referring to the speaker and Anna)",
    options: ["Anna and me", "Me and Anna", "I and Anna", "Anna and I"], correct: "Anna and I",
    explain: 'Хоёр субьект нийлж өгүүлбэрийн эзэн (subject) болж байгаа тул "I" хэрэглэнэ ("me" объектын хэлбэр); мөн эелдэг байдлаар өөрийгөө сүүлд нэрлэдэг.' },
  { q: "What's ___ name? (a dog's)",
    options: ["the dog", "of the dog", "dog's", "the dog's"], correct: "the dog's",
    explain: 'Амьд биетэй зүйлд эзэмшлийн апостроф ("\'s") хэрэглэнэ: "the dog\'s name".' },
  { q: "Tom and Lisa have known ___ since childhood.",
    options: ["themselves", "theirselves", "them", "each other"], correct: "each other",
    explain: 'Хоёр хүн харилцан бие биедээ хандаж буй тул "each other" хэрэглэнэ ("themselves" бол өөрсдөдөө хандахыг заана).' },
  { q: "The weather today is much ___ than yesterday.",
    options: ["more bad", "worst", "badder", "worse"], correct: "worse",
    explain: '"bad" тогтмол бус харьцуулах зэрэгтэй үг: "worse" (Superlative нь "worst").' },
  { q: "___ you got any brothers or sisters?",
    options: ["Do", "Are", "Did", "Have"], correct: "Have",
    explain: '"have got" бүтцийн асуултад "do" биш "have/has"-аа урагшлуулна: "Have you got...?"' },
  { q: "I ___ what you mean, but I ___ to a podcast right now, so can we talk later?",
    options: ["am understanding / listen", "understand / listen", "am understanding / am listening", "understand / am listening"], correct: "understand / am listening",
    explain: '"understand" stative тул Simple хэлбэртэй; "listen" энд идэвхтэй, яг одоо болж буй үйлдэл тул Continuous хэлбэртэй.' },
  { q: "My sister rarely ___ breakfast before work.",
    options: ["eat", "is eating", "ate", "eats"], correct: "eats",
    explain: '"sister" 3rd person singular тул үйл үгэнд "-s" нэмнэ: "eats".' },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function gradeFor(pct) {
  if (pct >= 90) return { label: 'Гайхалтай!', emoji: '🏆', color: '#22C55E' };
  if (pct >= 75) return { label: 'Маш сайн', emoji: '⭐', color: '#3B82F6' };
  if (pct >= 60) return { label: 'Сайн', emoji: '👍', color: '#F59E0B' };
  if (pct >= 40) return { label: 'Дунд зэрэг', emoji: '📚', color: '#FB923C' };
  return { label: 'Дахин давт', emoji: '💪', color: '#EF4444' };
}

function statusColor(status, current) {
  if (current) return { bg: 'var(--purple)', color: '#fff', border: 'var(--purple)' };
  if (status === 'correct') return { bg: 'var(--green-bg)', color: 'var(--green-dark)', border: 'var(--green)' };
  if (status === 'wrong') return { bg: 'var(--red-light)', color: 'var(--red)', border: 'var(--red)' };
  return { bg: '#fff', color: 'var(--muted)', border: 'var(--border)' };
}

export default function GrammarTestPage() {
  const { user, loading: authLoad } = useAuth();
  const { setLang } = useLang();
  const router = useRouter();
  const [streak, setStreak] = useState(0);

  const [phase, setPhase] = useState('intro'); // intro | running | done
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState([]); // 'correct' | 'wrong' per question, indexed
  const [missed, setMissed] = useState([]);
  const [examXp, setExamXp] = useState(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (!authLoad && !user) router.push('/login');
    if (!authLoad && user) api.get('/api/streak').then(r => setStreak(r.data.streak || 0)).catch(() => {});
  }, [authLoad, user]);

  useEffect(() => { setLang('en'); }, []);

  useEffect(() => {
    if (phase !== 'running') return;
    function onKey(e) {
      if (!answered) {
        const map = { '1': 0, '2': 1, '3': 2, '4': 3 };
        if (map[e.key] !== undefined && order[idx]?.shuffledOptions[map[e.key]] !== undefined) {
          pick(order[idx].shuffledOptions[map[e.key]]);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        next();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (authLoad) return null;

  function start() {
    const shuffled = shuffle(QUESTIONS).map(item => ({ ...item, shuffledOptions: shuffle(item.options) }));
    setOrder(shuffled);
    setIdx(0); setPicked(null); setAnswered(false); setScore(0);
    setStatus(new Array(shuffled.length).fill(null));
    setMissed([]);
    setExamXp(null);
    startRef.current = Date.now();
    setPhase('running');
  }

  function pick(optText) {
    if (answered) return;
    setAnswered(true);
    setPicked(optText);
    const item = order[idx];
    const isCorrect = optText === item.correct;
    setStatus(s => { const n = [...s]; n[idx] = isCorrect ? 'correct' : 'wrong'; return n; });
    if (isCorrect) {
      setScore(sc => sc + 1);
    } else {
      setMissed(m => [...m, { q: item.q, picked: optText, correct: item.correct, explain: item.explain }]);
    }
  }

  function next() {
    if (!answered) return;
    if (idx + 1 >= order.length) { finish(); return; }
    setIdx(i => i + 1); setPicked(null); setAnswered(false);
  }

  function finish() {
    setPhase('done');
    const total = order.length || 1;
    api.post('/api/streak/checkin').catch(() => {});
    api.post('/api/stats/exam', { correct: score, total }).then(({ data }) => setExamXp(data)).catch(() => {});
  }

  // ── Intro ─────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{ paddingBottom: 40 }}>
        <PageHeader title="Дүрмийн эцсийн шалгалт 🏆" subtitle="Холимог сэдвүүдээр өөрийгөө бататга" streak={streak} />
        <div style={{ padding: '0 28px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            borderRadius: 20, padding: '32px 26px', textAlign: 'center', color: '#fff',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', boxShadow: '0 10px 30px rgba(124,58,237,0.3)',
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: 34, background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 14px',
            }}>🏆</div>
            <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>{QUESTIONS.length} холимог асуулт</h2>
            <p style={{ fontSize: 13.5, opacity: 0.9, lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>
              Past Simple↔Present Perfect, Articles, Prepositions, Quantifiers, Stative verbs зэрэг олон сэдвийг холиод шалгана. Асуулт болон сонголтын дараалал удаа бүр санамсаргүйгээр өөрчлөгддөг.
            </p>
          </div>

          <div className="card" style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5, margin: 0 }}>
              Хариулт бүрийг сонгомогц шууд зөв/буруу нь харагдаж, тайлбар гарч ирнэ. Шалгалт дуусахад алдсан асуулт бүрийг тайлбарын хамт дахин харах боломжтой.
            </p>
          </div>

          <button onClick={start} className="btn btn-purple" style={{ width: '100%', padding: 16, marginTop: 20, fontSize: 15 }}>
            ▶ Тест эхлүүлэх
          </button>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <Link href="/grammar-lessons" style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700, textDecoration: 'none' }}>← Дүрмийн хичээл рүү буцах</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────
  if (phase === 'done') {
    const total = order.length || 1;
    const pct = Math.round((score / total) * 100);
    const grade = gradeFor(pct);

    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>Шалгалт дууслаа! 🎉</h1>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 100, border: `1.5px solid ${grade.color}55`,
          background: grade.color + '18', padding: '10px 18px', marginTop: 14,
        }}>
          <span style={{ fontSize: 20 }}>{grade.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: grade.color }}>{grade.label}</span>
        </div>
        {!!examXp?.xp && (
          <div style={{ marginTop: 10 }}>
            <span style={{ background: 'var(--purple-light)', color: 'var(--purple-dark)', borderRadius: 100, padding: '9px 16px', fontWeight: 800, fontSize: 13.5, display: 'inline-block' }}>
              🎉 +{examXp.xp} XP нэмэгдлээ!
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', margin: '26px 0' }}>
          <svg width={190} height={190}>
            <circle cx={95} cy={95} r={78} stroke="var(--border)" strokeWidth={14} fill="none" />
            <circle cx={95} cy={95} r={78} stroke="var(--purple)" strokeWidth={14} fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 78} strokeDashoffset={2 * Math.PI * 78 * (1 - pct / 100)}
              transform="rotate(-90 95 95)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            <text x={95} y={92} textAnchor="middle" fontSize={40} fontWeight={900} fill="var(--text)">{pct}%</text>
            <text x={95} y={116} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--muted)">{score} / {total} зөв</text>
          </svg>
        </div>

        {missed.length > 0 ? (
          <div className="card" style={{ textAlign: 'left', marginBottom: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)', marginBottom: 10 }}>Алдсан асуултууд ({missed.length})</div>
            {missed.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, borderTop: i > 0 ? '1px solid var(--border)' : 'none', padding: '14px 0' }}>
                <div style={{ width: 4, borderRadius: 4, background: 'var(--red)', flexShrink: 0, alignSelf: 'stretch' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.5 }}>{m.q}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--red)', background: 'var(--red-light)', borderRadius: 8, padding: '5px 10px' }}>✕ {m.picked}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--green-dark)', background: 'var(--green-bg)', borderRadius: 8, padding: '5px 10px' }}>✓ {m.correct}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>💡 {m.explain}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', margin: 0 }}>Алдсан асуулт алга — бүгдийг зөв хариуллаа. 🎉</p>
          </div>
        )}

        <button className="btn btn-purple" onClick={start} style={{ width: '100%', padding: 15 }}>🔁 Дахин өгөх</button>
        <Link href="/grammar-lessons" style={{ display: 'block', marginTop: 12 }}>
          <button className="btn btn-ghost" style={{ width: '100%', padding: 13 }}>← Дүрмийн хичээл рүү буцах</button>
        </Link>
      </div>
    );
  }

  // ── Running ───────────────────────────────────────────────────
  const cur = order[idx];
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 24px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Link href="/grammar-lessons" style={{ fontSize: 22, color: 'var(--text)', textDecoration: 'none' }}>✕</Link>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>🏆 Эцсийн шалгалт</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{idx + 1} / {order.length}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple)', minWidth: 22, textAlign: 'right' }}>{score}⭐</div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5, marginBottom: 20 }}>{cur.q}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cur.shuffledOptions.map((opt, i) => {
            const isPicked = picked === opt;
            const isAnswer = opt === cur.correct;
            let bg = '#fff', border = 'var(--border)', bubbleBg = '#fff', bubbleColor = 'var(--text-sub)', bubbleBorder = 'var(--border)';
            if (answered && isAnswer) { bg = 'var(--green-bg)'; border = 'var(--green)'; bubbleBg = 'var(--green)'; bubbleBorder = 'var(--green)'; bubbleColor = '#fff'; }
            else if (answered && isPicked && !isAnswer) { bg = 'var(--red-light)'; border = 'var(--red)'; bubbleBg = 'var(--red)'; bubbleBorder = 'var(--red)'; bubbleColor = '#fff'; }
            return (
              <button key={i} disabled={answered} onClick={() => pick(opt)} style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: '12px 16px',
                cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 15, color: 'var(--text)',
                opacity: answered && !isAnswer && !isPicked ? 0.55 : 1, transition: 'all 0.15s',
              }}>
                <span style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${bubbleBorder}`,
                  background: bubbleBg, color: bubbleColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}>{letters[i]}</span>
                <span style={{ flex: 1, fontWeight: (answered && isAnswer) || isPicked ? 800 : 500 }}>{opt}</span>
                {answered && isAnswer && <span style={{ fontSize: 17 }}>✅</span>}
                {answered && isPicked && !isAnswer && <span style={{ fontSize: 17 }}>❌</span>}
              </button>
            );
          })}
        </div>

        {answered && (
          <div style={{ marginTop: 18, padding: '13px 15px', borderLeft: '3px solid var(--purple)', background: 'var(--purple-soft)', borderRadius: 10 }}>
            <p style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}><b style={{ color: 'var(--text)' }}>Тайлбар:</b> {cur.explain}</p>
          </div>
        )}

        {!answered ? (
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 14, marginBottom: 0 }}>Гарын товчоор ч сонгож болно: <b>1</b> <b>2</b> <b>3</b> <b>4</b></p>
        ) : (
          <button onClick={next} className="btn btn-purple" style={{ width: '100%', padding: 14, marginTop: 18 }}>
            {idx + 1 >= order.length ? 'Дүн харах →' : 'Дараах асуулт →'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {order.map((_, i) => {
          const c = statusColor(status[i], i === idx);
          return (
            <div key={i} style={{
              width: 26, height: 26, borderRadius: 8, border: `1.5px solid ${c.border}`, background: c.bg, color: c.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11,
            }}>{i + 1}</div>
          );
        })}
      </div>
    </div>
  );
}
