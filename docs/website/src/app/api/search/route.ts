import { source } from '@/lib/source';
import { createI18nSearchAPI } from 'fumadocs-core/search/server';
import { i18n, oramaLanguage } from '@/lib/i18n';

// Server-side (dynamic) search: the per-locale Orama indexes are built once in server
// memory and queried per request, so the browser never downloads the index. A static
// i18n export would ship every locale's partition to every visitor (penalising the
// English majority with the translated guides they don't use); dynamic search avoids
// that entirely and lets each locale be searched independently.
export const dynamic = 'force-dynamic';

// Per-locale search index. Each locale becomes its own Orama partition so that, e.g.,
// searching from /es queries the Spanish guides with a Spanish stemmer.
//
// The reference content (exchanges, examples, base-spec, changelog, market tables) is
// English in every locale — only the hand-written guides are translated. Each locale is
// its own partition, so anything indexed in a non-default locale is a full copy held in
// memory. The ~7.8k per-exchange method headings are identical English in every language,
// so replicating them ×7 would inflate the index for no benefit. We therefore trim by
// locale:
//   - default locale (en): full guides + method headings for exchanges + headings for the
//     big reference tables + example titles  (the complete, method-level search)
//   - other locales: the translated guides in full text + each exchange as a title-only
//     entry (so you can still find an exchange by name while reading in your language).
//     The method-level API reference stays fully searchable from the English locale.
const HEADINGS_ONLY = new Set([
  '/docs/base-spec',
  '/docs/changelog',
  '/docs/exchange-markets',
  '/docs/exchange-markets-by-country',
  '/docs/stats',
]);

// strip the locale prefix so the URL checks below work for every locale
// (/es/docs/exchanges/binance -> /docs/exchanges/binance)
function canonicalUrl(url: string, locale: string): string {
  const prefix = `/${locale}`;
  return locale !== i18n.defaultLanguage && url.startsWith(`${prefix}/`)
    ? url.slice(prefix.length)
    : url;
}

async function buildIndexes() {
  // shape matches fumadocs' advanced index entry; structuredData stays loose because we
  // trim it (headings-only / empty) for the heavy reference pages.
  const indexes: any[] = [];

  for (const locale of i18n.languages) {
    const isDefault = locale === i18n.defaultLanguage;
    for (const page of source.getPages(locale)) {
      const data = page.data as any;
      const url = canonicalUrl(page.url, locale);
      const isExample = url.startsWith('/docs/examples/');
      const isExchange = url.startsWith('/docs/exchanges/');
      const isHeadingsOnly = HEADINGS_ONLY.has(url);

      // non-default locales: drop the example pages and the big English reference tables
      // entirely (they stay searchable from the en locale).
      if (!isDefault && (isExample || isHeadingsOnly)) continue;

      const raw = data.structuredData;
      const sd = (typeof raw === 'function' ? await raw() : raw) ?? { headings: [], contents: [] };

      let structuredData = sd;
      if (isExample || (!isDefault && isExchange)) {
        structuredData = { headings: [], contents: [] }; // title-only
      } else if (isExchange || isHeadingsOnly) {
        structuredData = { headings: sd.headings ?? [], contents: [] }; // headings-only
      }

      indexes.push({
        title: data.title,
        description: data.description,
        url: page.url,
        id: page.url,
        structuredData,
        locale,
      });
    }
  }

  return indexes;
}

export const { GET } = createI18nSearchAPI('advanced', {
  i18n,
  // pin the stemmer per locale explicitly (ko/zh have no Orama stemmer -> english)
  localeMap: oramaLanguage,
  indexes: buildIndexes,
});
