// "Шалгалт" системд ашиглагдах дасгалын төрлүүд.
// MatchQ (4-үгийн багц асуулт) энд ОРОХГҮЙ — нэг navigator нүд = нэг асуулт загварт таарахгүй.
export const EXAM_TYPES = [
  { key: 'flashcard', title: 'Флаш карт',        icon: '🗂️' },
  { key: 'choice',    title: 'Сонголттой тест',  icon: '📝' },
  { key: 'fill',      title: 'Дутуу үг нөхөх',   icon: '🔤' },
  { key: 'pronounce', title: 'Дуудлага дасгал',  icon: '🎤' },
  { key: 'listen',    title: 'Сонсох дасгал',    icon: '🎧' },
  { key: 'writing',   title: 'Бичих дасгал',     icon: '⌨️' },
];

export function examTypeMeta(key) {
  return EXAM_TYPES.find(t => t.key === key) || { key, title: key, icon: '❓' };
}

export const TIME_LIMIT_OPTIONS = [
  { value: 0,  label: 'Хугацаагүй' },
  { value: 5,  label: '5 мин' },
  { value: 10, label: '10 мин' },
  { value: 15, label: '15 мин' },
  { value: 20, label: '20 мин' },
  { value: 30, label: '30 мин' },
];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 30, 50];
