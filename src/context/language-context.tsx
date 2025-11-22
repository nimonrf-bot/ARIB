'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '@/translations/en.json';
import ru from '@/translations/ru.json';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Ensure translations are always valid objects, even if imports fail.
const translations: Record<Language, { [key: string]: string }> = { 
  en: en || {}, 
  ru: ru || {} 
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Could not access localStorage to get language.", error);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
       console.error("Could not access localStorage to set language.", error);
    }
  };

  const t = (key: string): string => {
    // Defensive check to ensure the function is safe.
    const langTranslations = translations[language] || translations.en || {};
    return langTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
