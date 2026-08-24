import { getLLMText, source } from '@/lib/source';
import { notFound } from 'next/navigation';

// generated on demand + cached forever (not baked for every page at build)
export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  const segs = slug ?? [];
  // page-action button appends "content.md"; the .md rewrite / Accept negotiation don't —
  // only strip the suffix when it's actually there.
  const pageSlug = segs.at(-1) === 'content.md' ? segs.slice(0, -1) : segs;
  const page = source.getPage(pageSlug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}
