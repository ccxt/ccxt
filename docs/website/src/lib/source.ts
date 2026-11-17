import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import { i18n } from './i18n';
import { basePath, docsContentRoute, docsImageRoute, docsRoute } from './shared';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  i18n,
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  // resolve `icon` strings in meta.json (e.g. root tabs) to Lucide components
  icon(name) {
    if (name && name in icons) {
      return createElement(icons[name as keyof typeof icons]);
    }
  },
  // Shorten the sidebar labels of the two pages under each exchange folder
  // (.../exchanges/<id> and .../exchanges/<id>/implicit-api). The folder already
  // shows the exchange name, so the children only need "CCXT API" / "Implicit
  // API". This rewrites the tree node label only — page titles stay unique per
  // exchange (e.g. "binance implicit API") for browser tabs and SEO.
  plugins: [
    {
      name: 'shorten-exchange-page-labels',
      transformPageTree: {
        file(node) {
          const url = typeof node.url === 'string' ? node.url : '';
          const m = url.match(/\/docs\/exchanges\/[^/]+(\/implicit-api)?$/);
          if (m) {
            node.name = m[1] ? 'Implicit API' : 'CCXT API';
          }
          return node;
        },
      },
    },
    // List /docs/changelog-exchanges (a Next route, not an MDX page) in the Guide sidebar right
    // after the CCXT changelog. Added here rather than in build/wiki-to-fumadocs.ts so a change to
    // the sidebar does not touch build/ (which makes every language's CI run a full rebuild).
    {
      name: 'exchange-changelogs-link',
      transformPageTree: {
        folder(node) {
          const children = node.children;
          const at = children.findIndex((c) => c.type === 'page' && /\/docs\/changelog$/.test(c.url));
          const present = children.some((c) => c.type === 'page' && /\/docs\/changelog-exchanges$/.test(c.url));
          if (at !== -1 && !present) {
            const changelog = children[at] as Extract<(typeof children)[number], { type: 'page' }>;
            children.splice(at + 1, 0, { type: 'page', name: 'Exchange API Changelogs', url: `${changelog.url}-exchanges` });
          }
          return node;
        },
      },
    },
  ],
});

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `${basePath}${docsImageRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${basePath}${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');
  // root-relative links in the body aren't basePath-aware — prefix them under /v2.
  const body = basePath ? processed.replaceAll('](/', `](${basePath}/`) : processed;

  return `# ${page.data.title} (${basePath}${page.url})

${body}`;
}
