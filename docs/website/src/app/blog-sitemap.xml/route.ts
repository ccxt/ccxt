import { blog, blogAbsoluteBase, getTotalPages } from '@/lib/blog';

// Blog-only sitemap. Lives at the ROOT (/blog-sitemap.xml, not /blog/sitemap.xml) so it
// may list https://ccxt.com/blog itself — a sitemap can only cover URLs at or below its
// own directory. The ccxt.com Worker route `ccxt.com/blog*` also matches this path, so it
// is served as https://ccxt.com/blog-sitemap.xml: same host as the URLs it lists, no
// cross-host robots.txt proof needed. Submit that URL in Search Console for ccxt.com.
// Outside [lang] on purpose: paths with a file extension bypass the i18n proxy.
export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function GET(): Response {
  const urls: { loc: string; lastmod?: string; changefreq: string }[] = [
    { loc: `${blogAbsoluteBase}/blog`, changefreq: 'weekly' },
  ];
  for (let page = 2; page <= getTotalPages(); page++) {
    urls.push({ loc: `${blogAbsoluteBase}/blog/page/${page}`, changefreq: 'weekly' });
  }
  for (const post of blog.getPages()) {
    urls.push({
      loc: `${blogAbsoluteBase}${post.url}`,
      lastmod: new Date(post.data.date).toISOString(),
      changefreq: 'monthly',
    });
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url><loc>${escapeXml(u.loc)}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
          `<changefreq>${u.changefreq}</changefreq></url>`,
      )
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
