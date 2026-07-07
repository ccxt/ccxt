import { Feed } from 'feed';
import { getSortedPosts, postCanonicalUrl } from '@/lib/blog';
import { appName, siteUrl } from '@/lib/shared';

// Fully static: generated once at build time. This route lives OUTSIDE [lang] on
// purpose — paths with a file extension bypass the i18n proxy (see src/proxy.ts
// matcher), so /blog/rss.xml resolves here directly for every visitor.
export const dynamic = 'force-static';

export function GET(): Response {
  const feed = new Feed({
    title: `${appName} Blog`,
    id: `${siteUrl}/blog`,
    link: `${siteUrl}/blog`,
    description:
      'News, release deep-dives, and multi-language guides from the CCXT team — the open-source library connecting 100+ cryptocurrency exchanges.',
    language: 'en',
    favicon: `${siteUrl}/icon.svg`,
    copyright: `© ${new Date().getFullYear()} CCXT`,
    feedLinks: { rss: `${siteUrl}/blog/rss.xml` },
  });

  for (const post of getSortedPosts()) {
    const url = postCanonicalUrl(post);
    feed.addItem({
      id: url,
      link: url,
      title: post.data.title,
      description: post.data.description,
      author: [{ name: post.data.author }],
      date: new Date(post.data.date),
      category: post.data.tags.map((tag) => ({ name: tag })),
    });
  }

  return new Response(feed.rss2(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
