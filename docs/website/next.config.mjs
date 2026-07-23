import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // Containerized server build by default (lean standalone bundle, run via `node
  // server.js`); NEXT_OUTPUT=export still produces the static export if ever needed.
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : 'standalone',
  // Pin the standalone tracing root to website/ so server.js lands at a deterministic
  // path (.next/standalone/server.js) rather than a monorepo-nested one.
  outputFileTracingRoot: import.meta.dirname,
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
    return [{ source: '/docs/:path*.md', destination: '/llms.mdx/docs/:path*' }];
  },
};

export default withMDX(config);
