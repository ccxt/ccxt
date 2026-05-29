import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;

// The static Orama index is downloaded by the browser, so keep it small.
// CCXT's reference content is ~7.5MB of markdown which produces a ~110MB index if
// fully indexed. Strategy:
//   - full text for the prose guides (manual, pro-manual, faq, install, cli, ...)
//   - headings only (method / exchange names stay searchable) for the huge
//     auto-generated reference pages and changelog / market tables
//   - title only for the 557 example pages (code, low search value)
const HEADINGS_ONLY = new Set([
  '/docs/base-spec',
  '/docs/changelog',
  '/docs/exchange-markets',
  '/docs/exchange-markets-by-country',
  '/docs/awesome',
  '/docs/stats',
]);

export const { staticGET: GET } = createFromSource(source, {
  language: 'english',
  async buildIndex(page) {
    const data = page.data as any;
    const raw = data.structuredData;
    const sd = (typeof raw === 'function' ? await raw() : raw) ?? { headings: [], contents: [] };
    const url = page.url;

    let structuredData = sd;
    if (url.startsWith('/docs/examples/')) {
      structuredData = { headings: [], contents: [] };
    } else if (url.startsWith('/docs/exchanges/') || HEADINGS_ONLY.has(url)) {
      structuredData = { headings: sd.headings ?? [], contents: [] };
    }

    return {
      title: data.title,
      description: data.description,
      url,
      id: url,
      structuredData,
    };
  },
});
