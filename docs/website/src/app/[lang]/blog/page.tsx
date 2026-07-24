import type { Metadata } from 'next';
import { BlogIndex } from '@/components/blog-index';
import { blogAbsoluteBase, blogDescription, getPostsPage, getTotalPages } from '@/lib/blog';
import { appName, basePath } from '@/lib/shared';

// Render on demand, then cache (same policy as the docs pages — prerendering a
// default-locale page under hideLocale breaks the / rewrite, see [lang]/layout.tsx).
export const revalidate = false;

export const metadata: Metadata = {
  title: `Blog | ${appName}`,
  description: blogDescription,
  alternates: {
    canonical: `${blogAbsoluteBase}/blog`,
    types: {
      'application/rss+xml': [{ title: `${appName} Blog`, url: `${blogAbsoluteBase}/blog/rss.xml` }],
    },
  },
  openGraph: {
    type: 'website',
    siteName: appName,
    title: `${appName} Blog`,
    description: blogDescription,
    url: `${blogAbsoluteBase}/blog`,
    images: [{ url: `${basePath}/og/home`, width: 1200, height: 630 }],
  },
};

export default function BlogIndexPage() {
  return <BlogIndex posts={getPostsPage(1)} page={1} totalPages={getTotalPages()} />;
}
