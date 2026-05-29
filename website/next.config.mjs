import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  // Static export has no Next image optimizer (/_next/image 404s). Render images
  // directly. CCXT docs reference mostly remote images (githubusercontent, badges).
  images: { unoptimized: true },
};

export default withMDX(config);
