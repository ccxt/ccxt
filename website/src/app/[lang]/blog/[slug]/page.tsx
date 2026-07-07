import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Rss } from 'lucide-react';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { getMDXComponents } from '@/components/mdx';
import { blog, formatPostDate, postCanonicalUrl } from '@/lib/blog';
import { appName, basePath, siteUrl } from '@/lib/shared';

// Render on demand, then cache (same policy as the docs pages).
export const revalidate = false;

export default async function BlogPost(props: PageProps<'/[lang]/blog/[slug]'>) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();
  const MDX = page.data.body;
  const date = new Date(page.data.date);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link
          href={`${basePath}/blog`}
          className="flex items-center gap-1.5 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All posts
        </Link>
        <Link
          href={`${basePath}/blog/rss.xml`}
          className="flex items-center gap-1.5 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          title="Subscribe via RSS"
        >
          <Rss className="size-4" aria-hidden />
          RSS
        </Link>
      </div>
      <article className="mt-8">
        <header>
          <time dateTime={date.toISOString()} className="text-sm text-fd-muted-foreground">
            {formatPostDate(date)}
          </time>
          <h1 className="mt-2 text-4xl font-bold">{page.data.title}</h1>
          {page.data.description ? (
            <p className="mt-3 text-lg text-fd-muted-foreground">{page.data.description}</p>
          ) : null}
          <p className="mt-4 border-b pb-6 text-sm text-fd-muted-foreground">
            By <span className="font-medium text-fd-foreground">{page.data.author}</span>
          </p>
        </header>
        <div className="prose mt-8 min-w-0">
          {page.data.toc.length > 2 ? <InlineTOC items={page.data.toc} /> : null}
          <MDX components={getMDXComponents()} />
        </div>
      </article>
    </main>
  );
}

// No generateStaticParams: posts render on demand in server mode (nginx caches),
// matching the docs pages. The RSS feed at /blog/rss.xml is still fully static.
export async function generateMetadata(props: PageProps<'/[lang]/blog/[slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = blog.getPage([params.slug]);
  if (!page) notFound();
  const canonical = postCanonicalUrl(page);

  return {
    title: `${page.data.title} | ${appName} Blog`,
    description: page.data.description,
    // every locale serves the same English post — one canonical, no hreflang variants
    alternates: {
      canonical,
      types: {
        'application/rss+xml': [{ title: `${appName} Blog`, url: `${siteUrl}/blog/rss.xml` }],
      },
    },
    openGraph: {
      type: 'article',
      siteName: appName,
      title: page.data.title,
      description: page.data.description,
      url: canonical,
      publishedTime: new Date(page.data.date).toISOString(),
      authors: [page.data.author],
      images: [{ url: `${basePath}/og/home`, width: 1200, height: 630 }],
    },
  };
}
