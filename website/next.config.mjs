import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  // Serve under a subpath (e.g. /v2) when NEXT_BASE_PATH is set, so the new docs can
  // coexist with the old site. Unset = root build (for the eventual cutover).
  basePath: process.env.NEXT_BASE_PATH || undefined,
  // Static export has no Next image optimizer (/_next/image 404s). Render images
  // directly. CCXT docs reference mostly remote images (githubusercontent, badges).
  images: { unoptimized: true },
};

export default withMDX(config);
