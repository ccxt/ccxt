export const appName = 'CCXT';
// Subpath the site is served under (e.g. /v2). Next does NOT prepend basePath to
// manually-built URL strings (search index, markdown/og/llms links), so prefix it.
export const basePath = process.env.NEXT_BASE_PATH ?? '';
// Absolute site URL for sitemap.xml / robots.txt / canonical metadata.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.ccxt.com').replace(/\/$/, '');
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'ccxt',
  repo: 'ccxt',
  branch: 'fuma-docs',
};
