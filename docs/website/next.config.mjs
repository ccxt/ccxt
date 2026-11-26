import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// PostHog analytics (src/lib/analytics.ts). Only when the build has a project token: without
// one nothing below changes the site. The docs' own /cx-relay path is rewritten to the
// PostHog EU ingestion host, so ad blockers that drop *.posthog.com requests still let the
// analytics through. PostHog API paths end in a slash, hence skipTrailingSlashRedirect (as
// PostHog's Next.js rewrites guide requires). Keep INGEST_PATH in step with analytics.ts.
const POSTHOG_ENABLED = (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? '').length > 0;
const INGEST_PATH = '/cx-relay';
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com').replace(/\/+$/, '');
// eu.i.posthog.com -> eu-assets.i.posthog.com (the SDK's static assets)
const POSTHOG_ASSETS_HOST = POSTHOG_HOST.replace(/^https:\/\/(\w+)\.i\.posthog\.com$/, 'https://$1-assets.i.posthog.com');
const posthogRewrites = POSTHOG_ENABLED
  ? [
      { source: `${INGEST_PATH}/static/:path*`, destination: `${POSTHOG_ASSETS_HOST}/static/:path*` },
      { source: `${INGEST_PATH}/array/:path*`, destination: `${POSTHOG_ASSETS_HOST}/array/:path*` },
      { source: `${INGEST_PATH}/:path*`, destination: `${POSTHOG_HOST}/:path*` },
    ]
  : [];

/** @type {import('next').NextConfig} */
const config = {
  // Containerized server build by default (lean standalone bundle, run via `node
  // server.js`); NEXT_OUTPUT=export still produces the static export if ever needed.
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : 'standalone',
  // Pin the standalone tracing root to website/ so server.js lands at a deterministic
  // path (.next/standalone/server.js) rather than a monorepo-nested one.
  outputFileTracingRoot: import.meta.dirname,
  // app/sitemap.ts reads content/docs from disk, but it is force-static: that read only
  // happens while the sitemap is prerendered at build time. Keep the converted docs
  // (the whole wiki) out of its server trace so they aren't copied into the standalone
  // image. Drop this if the sitemap ever renders at runtime.
  outputFileTracingExcludes: { '/sitemap.xml': ['./content/docs/**/*'] },
  reactStrictMode: true,
  // ccxt (used by the health monitor, src/lib/health-monitor.ts) is a large server-only
  // package — load it from node_modules at runtime instead of bundling it. It is still
  // traced into the standalone output.
  serverExternalPackages: ['ccxt'],
  // Serve under a subpath (e.g. /v2) when NEXT_BASE_PATH is set, so the new docs can
  // coexist with the old site. Unset = root build (for the eventual cutover).
  basePath: process.env.NEXT_BASE_PATH || undefined,
  // Expose the base path to client code (Next does NOT prepend basePath to raw fetch()),
  // so the static search client can fetch the index at <basePath>/api/search.
  env: { NEXT_PUBLIC_BASE_PATH: process.env.NEXT_BASE_PATH || '' },
  // Static export has no Next image optimizer (/_next/image 404s). Render images
  // directly. CCXT docs reference mostly remote images (githubusercontent, badges).
  images: { unoptimized: true },
  // Pretty Markdown URLs for AI agents: /docs/x.md -> the markdown route (server mode only).
  async rewrites() {
    if (process.env.NEXT_OUTPUT === 'export') return [];
    return [{ source: '/docs/:path*.md', destination: '/llms.mdx/docs/:path*' }, ...posthogRewrites];
  },
  ...(POSTHOG_ENABLED ? { skipTrailingSlashRedirect: true } : {}),
  // The home OG card used to be a route handler at /og/home; it is now a static file
  // generated at build time (scripts/generate-og-images.mjs). Keep the old URL working
  // for previews that were scraped before the move.
  async redirects() {
    if (process.env.NEXT_OUTPUT === 'export') return [];
    return [{ source: '/og/home', destination: '/og/home.png', permanent: true }];
  },
  // Allow the apex marketing site (https://ccxt.com, GitHub Pages) to embed docs in an
  // iframe. Do NOT send X-Frame-Options here — SAMEORIGIN would block that embed, and
  // CSP frame-ancestors supersedes XFO in modern browsers. The docs deploy also drops
  // any leftover nginx X-Frame-Options: SAMEORIGIN (see docs-fumadocs.yml).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://ccxt.com",
          },
        ],
      },
      {
        // Pre-rendered OG cards in public/og. Next's static file server would send
        // `max-age=0`; keep the caching the old image route handlers set. The files aren't
        // content-hashed, so no `immutable`: a redeploy can change a card.
        source: '/og/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' }],
      },
    ];
  },
};

export default withMDX(config);
