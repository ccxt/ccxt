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
