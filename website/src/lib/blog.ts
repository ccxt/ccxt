import { blogPosts } from 'collections/server';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { loader } from 'fumadocs-core/source';
import { siteUrl } from './shared';

// The blog is English-only (no i18n on this loader): every locale renders the same
// posts, and the canonical URL is always the un-prefixed /blog/<slug>.
export const blog = loader({
  baseUrl: '/blog',
  source: toFumadocsSource(blogPosts, []),
});

export type BlogPost = ReturnType<typeof blog.getPages>[number];

export const blogDescription =
  'News, release deep-dives, and multi-language guides from the CCXT team — the open-source library connecting 100+ cryptocurrency exchanges.';

export const POSTS_PER_PAGE = 6;

export function getSortedPosts(): BlogPost[] {
  return [...blog.getPages()].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
}

export function getTotalPages(): number {
  return Math.max(1, Math.ceil(blog.getPages().length / POSTS_PER_PAGE));
}

// 1-indexed page of the date-sorted post list; empty array past the end.
export function getPostsPage(page: number): BlogPost[] {
  return getSortedPosts().slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
}

// Canonical, locale-less absolute URL of a post — used for <link rel=canonical>,
// the RSS feed, and syndication (dev.to/Hashnode/Medium canonical_url).
export function postCanonicalUrl(post: BlogPost): string {
  return `${siteUrl}${post.url}`;
}

export function formatPostDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
