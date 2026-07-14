import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('itqan_lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('itqan_lang', lang);
    document.documentElement.dir = translations[lang].dir;
    document.documentElement.lang = lang;
  }, [lang]);

  function toggleLang() {
    setLang((l) => (l === 'ar' ? 'en' : 'ar'));
  }

  function t(key) {
    return translations[lang][key] || key;
  }

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
