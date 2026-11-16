import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { AlertTriangle, Ban, CheckCircle2, ExternalLink } from 'lucide-react';
import { ChangelogExplorer, type VenueStatus } from '@/components/changelog-explorer';
import {
  CHANGELOG_CONTRAST,
  JSON_FEED_PATH,
  MD_PATH,
  PAGE_PATH,
  XML_FEED_PATH,
  addDays,
  byDateDesc,
  entryDate,
  ANY_HOST,
  formatTimestamp,
  getChangelogData,
  hostOf,
  safeHref,
  toViewEntry,
  upcomingEntries,
  utcDay,
  venueKey,
  venueOf,
  type SourceHealth,
  type VenueInfo,
} from '@/lib/exchange-changelogs';
import { source } from '@/lib/source';
import { appName, basePath } from '@/lib/shared';

// Incremental static regeneration: rebuilt at most hourly (and on demand via
// POST /api/revalidate/changelog). Filters are applied client-side from the URL, so this
// server component must never read searchParams (that would make it dynamic).
// getChangelogData() throws when the feed is unavailable and no last-good copy or build-time
// snapshot exists: during a background regeneration Next then keeps serving the previous render
// (and retries on the next request) instead of caching an empty page.
// generateStaticParams returns [] (nothing prerendered at build): without it the dynamic [lang]
// segment makes the route render on every request and `revalidate` is ignored. Each locale
// renders on first request, then is cached. Every locale shows the same English content.
export const revalidate = 3600;

export function generateStaticParams(): { lang: string }[] {
  return [];
}

const TITLE = 'Exchange API Changelogs';
const DESCRIPTION =
  'Daily-collected API changelogs of every exchange and prediction market CCXT supports: deprecations, breaking changes, new endpoints and rate-limit updates, in one timeline with RSS and JSON feeds.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    // one canonical (English) for every locale variant of this page
    canonical: `${basePath}${PAGE_PATH}`,
    types: {
      'application/rss+xml': [{ title: `${appName} — ${TITLE} (RSS)`, url: `${basePath}${XML_FEED_PATH}` }],
      'application/atom+xml': [{ title: `${appName} — ${TITLE} (Atom)`, url: `${basePath}${XML_FEED_PATH}?format=atom` }],
      'application/feed+json': [{ title: `${appName} — ${TITLE} (JSON Feed)`, url: `${basePath}${JSON_FEED_PATH}?format=jsonfeed` }],
      'text/markdown': [{ title: TITLE, url: `${basePath}${MD_PATH}` }],
    },
  },
  openGraph: {
    type: 'website',
    siteName: appName,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${basePath}/og/home.png`, width: 1200, height: 630 }],
  },
};

const EXTERNAL_REL = 'nofollow noopener noreferrer';

// docs path for a venue only when the site actually has that page
function withDocPaths(venues: Map<string, VenueInfo>): Map<string, VenueInfo> {
  const out = new Map<string, VenueInfo>();
  for (const [key, v] of venues) {
    const slugs = v.kind === 'prediction' ? ['prediction', v.id] : ['exchanges', v.id];
    out.set(key, { ...v, docPath: source.getPage(slugs) ? v.docPath : null });
  }
  return out;
}

interface CoverageRow {
  venue: VenueInfo;
  sources: SourceHealth[];
  healthy: number;
  failing: number;          // failing sources not expected to be blocked
  blocked: number;          // failing sources the registry expects to be blocked from CI
  latestDate: string | null;
  unmonitored?: string;     // registry reason the venue has no monitorable source
}

// expected to fail from GitHub-hosted runners (datacenter IPs blocked): neutral, not unhealthy
const isBlocked = (s: SourceHealth) => !s.ok && Boolean(s.expectBlocked);

// Coverage order: degraded venues first, then ones with sources blocked from CI, then the rest;
// venues with nothing to monitor last.
function coverageRank(r: CoverageRow): number {
  if (r.failing) return 0;
  if (r.blocked) return 1;
  if (r.unmonitored || r.sources.length === 0) return 3;
  return 2;
}

export default async function Page() {
  const { latest, health, venues: rawVenues } = await getChangelogData();
  const venues = withDocPaths(rawVenues);
  const today = utcDay();

  const entries = latest.entries.map((e) => toViewEntry(e, venueOf(venues, e))).sort(byDateDesc);

  const since7 = addDays(today, -7);
  const since30 = addDays(today, -30);
  const last7 = latest.entries.filter((e) => entryDate(e) >= since7).length;
  const last30 = latest.entries.filter((e) => entryDate(e) >= since30).length;
  const upcoming = upcomingEntries(latest.entries, today).length;
  const blockedCount = health.sources.filter(isBlocked).length;
  const countedSources = health.sources.length - blockedCount;
  const healthyCount = health.sources.filter((s) => s.ok).length;
  const healthyCounted = health.sources.filter((s) => s.ok && !isBlocked(s)).length;

  // coverage table: one row per venue from health.json (+ venues with no sources listed)
  const byVenue = new Map<string, SourceHealth[]>();
  for (const s of health.sources) {
    const key = venueKey(s.kind, s.venue);
    byVenue.set(key, [...(byVenue.get(key) ?? []), s]);
  }
  const summaries = new Map(latest.venues.map((v) => [venueKey(v.kind, v.id), v]));
  const coverage: CoverageRow[] = [...venues.values()]
    .map((venue) => {
      const sources = byVenue.get(venue.key) ?? [];
      const dates = [summaries.get(venue.key)?.latestDate, ...sources.map((s) => s.latestDate)].filter((d): d is string => Boolean(d)).sort();
      const unmonitored = summaries.get(venue.key)?.unmonitored;
      return {
        venue,
        sources,
        healthy: sources.filter((s) => s.ok).length,
        failing: sources.filter((s) => !s.ok && !s.expectBlocked).length,
        blocked: sources.filter(isBlocked).length,
        latestDate: dates.at(-1) ?? null,
        ...(unmonitored ? { unmonitored } : {}),
      };
    })
    .sort((a, b) => coverageRank(a) - coverageRank(b) || a.venue.name.localeCompare(b.venue.name));
  const degraded = coverage.filter((r) => r.failing > 0).length;
  // venues the registry lists as unmonitored (no public changelog, spec or docs page to watch)
  const unmonitoredCount = coverage.filter((r) => r.unmonitored).length;
  const monitoredCount = coverage.length - unmonitoredCount;

  // per-venue status for the explorer's single-venue header
  const status: Record<string, VenueStatus> = {};
  for (const r of coverage) {
    status[r.venue.key] = {
      sources: r.sources.length,
      healthy: r.healthy,
      failing: r.failing,
      blocked: r.blocked,
      latestDate: r.latestDate,
      entryCount: summaries.get(r.venue.key)?.entryCount ?? 0,
      ...(r.unmonitored ? { unmonitored: r.unmonitored } : {}),
    };
  }

  const updated = latest.generatedAt || health.generatedAt;
  const toc = [
    { title: 'Timeline', url: '#timeline', depth: 2 },
    ...(upcoming ? [{ title: 'Upcoming deadlines', url: '#upcoming', depth: 3 }] : []),
    { title: 'Coverage', url: '#coverage', depth: 2 },
    { title: 'Feeds & API', url: '#feeds', depth: 2 },
    { title: 'Collector status', url: '#status', depth: 2 },
  ];
  const coverageSummary =
    `${monitoredCount} venues through ${health.sources.length} sources — ` +
    (degraded ? `${degraded} ${degraded === 1 ? 'venue' : 'venues'} degraded` : 'no venue degraded') +
    (blockedCount ? `, ${blockedCount} ${blockedCount === 1 ? 'source' : 'sources'} blocked from CI` : '') +
    (unmonitoredCount ? `, ${unmonitoredCount} with nothing public to monitor` : '');

  return (
    <DocsPage toc={toc}>
      <DocsTitle>{TITLE}</DocsTitle>
      <DocsDescription className="mb-0">
        CCXT monitors the API changelog of every exchange and prediction market it supports, every day, so the library
        stays up to date and you don&apos;t have to track them yourself. Every deprecation, breaking change and new
        endpoint in one place.
      </DocsDescription>

      <DocsBody>
        <h2 id="timeline">Timeline</h2>
        <ChangelogExplorer entries={entries} venues={[...venues.values()]} status={status} today={today} windowDays={latest.windowDays} />

        <h2 id="coverage">Coverage</h2>
        <details className={`not-prose group rounded-xl border ${CHANGELOG_CONTRAST}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-fd-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring [&::-webkit-details-marker]:hidden">
            <span>
              {coverageSummary}.{' '}
              <span className="text-fd-muted-foreground">
                {degraded ? 'Changes from degraded venues may arrive late or need a manual check.' : `${healthyCount} sources fetched successfully on the last run.`}
              </span>
            </span>
            <span className="shrink-0 text-xs font-medium text-fd-primary">
              <span className="group-open:hidden">Show table</span>
              <span className="hidden group-open:inline">Hide table</span>
            </span>
          </summary>
          <div className="border-t p-2 sm:p-3">
            <CoverageTable rows={coverage} />
            {blockedCount ? (
              <p className="mt-2 text-xs text-fd-muted-foreground">
                &ldquo;Blocked from CI&rdquo;: the venue&apos;s site rejects requests from datacenter IPs such as GitHub-hosted runners. This is expected,
                is not counted as a failure, and those changelogs are checked by hand.
              </p>
            ) : null}
          </div>
        </details>

        <h2 id="feeds">Feeds &amp; API</h2>
        <p>Every view of the timeline maps to a feed URL — use the <strong>Subscribe</strong> button above, or build one by hand:</p>
        <ul>
          <li>
            <a href={`${basePath}${XML_FEED_PATH}`}><code>{XML_FEED_PATH}</code></a> — RSS 2.0 (add <code>?format=atom</code> for Atom), latest 100 items,
            ordered and dated by when CCXT first saw them (entries backfilled when a venue was added keep their publication date).
          </li>
          <li>
            <a href={`${basePath}${JSON_FEED_PATH}`}><code>{JSON_FEED_PATH}</code></a> — JSON (add <code>?format=jsonfeed</code> for JSON Feed 1.1,
            or <code>?exchange=&lt;id&gt;&amp;full=1</code> for one venue&apos;s 365-day history with bodies).
          </li>
          <li>
            <a href={`${basePath}${MD_PATH}`}><code>{MD_PATH}</code></a> — this page as Markdown for LLM agents.
          </li>
        </ul>
        <p>
          Filters (all optional, comma-separated): <code>exchange=binance,okx</code>, <code>tag=breaking,deprecation</code>,{' '}
          <code>since=YYYY-MM-DD</code> (or an ISO timestamp; matched against the publication date), <code>days=30</code>,{' '}
          <code>q=text</code>, <code>limit=50</code>. A bare id is the exchange with that id (falling back to the prediction market only when no
          exchange has it); <code>prediction/binance</code> or <code>kind=prediction</code> picks the prediction market, and ccxt subclass ids such as{' '}
          <code>binanceusdm</code> or <code>okxus</code> map to their parent venue. Malformed parameters get a <code>400</code> listing every problem;
          unknown venue ids and tags return <code>200</code> with a <code>warnings</code> array (the JSON route; an unknown tag matches nothing). Responses carry an <code>ETag</code>, so pollers can send{' '}
          <code>If-None-Match</code>; a <code>503</code> means the data is briefly unavailable — retry later.
        </p>
        <p>
          <strong>Incremental polling:</strong> <code>seenSince=&lt;ISO timestamp&gt;</code> returns only entries CCXT first saw after that
          instant, whatever their publication date. Every JSON response carries <code>nextSince</code> (the largest <code>firstSeen</code> it
          returned) — pass it as <code>seenSince</code> on the next poll. With <code>seenSince</code>, <code>limit</code> pages forward through the
          oldest unseen entries and <code>hasMore: true</code> says to ask again right away.
        </p>

        <h2 id="status">Collector status</h2>
        <p>How the daily collector did on its last run. Sources blocked from CI are checked by hand and not counted as failing.</p>
        <dl className={`not-prose grid grid-cols-2 gap-2 sm:grid-cols-4 ${CHANGELOG_CONTRAST}`}>
          <Stat label="Venues monitored" value={String(monitoredCount)} />
          <Stat
            label="Sources healthy"
            value={`${healthyCounted}/${countedSources}`}
            tone={countedSources && healthyCounted < countedSources ? 'warn' : 'ok'}
            note={blockedCount ? `+${blockedCount} blocked from CI` : undefined}
            noteTitle={blockedCount ? 'Sources whose sites block datacenter IPs: expected, checked by hand, not counted as failing' : undefined}
          />
          <Stat
            label="Entries (7d / 30d)"
            value={`${last7} / ${last30}`}
            hint={upcoming ? <a href="#upcoming" className="underline-offset-2 hover:underline">{upcoming} upcoming</a> : undefined}
          />
          <Stat
            label="Last updated"
            value={updated ? <time dateTime={updated}>{formatTimestamp(updated)}</time> : 'unavailable'}
            small
          />
        </dl>
      </DocsBody>
    </DocsPage>
  );
}

function Stat({
  label, value, hint, note, noteTitle, tone, small,
}: {
  label: string; value: ReactNode; hint?: ReactNode; note?: string; noteTitle?: string; tone?: 'ok' | 'warn'; small?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-fd-card px-3 py-2.5">
      <dt className="text-xs text-fd-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 flex items-center gap-1.5 font-semibold tabular-nums ${small ? 'text-sm' : 'text-lg'}`}>
        {tone === 'warn' ? <AlertTriangle className="size-4 text-amber-600" aria-label="some sources degraded" /> : null}
        {value}
      </dd>
      {hint ? <dd className="text-[11px] leading-4 font-medium text-amber-800 dark:text-amber-300">{hint}</dd> : null}
      {note ? <dd className="text-[11px] leading-4 text-fd-muted-foreground" title={noteTitle}>{note}</dd> : null}
    </div>
  );
}

function CoverageTable({ rows }: { rows: CoverageRow[] }) {
  if (rows.length === 0) {
    return <p className="not-prose rounded-xl border border-dashed px-4 py-6 text-center text-sm text-fd-muted-foreground">Coverage data is not available right now.</p>;
  }
  return (
    <div className="not-prose overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Changelog sources per venue and their status on the last collector run</caption>
        <thead className="border-b bg-fd-muted/40 text-left text-xs text-fd-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">Venue</th>
            <th scope="col" className="px-3 py-2 font-semibold">Sources</th>
            <th scope="col" className="hidden px-3 py-2 font-semibold sm:table-cell">Status</th>
            <th scope="col" className="hidden px-3 py-2 font-semibold sm:table-cell">Latest date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ venue, sources, healthy, latestDate, unmonitored }) => (
            <tr key={venue.key} className={`border-b align-top last:border-0 ${unmonitored ? 'bg-fd-muted/20 text-fd-muted-foreground' : ''}`}>
              <th scope="row" className={`px-3 py-2 text-left ${unmonitored ? 'font-normal' : 'font-medium'}`}>
                {venue.docPath ? (
                  <Link href={venue.docPath} className="hover:text-fd-primary hover:underline">{venue.name}</Link>
                ) : (
                  venue.name
                )}
                <span className="block font-mono text-[11px] leading-4 font-normal text-fd-muted-foreground">
                  {venue.id}{venue.kind === 'prediction' ? ' · prediction' : ''}
                </span>
                {/* phones: status moves under the venue so the sources column keeps its width */}
                <span className="mt-1 block font-normal sm:hidden">
                  <StatusCell sources={sources} healthy={healthy} unmonitored={unmonitored} />
                </span>
              </th>
              <td className="px-3 py-2">
                {sources.length === 0 ? <span className="text-fd-muted-foreground">—</span> : null}
                <ul className="flex flex-col gap-0.5">
                  {sources.map((s) => {
                    const href = safeHref(s.link, ANY_HOST);
                    const label = hostOf(href) || s.id;
                    return (
                      <li key={s.id} className="flex flex-wrap items-center gap-1 text-xs">
                        {href ? (
                          <a href={href} target="_blank" rel={EXTERNAL_REL} className="inline-flex items-center gap-1 text-fd-foreground hover:text-fd-primary hover:underline">
                            <span>{breakableHost(label)}</span>
                            <ExternalLink className="size-3 shrink-0 text-fd-muted-foreground" aria-hidden />
                          </a>
                        ) : (
                          <span>{label}</span>
                        )}
                        <span className="text-fd-muted-foreground">({s.type}{s.role === 'secondary' ? ', secondary' : ''})</span>
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                <StatusCell sources={sources} healthy={healthy} unmonitored={unmonitored} />
              </td>
              <td className="hidden whitespace-nowrap px-3 py-2 font-mono text-xs text-fd-muted-foreground sm:table-cell">{latestDate ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Let narrow columns wrap host names at the dots instead of mid-label.
function breakableHost(host: string): ReactNode[] {
  return host.split('.').flatMap((part, i) => (i === 0 ? [part] : [<wbr key={i} />, `.${part}`]));
}

function StatusCell({ sources, healthy, unmonitored }: { sources: SourceHealth[]; healthy: number; unmonitored?: string }) {
  if (unmonitored) return <span className="text-xs text-fd-muted-foreground">not monitored: {unmonitored}</span>;
  if (sources.length === 0) return <span className="text-xs text-fd-muted-foreground">not monitored</span>;
  const failing = sources.filter((s) => !s.ok && !s.expectBlocked);
  const blocked = sources.filter(isBlocked);
  if (failing.length === 0 && blocked.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] leading-4 font-medium text-emerald-800 dark:text-emerald-300">
        <CheckCircle2 className="size-3" aria-hidden /> ok
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-1">
      {failing.length ? (
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] leading-4 font-medium text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-3" aria-hidden /> degraded ({healthy}/{sources.length})
        </span>
      ) : (
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-fd-border bg-fd-muted px-2 py-0.5 text-[11px] leading-4 font-medium text-fd-muted-foreground">
          <Ban className="size-3" aria-hidden /> blocked from CI{healthy ? ` (${healthy}/${sources.length} ok)` : ''}
        </span>
      )}
      {failing.map((s) => (
        <span key={s.id} className="text-[11px] leading-4 text-fd-muted-foreground">
          {s.id}: failing for {s.consecutiveFailures} {s.consecutiveFailures === 1 ? 'run' : 'runs'}
        </span>
      ))}
      {blocked.map((s) => (
        <span key={s.id} className="text-[11px] leading-4 text-fd-muted-foreground">
          {s.id}: blocked from CI ({s.expectBlocked})
        </span>
      ))}
    </span>
  );
}
