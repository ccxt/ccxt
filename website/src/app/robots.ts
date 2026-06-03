import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

// Generated as a static robots.txt at build time (output: 'export').
// A subpath build (NEXT_BASE_PATH, e.g. /v2) is a staging endpoint — keep it out of
// search engines so it doesn't duplicate the live docs.
const basePath = process.env.NEXT_BASE_PATH ?? '';
export default function robots(): MetadataRoute.Robots {
  if (basePath) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
