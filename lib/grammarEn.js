// VOCA English Grammar (CEFR) curriculum

export const CEFR = [
  { level: 'A1', name: 'Эхлэгч', color: '#22C55E' },
  { level: 'A2', name: 'Суурь', color: '#38BDF8' },
  { level: 'B1', name: 'Дунд', color: '#A855F7' },
  { level: 'B2', name: 'Ахисан', color: '#F59E0B' },
];

function ex(arr) { return arr.map(([en, mn]) => ({ en, mn })); }

const LESSONS = [
  // ── A1 ──
  {
    id: 'present-simple', level: 'A1', title: 'Present Simple Tense', icon: 'Aa', time: '15–20 мин',
    desc: 'Одоогийн ердийн давтагддаг үйлдлийг илэрхийлдэг.',
    definition: 'Present Simple Tense нь одоо цагт байнга давтагддаг, ердийн үйлдлийг илэрхийлдэг.',
    useCases: [
      'Ердийн давтагддаг үйлдэл (every day, always, usually гэх мэт)',
      'Үнэн факт, ерөнхий үнэн',
      'Тогтмол хуваарь, хөтөлбөр',
      'Спортын тайлбар, өгүүлбэрийн ерөнхий үйлдэл',
    ],
    structure: [
      { form: 'I / You / We / They', pos: 'play football.', neg: "do not (don't) play football.", q: 'Do I / you / we / they play football?' },
      { form: 'He / She / It', pos: 'plays football.', neg: "does not (doesn't) play football.", q: 'Does he / she / it play football?' },
    ],
    note: 'He, She, It буюу 3-р ганц бие дээр үйл үг -s эсвэл -es дагавар авна.',
    examples: {
      Батлах: ex([['I play football every day.', 'Би өдөр бүр хөлбөмбөг тоглодог.'], ['She studies English.', 'Тэр англи хэл сурдаг.'], ['They live in London.', 'Тэд Лондонд амьдардаг.']]),
      Сөрөг: ex([["I don't play football.", 'Би хөлбөмбөг тоглодоггүй.'], ["She doesn't eat meat.", 'Тэр мах иддэггүй.']]),
      Асуух: ex([['Do you play football?', 'Чи хөлбөмбөг тоглодог уу?'], ['Does he study English?', 'Тэр англи хэл сурдаг уу?']]),
    },
    mistakes: [['He go to school.', 'He goes to school.', '3-р ганц бие дээр -es дагавар орно.'], ["She don't like it.", "She doesn't like it.", '3-р ганц бие дээр does ашиглана.']],
    practice: [
      { type: 'fill', q: 'He ___ to school every day.', options: ['go', 'goes', 'going'], answer: 1 },
      { type: 'fill', q: 'They ___ English.', options: ['studies', 'study', 'studys'], answer: 1 },
      { type: 'choice', q: '"Тэр кофе уудаг" гэдгийг сонго:', options: ['She drink coffee.', 'She drinks coffee.', 'She drinking coffee.'], answer: 1 },
    ],
    quiz: [
      { q: 'I ___ basketball on Sundays.', options: ['plays', 'play', 'playing'], answer: 1 },
      { q: 'She ___ in a bank.', options: ['work', 'works', 'working'], answer: 1 },
      { q: 'Negative: "He ___ like tea."', options: ["don't", "doesn't", 'not'], answer: 1 },
      { q: 'Question: "___ they live here?"', options: ['Do', 'Does', 'Is'], answer: 0 },
      { q: '"Ус 100°C-д буцалдаг" — ___', options: ['Water boil at 100°C.', 'Water boils at 100°C.', 'Water is boil at 100°C.'], answer: 1 },
    ],
    related: ['verb-to-be', 'question-forms', 'past-simple'],
  },
  {
    id: 'verb-to-be', level: 'A1', title: 'Verb To Be (am/is/are)', icon: 'Be', time: '10–15 мин',
    desc: '"байх" туслах үйл үг — am, is, are.',
    definition: 'To be (am/is/are) нь "байх" гэсэн утгатай, төлөв байдал, таних мэдээллийг илэрхийлнэ.',
    useCases: ['Хэн/юу болохыг хэлэх', 'Төлөв байдал, шинж чанар', 'Байршил'],
    structure: [
      { form: 'I', pos: 'am a student.', neg: "am not a student.", q: 'Am I a student?' },
      { form: 'He / She / It', pos: 'is happy.', neg: "is not (isn't) happy.", q: 'Is he / she / it happy?' },
      { form: 'You / We / They', pos: 'are friends.', neg: "are not (aren't) friends.", q: 'Are you / we / they friends?' },
    ],
    note: 'I → am, He/She/It → is, You/We/They → are.',
    examples: {
      Батлах: ex([['I am a teacher.', 'Би багш.'], ['She is tall.', 'Тэр өндөр.'], ['We are happy.', 'Бид баяртай байна.']]),
      Сөрөг: ex([["He isn't here.", 'Тэр энд байхгүй.'], ["They aren't ready.", 'Тэд бэлэн биш.']]),
      Асуух: ex([['Are you a student?', 'Чи оюутан уу?'], ['Is she your sister?', 'Тэр чиний эгч үү?']]),
    },
    mistakes: [['I is happy.', 'I am happy.', 'I дээр am ашиглана.'], ['They is here.', 'They are here.', 'They дээр are ашиглана.']],
    practice: [
      { type: 'fill', q: 'She ___ a doctor.', options: ['am', 'is', 'are'], answer: 1 },
      { type: 'fill', q: 'We ___ from Mongolia.', options: ['is', 'am', 'are'], answer: 2 },
    ],
    quiz: [
      { q: 'I ___ a student.', options: ['am', 'is', 'are'], answer: 0 },
      { q: 'He ___ my friend.', options: ['am', 'is', 'are'], answer: 1 },
      { q: 'They ___ happy.', options: ['is', 'am', 'are'], answer: 2 },
    ],
    related: ['present-simple', 'articles'],
  },
  {
    id: 'articles', level: 'A1', title: 'Articles (a / an / the)', icon: 'Th', time: '10–15 мин',
    desc: 'Тодорхой ба тодорхой бус артикль.',
    definition: 'a/an нь тодорхой бус (нэг), the нь тодорхой зүйлийг заана.',
    useCases: ['a/an — анх дурдаж буй нэг зүйл', 'the — аль хэдийн мэдэгдсэн зүйл', 'эгшгээр эхэлбэл an'],
    structure: [
      { form: 'a + гийгүүлэгч', pos: 'a book, a car', neg: '—', q: '—' },
      { form: 'an + эгшиг', pos: 'an apple, an hour', neg: '—', q: '—' },
      { form: 'the + тодорхой', pos: 'the sun, the book', neg: '—', q: '—' },
    ],
    note: 'Эгшгийн авиагаар эхэлбэл "an" (an apple). "the" нь хоёр талд мэдэгдэж буй зүйлд.',
    examples: {
      Батлах: ex([['I have a dog.', 'Надад нэг нохой бий.'], ['She ate an apple.', 'Тэр алим идсэн.'], ['The sun is bright.', 'Нар тод гэрэлтэж байна.']]),
      Сөрөг: ex([["It isn't a cat.", 'Энэ муур биш.']]),
      Асуух: ex([['Is this an egg?', 'Энэ өндөг үү?']]),
    },
    mistakes: [['I have a apple.', 'I have an apple.', 'Эгшгээр эхэлвэл an.'], ['Sun is hot.', 'The sun is hot.', 'Цор ганц зүйлд the.']],
    practice: [
      { type: 'fill', q: 'I saw ___ elephant.', options: ['a', 'an', 'the'], answer: 1 },
      { type: 'fill', q: '___ moon is beautiful.', options: ['A', 'An', 'The'], answer: 2 },
    ],
    quiz: [
      { q: 'She has ___ umbrella.', options: ['a', 'an', 'the'], answer: 1 },
      { q: 'He is ___ teacher.', options: ['a', 'an', 'the'], answer: 0 },
    ],
    related: ['plural-nouns', 'present-simple'],
  },
  {
    id: 'plural-nouns', level: 'A1', title: 'Plural Nouns', icon: 'Pl', time: '10 мин',
    desc: 'Нэр үгийн олон тоо.',
    definition: 'Олон тоог ихэвчлэн -s, заримдаа -es эсвэл онцгой хэлбэрээр үүсгэнэ.',
    useCases: ['Энгийн: + s (cat → cats)', '-s,-x,-ch,-sh: + es (box → boxes)', 'Онцгой: man → men, child → children'],
    structure: [
      { form: 'Энгийн', pos: 'book → books', neg: '—', q: '—' },
      { form: '-s/-x/-ch/-sh', pos: 'bus → buses', neg: '—', q: '—' },
      { form: 'Онцгой', pos: 'child → children', neg: '—', q: '—' },
    ],
    note: 'Зарим үг онцгой: man→men, woman→women, foot→feet, tooth→teeth.',
    examples: { Батлах: ex([['I have two cats.', 'Надад хоёр муур бий.'], ['There are three boxes.', 'Гурван хайрцаг байна.'], ['The children play.', 'Хүүхдүүд тоглож байна.']]) },
    mistakes: [['two childs', 'two children', 'Онцгой олон тоо.'], ['three boxs', 'three boxes', '-x дээр -es.']],
    practice: [{ type: 'fill', q: 'one box, two ___', options: ['boxs', 'boxes', 'box'], answer: 1 }],
    quiz: [{ q: 'one child, two ___', options: ['childs', 'childrens', 'children'], answer: 2 }, { q: 'one bus, two ___', options: ['buss', 'buses', 'busi'], answer: 1 }],
    related: ['articles'],
  },
  {
    id: 'question-forms', level: 'A1', title: 'Question Forms', icon: '?', time: '12 мин',
    desc: 'Асуултын өгүүлбэр зохиох.',
    definition: 'Yes/No асуултад do/does/is/are урд орно. Wh-асуултад what, where, when зэрэг орно.',
    useCases: ['Yes/No: Do you...?', 'Wh-: What do you...?', 'To be: Are you...?'],
    structure: [
      { form: 'Yes/No', pos: '—', neg: '—', q: 'Do you like tea?' },
      { form: 'Wh-', pos: '—', neg: '—', q: 'Where do you live?' },
      { form: 'To be', pos: '—', neg: '—', q: 'Are you happy?' },
    ],
    note: 'Үндсэн үйл үг асуултад үндсэн хэлбэрээрээ үлдэнэ (Does he go? — go, goes биш).',
    examples: { Асуух: ex([['Do you speak English?', 'Чи англиар ярьдаг уу?'], ['Where does she work?', 'Тэр хаана ажилладаг вэ?'], ['What is your name?', 'Чиний нэр хэн бэ?']]) },
    mistakes: [['Does he goes?', 'Does he go?', 'does-ийн дараа үндсэн хэлбэр.'], ['Where you live?', 'Where do you live?', 'do шаардлагатай.']],
    practice: [{ type: 'choice', q: 'Зөв асуултыг сонго:', options: ['Do she like it?', 'Does she like it?', 'Does she likes it?'], answer: 1 }],
    quiz: [{ q: '___ you speak Mongolian?', options: ['Do', 'Does', 'Are'], answer: 0 }, { q: '___ she live here?', options: ['Do', 'Does', 'Is'], answer: 1 }],
    related: ['present-simple', 'verb-to-be'],
  },

  // ── A2 ──
  {
    id: 'past-simple', level: 'A2', title: 'Past Simple Tense', icon: 'Pa', time: '15 мин',
    desc: 'Өнгөрсөн цагт дууссан үйлдэл.',
    definition: 'Past Simple нь өнгөрсөн цагт болж дууссан үйлдлийг илэрхийлнэ. Ердийн үйл үг -ed авна.',
    useCases: ['Өнгөрсөн дууссан үйлдэл (yesterday, last week)', 'Дараалсан үйл явдал', 'Түүх өгүүлэх'],
    structure: [
      { form: 'Бүх бие', pos: 'played football.', neg: "did not (didn't) play football.", q: 'Did you play football?' },
    ],
    note: 'Ердийн үйл үг + ed (play→played). Олон үг онцгой: go→went, eat→ate, see→saw.',
    examples: {
      Батлах: ex([['I played football yesterday.', 'Би өчигдөр хөлбөмбөг тоглосон.'], ['She went home.', 'Тэр гэртээ харьсан.']]),
      Сөрөг: ex([["I didn't see him.", 'Би түүнийг хараагүй.']]),
      Асуух: ex([['Did you eat lunch?', 'Чи өдрийн хоол идсэн үү?']]),
    },
    mistakes: [['I goed home.', 'I went home.', 'go онцгой: went.'], ["She didn't went.", "She didn't go.", "didn't-ийн дараа үндсэн хэлбэр."]],
    practice: [{ type: 'fill', q: 'I ___ to school yesterday.', options: ['go', 'went', 'goed'], answer: 1 }],
    quiz: [{ q: 'She ___ a book last night.', options: ['read', 'readed', 'reads'], answer: 0 }, { q: "He ___ come to the party.", options: ["didn't", "doesn't", "don't"], answer: 0 }],
    related: ['present-simple', 'present-perfect'],
  },
  {
    id: 'comparative', level: 'A2', title: 'Comparative & Superlative', icon: '>', time: '12 мин',
    desc: 'Харьцуулах зэрэг (-er, the -est).',
    definition: 'Хоёр зүйлийг харьцуулахад -er/more, хамгийн дээдийг the -est/the most ашиглана.',
    useCases: ['Богино тэмдэг: + er (tall→taller)', 'Урт тэмдэг: more (more beautiful)', 'Хамгийн: the -est / the most'],
    structure: [
      { form: 'Comparative', pos: 'taller than', neg: '—', q: '—' },
      { form: 'Superlative', pos: 'the tallest', neg: '—', q: '—' },
    ],
    note: 'Онцгой: good→better→best, bad→worse→worst.',
    examples: { Батлах: ex([['He is taller than me.', 'Тэр надаас өндөр.'], ['This is the best book.', 'Энэ хамгийн сайн ном.']]) },
    mistakes: [['more taller', 'taller', 'Давхар харьцуулалт болохгүй.'], ['the most tall', 'the tallest', 'Богино тэмдэг -est.']],
    practice: [{ type: 'fill', q: 'A car is ___ than a bike.', options: ['fast', 'faster', 'fastest'], answer: 1 }],
    quiz: [{ q: 'This is ___ book I have read.', options: ['good', 'better', 'the best'], answer: 2 }],
    related: ['present-simple'],
  },

  // ── B1 ──
  {
    id: 'present-perfect', level: 'B1', title: 'Present Perfect Tense', icon: 'Pf', time: '18 мин',
    desc: 'Өнгөрсөнд эхэлж одоог хүртэл үргэлжилсэн/үр дүнтэй холбоотой үйлдэл.',
    definition: 'Present Perfect (have/has + V3) нь өнгөрсөнд болсон боловч одоотой холбоотой үйлдлийг илэрхийлнэ.',
    useCases: ['Туршлага (I have been to Japan)', 'Саяхан дууссан үйлдэл (just, already)', 'Одоог хүртэл үргэлжилсэн (for, since)'],
    structure: [
      { form: 'I / You / We / They', pos: 'have finished.', neg: "have not (haven't) finished.", q: 'Have you finished?' },
      { form: 'He / She / It', pos: 'has finished.', neg: "has not (hasn't) finished.", q: 'Has he finished?' },
    ],
    note: 'have/has + үйл үгийн 3-р хэлбэр (V3): go→gone, eat→eaten, see→seen.',
    examples: {
      Батлах: ex([['I have finished my homework.', 'Би гэрийн даалгавраа дуусгасан.'], ['She has been to Paris.', 'Тэр Парист очиж байсан.']]),
      Сөрөг: ex([["I haven't seen him.", 'Би түүнийг хараагүй.']]),
      Асуух: ex([['Have you eaten?', 'Чи хооллочихсон уу?']]),
    },
    mistakes: [['I have went.', 'I have gone.', 'V3 хэлбэр: gone.'], ['She have finished.', 'She has finished.', '3-р ганц бие → has.']],
    practice: [{ type: 'fill', q: 'I have ___ my keys.', options: ['lose', 'lost', 'losed'], answer: 1 }],
    quiz: [{ q: 'She ___ already left.', options: ['have', 'has', 'is'], answer: 1 }, { q: 'I have ___ this movie.', options: ['see', 'saw', 'seen'], answer: 2 }],
    related: ['past-simple', 'passive-voice'],
  },
  {
    id: 'passive-voice', level: 'B1', title: 'Passive Voice', icon: 'Pv', time: '16 мин',
    desc: 'Үйлдлийг хүлээн авагч талаас илэрхийлэх.',
    definition: 'Passive (be + V3) нь хэн хийснээс илүү юу болсонд анхаарна.',
    useCases: ['Хийгч нь чухал биш үед', 'Албан ёсны/шинжлэх ухааны бичвэр'],
    structure: [
      { form: 'Present', pos: 'is made', neg: 'is not made', q: 'Is it made?' },
      { form: 'Past', pos: 'was made', neg: 'was not made', q: 'Was it made?' },
    ],
    note: 'be (am/is/are/was/were) + үйл үгийн 3-р хэлбэр (V3).',
    examples: { Батлах: ex([['This book was written in 2019.', 'Энэ ном 2019 онд бичигдсэн.'], ['English is spoken here.', 'Энд англиар ярьдаг.']]) },
    mistakes: [['The cake was make.', 'The cake was made.', 'V3 хэлбэр: made.']],
    practice: [{ type: 'fill', q: 'The house ___ built in 2000.', options: ['was', 'is', 'were'], answer: 0 }],
    quiz: [{ q: 'These cars ___ made in Japan.', options: ['is', 'are', 'was'], answer: 1 }],
    related: ['present-perfect'],
  },
];

export default LESSONS;

export function findLesson(id) { return LESSONS.find(l => l.id === id); }
export function lessonsByLevel(level) { return LESSONS.filter(l => l.level === level); }
