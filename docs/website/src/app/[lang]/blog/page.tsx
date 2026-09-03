import type { Metadata } from 'next';
import { BlogIndex } from '@/components/blog-index';
import { blogAbsoluteBase, blogStrings, getPostsPage, getTotalPages, localePrefix } from '@/lib/blog';
import { i18n } from '@/lib/i18n';
import { appName, basePath } from '@/lib/shared';

// Render on demand, then cache (same policy as the docs pages — prerendering a
// default-locale page under hideLocale breaks the / rewrite, see [lang]/layout.tsx).
export const revalidate = false;

// The index exists in every locale (chrome + post titles/descriptions are translated),
// so it gets a full hreflang set, x-default -> the un-prefixed English index.
function indexAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = { 'x-default': `${blogAbsoluteBase}${path}` };
  for (const lang of i18n.languages) languages[lang] = `${blogAbsoluteBase}${localePrefix(lang)}${path}`;
  return languages;
}

export async function generateMetadata(props: PageProps<'/[lang]/blog'>): Promise<Metadata> {
  const { lang } = await props.params;
  const t = blogStrings(lang);
  const url = `${blogAbsoluteBase}${localePrefix(lang)}/blog`;
  return {
    title: `${t.blog} | ${appName}`,
    description: t.description,
    alternates: {
      canonical: url,
      languages: indexAlternates('/blog'),
      types: {
        'application/rss+xml': [{ title: `${appName} Blog`, url: `${blogAbsoluteBase}/blog/rss.xml` }],
      },
    },
    openGraph: {
      type: 'website',
      siteName: appName,
      title: `${appName} ${t.blog}`,
      description: t.description,
      url,
      images: [{ url: `${basePath}/og/home`, width: 1200, height: 630 }],
    },
  };
}

export default async function BlogIndexPage(props: PageProps<'/[lang]/blog'>) {
  const { lang } = await props.params;
  return <BlogIndex lang={lang} posts={getPostsPage(1, lang)} page={1} totalPages={getTotalPages()} />;
}
