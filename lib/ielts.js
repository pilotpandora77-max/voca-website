// IELTS бэлтгэлийн хичээлийн агуулга

export const IELTS_OVERVIEW = {
  desc: 'IELTS (International English Language Testing System) нь англи хэлний түвшинг 4 ур чадвараар (Сонсох, Унших, Бичих, Ярих) хэмждэг олон улсын шалгалт. Оноо 1–9 band-аар үнэлэгдэнэ.',
  bands: [
    { band: '9', label: 'Expert', desc: 'Бүрэн төгс эзэмшсэн' },
    { band: '8', label: 'Very Good', desc: 'Бараг төгс, ховор алдаатай' },
    { band: '7', label: 'Good', desc: 'Сайн, зарим алдаатай' },
    { band: '6', label: 'Competent', desc: 'Хангалттай, тодорхой нөхцөлд алдаатай' },
    { band: '5', label: 'Modest', desc: 'Дунд зэрэг, олон алдаатай' },
    { band: '4', label: 'Limited', desc: 'Хязгаарлагдмал' },
  ],
};

export const IELTS_SECTIONS = [
  {
    id: 'listening', name: 'Сонсох (Listening)', icon: '🎧', color: '#3B82F6',
    format: '4 хэсэг · 40 асуулт · 30 минут (+10 мин шилжүүлэх). Бичлэгийг ЗӨВХӨН нэг удаа сонсоно.',
    sections: ['Хэсэг 1: Өдөр тутмын яриа (2 хүн)', 'Хэсэг 2: Монолог (жуулчны мэдээлэл г.м.)', 'Хэсэг 3: Эрдэм шинжилгээний яриа (2–4 хүн)', 'Хэсэг 4: Их сургуулийн лекц'],
    tips: [
      'Бичлэг эхлэхээс өмнө асуултуудыг урьдчилан уншиж, түлхүүр үг тэмдэглэ.',
      'Хариултын үгийн тоо/хэлбэрийн заавар (NO MORE THAN TWO WORDS) -ийг анхаар.',
      'Гацвал тэр асуултыг орхиод дараагийнх руугаа шилж — буцаж болохгүй.',
      'Тоо, нэр, огноо, хаягийн зөв бичгийг (spelling) онцгойлон анхаар.',
      'Synonym (ижил утгат үг) сонсоно — яг тэр үг сонсогдохгүй байж болно.',
    ],
    qtypes: ['Олон сонголт (Multiple choice)', 'Маягт нөхөх (Form/Note completion)', 'Газрын зураг тэмдэглэх (Map labeling)', 'Тааруулах (Matching)', 'Өгүүлбэр гүйцээх (Sentence completion)'],
    phrases: [],
    practice: [
      { q: '"Write NO MORE THAN TWO WORDS" гэвэл хэдэн үг бичих вэ?', options: ['Яг 2 үг', '2 хүртэл үг', '3 үг'], answer: 1 },
      { q: 'Listening-д бичлэгийг хэдэн удаа сонсох вэ?', options: ['1 удаа', '2 удаа', 'Хүссэн удаагаа'], answer: 0 },
    ],
  },
  {
    id: 'reading', name: 'Унших (Reading)', icon: '📖', color: '#10B981',
    format: 'Academic: 3 өгүүлбэр (passage) · 40 асуулт · 60 минут. Цаг өөрөө хуваарилна.',
    sections: ['Богино хугацаанд их хэмжээний текст уншина', 'Бүх хариулт текст дотроос гарна', 'Хариулт шилжүүлэх нэмэлт цаг БАЙХГҮЙ'],
    tips: [
      'Skimming — текстийг хурдан гүйлгэж ерөнхий санааг ол.',
      'Scanning — тодорхой мэдээлэл (тоо, нэр) хайж хурдан ол.',
      'Бүх текстийг үг бүрчлэн уншиж цаг бүү алд.',
      'True/False/Not Given-д: текстэд эсрэгээр байвал False, огт дурдаагүй бол Not Given.',
      'Гарчиг тааруулах (Matching headings) асуултыг сүүлд хий.',
      'Нэг асуултад 1.5 минутаас илүү бүү зарцуул.',
    ],
    qtypes: ['True / False / Not Given', 'Гарчиг тааруулах (Matching headings)', 'Олон сонголт', 'Өгүүлбэр/хүснэгт гүйцээх', 'Догол мөр тааруулах', 'Богино хариулт'],
    phrases: [],
    practice: [
      { q: 'Текстэд огт дурдаагүй мэдээллийн хариулт юу вэ?', options: ['False', 'Not Given', 'True'], answer: 1 },
      { q: 'Reading-д хариулт шилжүүлэх нэмэлт цаг бий юу?', options: ['Тийм, 10 мин', 'Үгүй', 'Тийм, 5 мин'], answer: 1 },
    ],
  },
  {
    id: 'writing', name: 'Бичих (Writing)', icon: '✍️', color: '#F59E0B',
    format: '2 даалгавар · 60 минут. Task 1 (≥150 үг, 20 мин), Task 2 (≥250 үг, 40 мин). Task 2 илүү өндөр жинтэй.',
    sections: [
      'Task 1 (Academic): График/хүснэгт/диаграм тайлбарлах',
      'Task 1 (General): Захидал бичих (албан/албан бус)',
      'Task 2: Эссэ — санал бодол, асуудал шийдэл, давуу/сул тал',
    ],
    tips: [
      'Task 2-т: Оршил → 2 үндсэн догол мөр → Дүгнэлт бүтэцтэй бич.',
      'Догол мөр бүр нэг гол санаа + тайлбар + жишээтэй байх.',
      'Холбоос үгс (Firstly, However, In addition, Therefore) ашигла.',
      'Task 1-д хамгийн чухал чиг хандлага (trend), өндөр/нам цэгийг онцол.',
      'Үгийн тоог хангах (Task 1 ≥150, Task 2 ≥250), эс бол оноо хасагдана.',
      'Цагаа хуваарилж, эцэст нь 2–3 минут шалгаж зас.',
    ],
    qtypes: ['Task 1: Line graph / Bar chart / Pie chart / Table / Process / Map / Letter', 'Task 2: Opinion / Discussion / Problem-Solution / Advantage-Disadvantage'],
    phrases: [
      ['Оршил', 'The graph illustrates… / This essay will discuss…'],
      ['Санал нэмэх', 'Furthermore, … / In addition, … / Moreover, …'],
      ['Эсрэг тал', 'However, … / On the other hand, … / Nevertheless, …'],
      ['Жишээ', 'For instance, … / For example, … / Such as …'],
      ['Дүгнэлт', 'In conclusion, … / To sum up, … / Overall, …'],
      ['Чиг хандлага', 'increased sharply / declined gradually / remained stable / peaked at'],
    ],
    practice: [
      { q: 'Task 2 эссэ хамгийн багадаа хэдэн үгтэй байх ёстой вэ?', options: ['150 үг', '250 үг', '200 үг'], answer: 1 },
      { q: 'Аль Task илүү өндөр оноотой вэ?', options: ['Task 1', 'Task 2', 'Тэнцүү'], answer: 1 },
    ],
  },
  {
    id: 'speaking', name: 'Ярих (Speaking)', icon: '🗣️', color: '#8B5CF6',
    format: '3 хэсэг · 11–14 минут · шалгагчтай нүүр тулан. Бичлэг хийгдэнэ.',
    sections: [
      'Part 1 (4–5 мин): Танилцах, өөрийн тухай энгийн асуулт',
      'Part 2 (3–4 мин): Cue card — 1 мин бэлдэж, 1–2 мин ярих',
      'Part 3 (4–5 мин): Part 2-той холбоотой гүнзгий хэлэлцүүлэг',
    ],
    tips: [
      'Богино "yes/no" хариулт бүү өг — тайлбар, жишээ нэмж дэлгэрүүл.',
      'Part 2-т 1 минутын бэлтгэлдээ түлхүүр санаа тэмдэглэ.',
      'Холбоос үгс (Well, Actually, To be honest, I mean) ашиглаж жам ёсоор ярь.',
      'Алдаа гаргахаас бүү ай — жам ёсны урсгал, баялаг үгсийн сан илүү чухал.',
      'Янз бүрийн цаг хэлбэр, нийлмэл өгүүлбэр ашигла.',
      'Дуудлага, өргөлт (intonation) -д анхаар.',
    ],
    qtypes: ['Part 1: Гэр бүл, ажил, хобби, төрсөн нутаг', 'Part 2: Хүн/газар/үйл явдал/эд зүйл тайлбарлах', 'Part 3: Хийсвэр, нийгмийн сэдвээр санал'],
    phrases: [
      ['Бодох цаг авах', "That's an interesting question… / Let me think…"],
      ['Санал илэрхийлэх', 'In my opinion, … / I believe that … / Personally, …'],
      ['Жишээ өгөх', 'For example, … / Like when I …'],
      ['Тодотгох', 'What I mean is … / In other words, …'],
    ],
    practice: [
      { q: 'Part 2-т бэлдэх хэдэн минут өгдөг вэ?', options: ['1 минут', '3 минут', 'Өгдөггүй'], answer: 0 },
      { q: 'Speaking хэдэн хэсэгтэй вэ?', options: ['2', '3', '4'], answer: 1 },
    ],
  },
];

export const IELTS_VOCAB = [
  ['analyze', 'ˈænəlaɪz', 'шинжлэх'], ['significant', 'sɪɡˈnɪfɪkənt', 'чухал, ихээхэн'],
  ['approximately', 'əˈprɒksɪmətli', 'ойролцоогоор'], ['fluctuate', 'ˈflʌktʃueɪt', 'хэлбэлзэх'],
  ['substantial', 'səbˈstænʃl', 'нэлээд их'], ['nevertheless', 'ˌnevəðəˈles', 'гэсэн ч'],
  ['consequently', 'ˈkɒnsɪkwəntli', 'үүний улмаас'], ['phenomenon', 'fəˈnɒmɪnən', 'үзэгдэл'],
  ['contemporary', 'kənˈtempərəri', 'орчин үеийн'], ['inevitable', 'ɪnˈevɪtəbl', 'зайлшгүй'],
  ['controversial', 'ˌkɒntrəˈvɜːʃl', 'маргаантай'], ['beneficial', 'ˌbenɪˈfɪʃl', 'ашигтай'],
];

export function findIelts(id) { return IELTS_SECTIONS.find(s => s.id === id); }
