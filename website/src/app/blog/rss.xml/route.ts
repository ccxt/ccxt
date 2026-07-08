import { Feed } from 'feed';
import { blogDescription, getSortedPosts, postCanonicalUrl } from '@/lib/blog';
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
    description: blogDescription,
    language: 'en',
    favicon: `${siteUrl}/icon.svg`,
    copyright: `© ${new Date().getFullYear()} CCXT`,
    feedLinks: { rss: `${siteUrl}/blog/rss.xml` },
  });

  // Latest 20 only — feed readers re-download this file on every poll, and the
  // full archive lives in the sitemap/index, not the feed.
  for (const post of getSortedPosts().slice(0, 20)) {
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
