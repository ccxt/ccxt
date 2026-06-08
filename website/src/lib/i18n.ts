import { defineI18n } from 'fumadocs-core/i18n';

// English is the default and keeps the un-prefixed URLs (/docs/...), so existing
// links/SEO are unchanged. The other locales are served under /<locale>/docs/...
// Generated reference content (exchanges, examples, API spec) falls back to English;
// the hand-written guides are translated per-locale (name.<locale>.md).
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'es', 'pt', 'ko', 'zh', 'fr', 'de'],
  hideLocale: 'default-locale',
});

export const localeNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ko: '한국어',
  zh: '中文',
  fr: 'Français',
  de: 'Deutsch',
};

// Orama stemmer per locale, used by the search route to build each locale's index
// (localeMap). Orama ships stemmers for the Latin-script langs but has none for
// Korean/Chinese (the CJK tokenizer needs an uninstalled package), so ko/zh fall back
// to english.
export const oramaLanguage: Record<string, string> = {
  en: 'english',
  es: 'spanish',
  pt: 'portuguese',
  fr: 'french',
  de: 'german',
  ko: 'english',
  zh: 'english',
};
