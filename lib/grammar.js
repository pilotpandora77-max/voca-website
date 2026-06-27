// Хэлээр сонгож дүрмийн өгөгдлийг буцаах нэгдсэн accessor
import EN_LESSONS, { CEFR as EN_CEFR } from '@/lib/grammarEn';
import { LESSONS_ZH, CEFR_ZH } from '@/lib/grammarZh';

export function getGrammar(lang) {
  if (lang === 'zh') return { lessons: LESSONS_ZH, levels: CEFR_ZH };
  return { lessons: EN_LESSONS, levels: EN_CEFR };
}
export function findLessonL(lang, id) {
  return getGrammar(lang).lessons.find(l => l.id === id);
}
export function lessonsByLevelL(lang, level) {
  return getGrammar(lang).lessons.filter(l => l.level === level);
}
