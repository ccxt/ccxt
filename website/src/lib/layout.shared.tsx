import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';
import { i18n } from './i18n';
import { CcxtMark } from '@/components/ccxt-mark';

// Top-nav section labels per locale (the Fumadocs UI chrome is translated separately
// in lib/i18n-ui.ts). Falls back to English.
const NAV_LABELS: Record<string, { guide: string; exchanges: string; examples: string }> = {
  en: { guide: 'Guide', exchanges: 'Exchanges', examples: 'Examples' },
  es: { guide: 'Guía', exchanges: 'Exchanges', examples: 'Ejemplos' },
  pt: { guide: 'Guia', exchanges: 'Exchanges', examples: 'Exemplos' },
  ko: { guide: '가이드', exchanges: '거래소', examples: '예제' },
  zh: { guide: '指南', exchanges: '交易所', examples: '示例' },
  fr: { guide: 'Guide', exchanges: 'Exchanges', examples: 'Exemples' },
  de: { guide: 'Anleitung', exchanges: 'Börsen', examples: 'Beispiele' },
};

export function baseOptions(locale: string = i18n.defaultLanguage): BaseLayoutProps {
  // default locale keeps un-prefixed URLs (/docs/...); others get /<locale>/docs/...
  const prefix = locale === i18n.defaultLanguage ? '' : `/${locale}`;
  const t = NAV_LABELS[locale] ?? NAV_LABELS.en;
  // the language switcher is enabled by RootProvider's i18n (see components/provider.tsx),
  // so the deprecated layout-level `i18n` prop isn't needed here.
  return {
    nav: {
      title: (
        <>
          <CcxtMark className="size-5" />
          <span className="font-semibold">{appName}</span>
        </>
      ),
    },
    // Always-visible section nav so you can jump between the Guide, per-exchange
    // reference, and code Examples from any page. URLs are basePath-aware via Next <Link>.
    links: [
      { text: t.guide, url: `${prefix}/docs` },
      { text: t.exchanges, url: `${prefix}/docs/exchanges/binance` },
      { text: t.examples, url: `${prefix}/docs/examples` },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
