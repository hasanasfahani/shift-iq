'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../public/locales/en.json';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
    },
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

// Language metadata — used for the language switcher and html dir attribute
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' as const },
  { code: 'ar', label: 'العربية', dir: 'rtl' as const },
  { code: 'ku-sorani', label: 'کوردی سۆرانی', dir: 'rtl' as const },
  { code: 'ku-badini', label: 'Kurdî Badinî', dir: 'rtl' as const },
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];
