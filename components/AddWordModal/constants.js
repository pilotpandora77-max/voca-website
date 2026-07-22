// AddWordModal-ийн бүх табад хуваалцдаг тогтмолууд.

// AI Auto-Fill / TTS-д зориулсан OpenAI төлбөр одоогоор гаргахгүй байгаа тул
// түр хугацаагаар унтраасан. Дараа нь төлбөртэй API key нэмэгдэхэд true болгоно.
export const AI_ENABLED = false;

export const AI_LANGS = [
  { code: 'en', flag: '🇬🇧', label: 'EN', wordLabel: 'Англи үг',     placeholder: 'ж: benevolent',  readingLabel: 'IPA дуудлага' },
  { code: 'zh', flag: '🇨🇳', label: 'ZH', wordLabel: 'Хятад үг',     placeholder: 'ж: 你好',         readingLabel: 'Pinyin' },
  { code: 'ja', flag: '🇯🇵', label: 'JA', wordLabel: 'Япон үг',      placeholder: 'ж: ありがとう',    readingLabel: 'Romaji' },
  { code: 'ko', flag: '🇰🇷', label: 'KO', wordLabel: 'Солонгос үг', placeholder: 'ж: 안녕하세요',    readingLabel: 'Romanization' },
];

export const EMPTY_NEW_WORD = {
  front: '', back: '', hint: '', pos: [],
  example: '', exampleMeaning: '', synonyms: [], antonyms: [], level: '', tags: [], audioUrl: null,
  starred: false,
};

export const POS_OPTIONS = [
  'Нэр үг', 'Үйл үг', 'Тэмдэг нэр', 'Дайвар үг', 'Төлөөний үг', 'Угтвар үг',
  'Холбоос үг', 'Аялга үг', 'Тодотгогч', 'Хэлц', 'Оноосон нэр', 'Тоолох үг', 'Тоо нэр',
];
export const POS_ABBR_MN = {
  'Нэр үг': 'нэр', 'Үйл үг': 'үйл', 'Тэмдэг нэр': 'тэмд.', 'Дайвар үг': 'дайвар',
  'Төлөөний үг': 'төл.', 'Угтвар үг': 'угт.', 'Холбоос үг': 'холб.', 'Аялга үг': 'аялга',
  'Тодотгогч': 'тод.', 'Хэлц': 'хэлц', 'Оноосон нэр': 'оноос.', 'Тоолох үг': 'тоолох', 'Тоо нэр': 'тоо',
};
