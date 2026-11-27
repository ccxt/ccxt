import { Feed } from 'feed';
import {
  CHANGELOG_TAGS,
  ERROR_CACHE_CONTROL,
  FEED_CACHE_CONTROL,
  PAGE_PATH,
  XML_FEED_PATH,
  absoluteUrl,
  escapeHtml,
  etagMatches,
  feedEtag,
  filterEntries,
  filterToSearchParams,
  getChangelogData,
  byReaderDesc,
  hostOf,
  isChangelogUnavailable,
  parseFilterParams,
  resolveVenueTokens,
  readerTime,
  toViewEntry,
  unavailableResponse,
  venueOf,
} from '@/lib/exchange-changelogs';
import { appName, basePath, siteUrl } from '@/lib/shared';

// GET /changelog-exchanges.xml — RSS 2.0 (Atom 1.0 with ?format=atom), latest 100 items,
// same filters as the .json route (?exchange=&tag=&since=&seenSince=&days=&status=&q=&limit=).
// Items are ordered and dated by when CCXT first saw them (firstSeen), so an entry published days
// before it was collected still reaches readers as new; backfilled entries (seeded when a source was
// added) keep their publication day (readerTime). 400 on malformed parameters, 503 (no-store)
// when the data is unavailable.
// Outside [lang] like blog/rss.xml: paths with a file extension bypass the i18n proxy.
// Item text is third-party data: it is HTML-escaped (shown as literal text by readers)
// and prefixed with where it came from; links are re-checked with safeHref.

function badRequest(problems: string[]): Response {
  return new Response(JSON.stringify({ error: 'invalid query parameters', problems }), {
    status: 400,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': ERROR_CACHE_CONTROL, 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' },
  });
}

export async function GET(req: Request): Promise<Response> {
  try {
    return await render(req);
  } catch (err) {
    if (isChangelogUnavailable(err)) return unavailableResponse(err);
    throw err;
  }
}

async function render(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const format = url.searchParams.get('format');
  const atom = format === 'atom';

  const { latest, venues } = await getChangelogData({ optionalHealth: true });
  const knownTags = new Set<string>([...CHANGELOG_TAGS, ...latest.entries.flatMap((e) => e.tags)]);
  const { filter: parsed, problems } = parseFilterParams(url.searchParams, { knownTags });
  if (format !== null && format !== 'atom' && format !== 'rss') problems.push('format: expected rss or atom');
  if (problems.length) return badRequest(problems);
  const resolved = resolveVenueTokens(parsed.exchanges, latest.venues.length ? latest.venues : [...venues.values()]);
  const filter = { ...parsed, exchanges: resolved.tokens };
  const qs = filterToSearchParams(parsed).toString();

  const etag = feedEtag(latest.generatedAt, `${atom ? 'atom' : 'rss'}|${filterToSearchParams(filter).toString()}|${resolved.unknown.join(',')}`, Boolean(filter.days));
  if (etagMatches(req, etag)) {
    return new Response(null, { status: 304, headers: { ETag: etag, 'Cache-Control': FEED_CACHE_CONTROL } });
  }

  const entries = filterEntries(latest.entries, { ...filter, limit: undefined }).sort(byReaderDesc).slice(0, Math.min(filter.limit ?? 100, 100));
  const pageUrl = absoluteUrl(PAGE_PATH);
  const selfQs = [qs, atom ? 'format=atom' : ''].filter(Boolean).join('&');
  const selfUrl = absoluteUrl(`${XML_FEED_PATH}${selfQs ? `?${selfQs}` : ''}`);
  const scope = parsed.exchanges.length ? ` — ${parsed.exchanges.join(', ')}` : '';

  const feed = new Feed({
    title: `${appName} — Exchange API Changelogs${scope}`,
    id: pageUrl,
    link: pageUrl,
    description: 'API changelog entries of the exchanges and prediction markets CCXT supports, collected daily. Item text is third-party data quoted from each venue.',
    language: 'en',
    favicon: `${siteUrl}${basePath}/icon.svg`,
    copyright: `Entry text © the respective venues; feed © ${new Date().getFullYear()} CCXT`,
    updated: latest.generatedAt ? new Date(latest.generatedAt) : undefined,
    ttl: 60,
    feedLinks: atom ? { atom: selfUrl } : { rss: selfUrl },
  });

  for (const e of entries) {
    const venue = venueOf(venues, e);
    const v = toViewEntry(e, venue);
    const host = hostOf(v.sourceHref) || 'the venue';
    const effective = e.effectiveDate ? ` Effective ${e.effectiveDate}.` : '';
    const when = readerTime(e);
    const published = v.publishedAt ? ` Published ${v.publishedAt}.` : '';   // items are dated by readerTime
    feed.addItem({
      id: `urn:ccxt-changelog:${e.id}`, // Atom ids must be URIs; RSS uses guid
      guid: e.id,
      link: v.href ?? pageUrl,
      // Atom titles are type="html" (RSS readers treat them alike): escape like the description;
      // titles are CDATA
      title: escapeHtml(`[${venue?.name ?? e.exchange}] ${v.title}`).replaceAll(']]>', ']] >'),
      description: escapeHtml(`Third-party text from ${host}:${published}${effective} ${v.excerpt}`),
      // when CCXT first saw it (the filing day for backfilled entries or a malformed timestamp)
      date: when ? new Date(when) : new Date(`${v.date}T00:00:00Z`),
      category: [...e.tags, e.exchange].map((name) => ({ name })),
    });
  }

  return new Response(atom ? feed.atom1() : feed.rss2(), {
    headers: {
      'Content-Type': atom ? 'application/atom+xml; charset=utf-8' : 'application/rss+xml; charset=utf-8',
      'Cache-Control': FEED_CACHE_CONTROL,
      ETag: etag,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
