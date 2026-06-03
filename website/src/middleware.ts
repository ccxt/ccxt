import { type NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';

// Content negotiation: when an AI agent requests a docs page with
// `Accept: text/markdown`, serve the Markdown instead of HTML.
// (Server-mode only — middleware doesn't run under static export.)
// nextUrl.pathname has basePath stripped, and rewrite targets aren't re-prefixed,
// so add it back manually (baked in via next.config `env`).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const { rewrite } = rewritePath('/docs{/*path}', '/llms.mdx/docs{/*path}');

export function middleware(request: NextRequest) {
  if (isMarkdownPreferred(request)) {
    const result = rewrite(request.nextUrl.pathname);
    if (result) {
      return NextResponse.rewrite(new URL(`${basePath}${result}`, request.nextUrl));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/docs/:path*'],
};
