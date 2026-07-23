import type { MetadataRoute } from 'next';
import { basePath, siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

// A subpath build (basePath, e.g. /v2) is a staging endpoint — keep it out of search
// engines so it doesn't duplicate the live docs. Use the same build-inlined
// NEXT_PUBLIC_BASE_PATH the rest of the app uses (NEXT_BASE_PATH isn't defined at runtime).
export default function robots(): MetadataRoute.Robots {
  if (basePath) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
