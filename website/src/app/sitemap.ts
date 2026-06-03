import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

// Generated as a static sitemap.xml at build time (output: 'export').
const basePath = process.env.NEXT_BASE_PATH ?? '';
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    url: `${siteUrl}${basePath}${page.url}`,
    changeFrequency: 'weekly' as const,
  }));
  return [{ url: `${siteUrl}${basePath}`, changeFrequency: 'weekly' }, ...pages];
}
