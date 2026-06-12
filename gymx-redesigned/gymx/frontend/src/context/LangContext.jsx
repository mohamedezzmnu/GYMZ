import { createContext, useContext, useState } from 'react';
import { translations } from '../translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ar');
  const [theme, setTheme] = useState('dark');
  
  const t = translations[lang];
  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar');
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const isRTL = lang === 'ar';

  return (
    <LangContext.Provider value={{ lang, t, toggleLang, isRTL, theme, toggleTheme }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} data-theme={theme}>
        {children}
      </div>
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);