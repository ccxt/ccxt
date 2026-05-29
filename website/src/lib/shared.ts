export const appName = 'CCXT';
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
