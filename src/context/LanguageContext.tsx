import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Language, type Translations, translations } from '../lib/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('passthepage_lang');
    return saved === 'en' ? 'en' : 'he';
  });

  const isRtl = lang === 'he';
  const t = translations[lang];

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('passthepage_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'he' : 'en');
  };

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
