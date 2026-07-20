import { createContext, useContext, useState } from 'react';
import { translations } from '../translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ar');

  const t = translations[lang];
  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar');
  const isRTL = lang === 'ar';

  // Dark-only — the brutalist orange/black aesthetic doesn't support light mode.
  // Every page uses hardcoded dark inline styles; forcing light breaks the UI.
  const theme = 'dark';

  return (
    <LangContext.Provider value={{ lang, t, toggleLang, isRTL, theme }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} data-theme="dark">
        {children}
      </div>
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
