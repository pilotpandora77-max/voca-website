// Хятад HSK дүрмийг grammar-lessons-ийн бүтцэд хувиргана
import GRAMMAR, { GRAMMAR_TEST } from '@/lib/grammarData';

export const CEFR_ZH = [
  { level: 'HSK 1', name: 'Эхлэгч', color: '#22C55E' },
  { level: 'HSK 2', name: 'Суурь', color: '#38BDF8' },
  { level: 'HSK 3', name: 'Дунд', color: '#A855F7' },
];

function icon(title) {
  const m = (title || '').match(/[一-鿿]+/);
  return m ? m[0].slice(0, 2) : '字';
}

function convert(ls, levelLabel) {
  return {
    id: ls.id,
    level: levelLabel,
    title: ls.title,
    icon: icon(ls.title),
    time: '12 мин',
    desc: ls.pattern,
    definition: ls.explanation,
    useCases: [ls.pattern, 'Хятад хэлний өдөр тутмын хэрэглээ'],
    structure: [{ form: ls.pattern, pos: ls.examples?.[0]?.zh || '', neg: '—', q: '—' }],
    note: '',
    examples: {
      Жишээ: (ls.examples || []).map(e => ({ en: `${e.zh}　(${e.py})`, mn: e.mn })),
    },
    mistakes: [],
    practice: ls.quiz ? [{ type: 'choice', q: ls.quiz.question, options: ls.quiz.options, answer: ls.quiz.answer }] : [],
    quiz: ls.quiz ? [{ q: ls.quiz.question, options: ls.quiz.options, answer: ls.quiz.answer }] : [],
    related: [],
  };
}

export const LESSONS_ZH = [
  ...(GRAMMAR[1] || []).map(l => convert(l, 'HSK 1')),
  ...(GRAMMAR[2] || []).map(l => convert(l, 'HSK 2')),
  ...(GRAMMAR[3] || []).map(l => convert(l, 'HSK 3')),
];

// Түвшний эцэст өгүүлбэр нөхөх шалгалтыг хичээл болгон нэмнэ
[1, 2, 3].forEach(lv => {
  const test = GRAMMAR_TEST[lv];
  if (test?.length) {
    LESSONS_ZH.push({
      id: `hsk${lv}-test`, level: `HSK ${lv}`, title: `HSK ${lv} — Өгүүлбэр нөхөх шалгалт`,
      icon: '✍️', time: '10 мин', desc: 'Дутуу үгийг нөхөх',
      definition: 'Энэ түвшинд үзсэн дүрмүүдээ өгүүлбэр нөхөх замаар бататгана.',
      useCases: ['Дутуу үгийг нөхөх', 'Дүрмийг практикт хэрэглэх'],
      structure: [], note: '', examples: { Жишээ: test.slice(0, 3).map(t => ({ en: t.sentence.replace('___', `【${t.options[t.answer]}】`), mn: t.mn })) },
      mistakes: [],
      practice: test.map(t => ({ type: 'fill', q: t.sentence + (t.mn ? `  (${t.mn})` : ''), options: t.options, answer: t.answer })),
      quiz: test.map(t => ({ q: t.sentence, options: t.options, answer: t.answer })),
      related: [],
    });
  }
});
