import { type NextRequest, type NextFetchEvent, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

// nextUrl.pathname has basePath stripped, and rewrite targets aren't re-prefixed,
// so add it back manually (baked in via next.config `env`).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const { rewrite } = rewritePath('/docs{/*path}', '/llms.mdx/docs{/*path}');

// Locale routing for /docs and the home page (aligned with hideLocale: 'default-locale').
const i18nProxy = createI18nMiddleware(i18n);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Content negotiation: AI agents requesting `Accept: text/markdown` on a default-locale
  // /docs page get the raw markdown instead of HTML.
  if (isMarkdownPreferred(request)) {
    const result = rewrite(request.nextUrl.pathname);
    if (result) {
      return NextResponse.rewrite(new URL(`${basePath}${result}`, request.nextUrl));
    }
  }
  // Otherwise apply locale routing.
  return i18nProxy(request, event);
}

export const config = {
  // Page routes only — skip api, _next, the og/ image routes, and any path with a file
  // extension (sitemap.xml, robots.txt, icon.svg, llms.txt, *.md, ...).
  matcher: ['/((?!api|_next|og|.*\\..*).*)'],
};
