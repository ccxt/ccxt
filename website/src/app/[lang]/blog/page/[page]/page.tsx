import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BlogIndex } from '@/components/blog-index';
import { blogDescription, getPostsPage, getTotalPages } from '@/lib/blog';
import { appName, basePath, siteUrl } from '@/lib/shared';

// Render on demand, then cache (same policy as the docs pages).
export const revalidate = false;

// Page 1 is /blog itself; /blog/page/1 redirects there. Anything non-numeric or
// past the last page 404s.
function resolvePage(raw: string): number {
  if (!/^[0-9]+$/.test(raw)) notFound();
  const page = parseInt(raw, 10);
  if (page === 1) permanentRedirect('/blog');
  if (page < 1 || page > getTotalPages()) notFound();
  return page;
}

export default async function BlogPageN(props: PageProps<'/[lang]/blog/page/[page]'>) {
  const params = await props.params;
  const page = resolvePage(params.page);
  return <BlogIndex posts={getPostsPage(page)} page={page} totalPages={getTotalPages()} />;
}

export async function generateMetadata(props: PageProps<'/[lang]/blog/page/[page]'>): Promise<Metadata> {
  const params = await props.params;
  const page = resolvePage(params.page);
  return {
    title: `Blog — page ${page} | ${appName}`,
    description: blogDescription,
    alternates: {
      canonical: `${siteUrl}/blog/page/${page}`,
      types: {
        'application/rss+xml': [{ title: `${appName} Blog`, url: `${siteUrl}/blog/rss.xml` }],
      },
    },
    openGraph: {
      type: 'website',
      siteName: appName,
      title: `${appName} Blog — page ${page}`,
      description: blogDescription,
      url: `${siteUrl}/blog/page/${page}`,
      images: [{ url: `${basePath}/og/home`, width: 1200, height: 630 }],
    },
  };
}
