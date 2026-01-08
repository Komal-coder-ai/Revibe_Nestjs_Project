// src/language/index.ts
import en from './en';
import hi from './hi';

export type LanguageCode = 'en' | 'hi';

const languages: Record<LanguageCode, typeof en> = {
  en,
  hi,
};

export function getMessage(key: keyof typeof en, lang: LanguageCode = 'en'): string {
  return languages[lang][key] || en[key] || '';
}

// Usage example:
// getMessage('categoryAdded', 'hi')
