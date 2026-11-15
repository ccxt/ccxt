import Link from 'next/link';
import { ArrowLeft, ArrowRight, Rss } from 'lucide-react';
import { blogDescription, formatPostDate, type BlogPost } from '@/lib/blog';

// Page 1 lives at /blog, later pages at /blog/page/N. Un-prefixed paths — <Link>
// prepends the basePath itself.
function pageHref(page: number): string {
  return page <= 1 ? '/blog' : `/blog/page/${page}`;
}

export function BlogIndex({ posts, page, totalPages }: {
  posts: BlogPost[];
  page: number;
  totalPages: number;
}) {
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="mt-3 text-fd-muted-foreground">{blogDescription}</p>
        </div>
        <Link
          href="/blog/rss.xml"
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
      {totalPages > 1 ? (
        <nav aria-label="Blog pagination" className="mt-10 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-fd-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              Older
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </main>
  );
}
