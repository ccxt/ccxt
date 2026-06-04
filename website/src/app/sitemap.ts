import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { basePath, siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages().map((page) => ({
    url: `${siteUrl}${basePath}${page.url}`,
    changeFrequency: 'weekly' as const,
  }));
  return [{ url: `${siteUrl}${basePath}`, changeFrequency: 'weekly' }, ...pages];
}
