'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '@/translations/en.json';
import ru from '@/translations/ru.json';

type Language = 'en' | 'ru';

// This creates a type for our translation files, ensuring type safety.
type Translations = { [key: string]: string };

// The translations are now loaded into a properly typed record.
const translations: Record<Language, Translations> = {
  en,
  ru,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

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

  // This is the corrected and robust translation function.
  const t = (key: string): string => {
    // 1. It safely gets the translations for the current language.
    const langTranslations = translations[language];
    
    // 2. If the language file doesn't exist, it defaults to English.
    const defaultTranslations = translations.en;

    // 3. It checks if the key exists in the current language, or falls back to English, 
    //    or ultimately returns the key itself. It will never be undefined.
    return (langTranslations && langTranslations[key]) || (defaultTranslations && defaultTranslations[key]) || key;
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
    // This provides a clearer error message if the provider is missing.
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
