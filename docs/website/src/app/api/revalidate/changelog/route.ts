import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { CHANGELOG_CACHE_TAG } from '@/lib/exchange-changelogs';

// POST /api/revalidate/changelog — called by the exchange-changelogs publish job after it
// pushes new feed files, so the page and feeds refresh without waiting for the hourly ISR.
//   header x-revalidate-secret: <CHANGELOG_REVALIDATE_SECRET>
// CHANGELOG_REVALIDATE_SECRET is the docs server's env var; the exchange-changelogs workflow
// sends the same value from the GitHub secret DOCS_REVALIDATE_SECRET.
// 404 when the server has no secret configured (endpoint disabled), 401 on a bad secret.
// revalidateTag(tag, 'max') is stale-while-revalidate: the next request still gets the
// old render and triggers the rebuild, so the caller should GET the page once afterwards.
// The page carries the tag through its tagged fetches, so the tag alone marks it stale. No
// revalidatePath: that expires the page outright (blocking re-render), and a re-render that
// throws because the feed is unavailable would then serve an error instead of the last page.
export const dynamic = 'force-dynamic';

function sameSecret(given: string, expected: string): boolean {
  // hash both sides so timingSafeEqual gets equal-length buffers regardless of input
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

function reply(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request): Promise<Response> {
  const expected = process.env.CHANGELOG_REVALIDATE_SECRET;
  if (!expected) return reply({ error: 'not found' }, 404);
  const given = req.headers.get('x-revalidate-secret');
  if (!given || !sameSecret(given, expected)) return reply({ error: 'unauthorized' }, 401);

  // the page (every locale) and the per-request feeds (.json/.xml/.md) all read the tagged fetch
  revalidateTag(CHANGELOG_CACHE_TAG, 'max');
  return reply({ revalidated: true, tag: CHANGELOG_CACHE_TAG, at: new Date().toISOString() }, 200);
}
