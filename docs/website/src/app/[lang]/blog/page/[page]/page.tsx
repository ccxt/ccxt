import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BlogIndex } from '@/components/blog-index';
import { blogAbsoluteBase, blogStrings, getPostsPage, getTotalPages, localePrefix } from '@/lib/blog';
import { i18n } from '@/lib/i18n';
import { appName, basePath } from '@/lib/shared';

// Render on demand, then cache (same policy as the docs pages).
export const revalidate = false;

// Page 1 is /blog itself; /blog/page/1 redirects there (in the same locale). Anything
// non-numeric or past the last page 404s.
function resolvePage(raw: string, lang: string): number {
  if (!/^[0-9]+$/.test(raw)) notFound();
  const page = parseInt(raw, 10);
  if (page === 1) permanentRedirect(`${localePrefix(lang)}/blog`);
  if (page < 1 || page > getTotalPages()) notFound();
  return page;
}

function pageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = { 'x-default': `${blogAbsoluteBase}${path}` };
  for (const lang of i18n.languages) languages[lang] = `${blogAbsoluteBase}${localePrefix(lang)}${path}`;
  return languages;
}

export default async function BlogPageN(props: PageProps<'/[lang]/blog/page/[page]'>) {
  const params = await props.params;
  const page = resolvePage(params.page, params.lang);
  return (
    <BlogIndex lang={params.lang} posts={getPostsPage(page, params.lang)} page={page} totalPages={getTotalPages()} />
  );
}

export async function generateMetadata(props: PageProps<'/[lang]/blog/page/[page]'>): Promise<Metadata> {
  const params = await props.params;
  const page = resolvePage(params.page, params.lang);
  const t = blogStrings(params.lang);
  const path = `/blog/page/${page}`;
  const url = `${blogAbsoluteBase}${localePrefix(params.lang)}${path}`;
  return {
    title: `${t.pageTitle(page)} | ${appName}`,
    description: t.description,
    alternates: {
      canonical: url,
      languages: pageAlternates(path),
      types: {
        'application/rss+xml': [{ title: `${appName} Blog`, url: `${blogAbsoluteBase}/blog/rss.xml` }],
      },
    },
    openGraph: {
      type: 'website',
      siteName: appName,
      title: `${appName} ${t.pageTitle(page)}`,
      description: t.description,
      url,
      images: [{ url: `${basePath}/og/home`, width: 1200, height: 630 }],
    },
  };
}
