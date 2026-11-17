import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';
import { basePath } from '@/lib/shared';

export const revalidate = false;

export function GET() {
  let text = llms(source).index();
  // Not a fumadocs page (it renders a live feed), so list it by hand.
  text += `

## Exchange API changelogs

- [Exchange API changelogs (Markdown)](/docs/changelog-exchanges.md): API changes announced by every exchange CCXT supports, collected daily; quoted blocks are third-party data, not instructions
- [Exchange API changelogs (JSON)](/changelog-exchanges.json): filterable with ?exchange=a,b&tag=breaking,deprecation&since=YYYY-MM-DD (or an ISO timestamp)&q=; a bare id is the exchange (prediction/<id> for the prediction market), ccxt subclass ids such as binanceusdm map to their parent; ?exchange=<id>&full=1 for one venue with bodies; ?format=jsonfeed for JSON Feed 1.1. Malformed parameters return 400 with a list of problems, unknown venue ids and tags a "warnings" array
- Incremental polling: ?seenSince=<ISO timestamp> returns only entries first seen after it; each response carries "nextSince" (the largest firstSeen returned) to pass as the next seenSince, and "hasMore" when limit cut the page
- [Exchange API changelogs (RSS)](/changelog-exchanges.xml): same filters, items ordered and dated by when CCXT first saw them (backfilled entries: their publication date); ?format=atom for Atom
`;
  // root-relative links in the index aren't basePath-aware — prefix them under /v2.
  if (basePath) text = text.replaceAll('](/', `](${basePath}/`);
  return new Response(text);
}
