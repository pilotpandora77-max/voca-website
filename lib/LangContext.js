'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { LANGS } from '@/lib/courses';

const LangContext = createContext({ lang: 'zh', setLang: () => {}, langInfo: LANGS[0] });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('zh');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('voca_course_lang');
      if (saved && LANGS.some(l => l.code === saved)) setLangState(saved);
    } catch {}
  }, []);

  function setLang(code) {
    setLangState(code);
    try { localStorage.setItem('voca_course_lang', code); } catch {}
  }

  const langInfo = LANGS.find(l => l.code === lang) || LANGS[0];
  return <LangContext.Provider value={{ lang, setLang, langInfo }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }
