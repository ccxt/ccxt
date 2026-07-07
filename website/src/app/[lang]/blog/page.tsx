import type { Metadata } from 'next';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { formatPostDate, getSortedPosts } from '@/lib/blog';
import { appName, basePath, siteUrl } from '@/lib/shared';

// Render on demand, then cache (same policy as the docs pages — prerendering a
// default-locale page under hideLocale breaks the / rewrite, see [lang]/layout.tsx).
export const revalidate = false;

const description =
  'News, release deep-dives, and multi-language guides from the CCXT team — the open-source library connecting 100+ cryptocurrency exchanges.';

export const metadata: Metadata = {
  title: `Blog | ${appName}`,
  description,
  alternates: {
    canonical: `${siteUrl}/blog`,
    types: {
      'application/rss+xml': [{ title: `${appName} Blog`, url: `${siteUrl}/blog/rss.xml` }],
    },
  },
  openGraph: {
    type: 'website',
    siteName: appName,
    title: `${appName} Blog`,
    description,
    url: `${siteUrl}/blog`,
    images: [{ url: `${basePath}/og/home`, width: 1200, height: 630 }],
  },
};

export default function BlogIndex() {
  const posts = getSortedPosts();

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="mt-3 text-fd-muted-foreground">{description}</p>
        </div>
        <Link
          href={`${basePath}/blog/rss.xml`}
          className="flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          title="Subscribe via RSS"
        >
          <Rss className="size-4" aria-hidden />
          RSS
        </Link>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.url}
            href={post.url}
            className="block rounded-xl border bg-fd-card p-6 transition-colors hover:bg-fd-accent"
          >
            <time
              dateTime={new Date(post.data.date).toISOString()}
              className="text-sm text-fd-muted-foreground"
            >
              {formatPostDate(post.data.date)}
            </time>
            <h2 className="mt-1 text-xl font-semibold text-fd-foreground">{post.data.title}</h2>
            {post.data.description ? (
              <p className="mt-2 text-sm text-fd-muted-foreground">{post.data.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
