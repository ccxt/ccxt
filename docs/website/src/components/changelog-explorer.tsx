'use client';

import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode, type RefObject } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, BookOpen, Braces, CalendarClock, Check, CheckCircle2, ChevronDown, ChevronRight, Copy, ExternalLink, Inbox, Rss, Search, X } from 'lucide-react';
import {
  CHANGELOG_CONTRAST,
  CHANGELOG_TAGS,
  DAY_RANGES,
  DEFAULT_DAYS,
  JSON_FEED_PATH,
  MD_PATH,
  XML_FEED_PATH,
  addDays,
  formatDay,
  groupByDay,
  isIsoDate,
  isVenueToken,
  matchesVenue,
  resolveVenueToken,
  toViewEntry,
  upcomingEntries,
  venueKey,
  type ChangelogEntry,
  type VenueInfo,
  type ViewEntry,
} from '@/lib/exchange-changelogs-core';
import { basePath, siteUrl } from '@/lib/shared';

// Interactive timeline for /docs/changelog-exchanges. The server page passes entries
// that were already validated and link-sanitized (toViewEntry); all third-party text is
// rendered as React text nodes only. Filter state lives in the URL (?exchange=&tag=&days=&q=)
// so a filtered view can be shared and maps 1:1 onto the .xml/.json feed URLs.

// Per-venue source status for the single-venue header (computed by the server page).
export interface VenueStatus {
  sources: number;
  healthy: number;
  failing: number;          // failing sources not expected to be blocked
  blocked: number;          // failing sources the registry expects to be blocked from CI
  latestDate: string | null;
  entryCount: number;
  unmonitored?: string;
}

export interface ChangelogExplorerProps {
  entries: ViewEntry[];
  venues: VenueInfo[];
  status?: Record<string, VenueStatus>; // keyed by venueKey(kind, id)
  today: string; // YYYY-MM-DD (UTC) the page was rendered — keeps server/client output identical
  windowDays?: number; // days `entries` covers (latest.json window); one venue's history covers a year
}

interface FilterState {
  exchanges: string[];
  tags: string[];
  days: number;
  since?: string;
  q: string;
}

const PAGE_SIZE = 50;
const UPCOMING_PREVIEW = 8;
const YEAR = 365;

// Distinct venues the tokens select ("binance,binanceusdm" is one venue). Without the venue list
// the tokens are counted as they are (callers pass canonical, already resolved tokens then).
function selectedVenueCount(exchanges: readonly string[], venues?: readonly VenueInfo[]): number {
  return new Set(venues?.length ? exchanges.map((t) => resolveVenueToken(t, venues) ?? t) : exchanges).size;
}

// One venue selected: its history is short enough to show a whole year by default.
function defaultDays(exchanges: readonly string[], venues?: readonly VenueInfo[]): number {
  return selectedVenueCount(exchanges, venues) === 1 ? YEAR : DEFAULT_DAYS;
}

const DEFAULT_STATE: FilterState = { exchanges: [], tags: [], days: DEFAULT_DAYS, q: '' };

function splitList(v: string | null, ok: (s: string) => boolean): string[] {
  if (!v) return [];
  return [...new Set(v.split(',').map((s) => s.trim().toLowerCase()).filter((s) => s && ok(s)))];
}

function stateFromParams(sp: URLSearchParams, venues?: readonly VenueInfo[]): FilterState {
  const days = Number(sp.get('days'));
  const since = sp.get('since');
  const exchanges = splitList(sp.get('exchange'), isVenueToken);
  return {
    exchanges,
    tags: splitList(sp.get('tag'), (t) => /^[a-z0-9-]{1,40}$/.test(t)),
    days: sp.has('days') && Number.isInteger(days) && days > 0 && days <= 3650 ? days : defaultDays(exchanges, venues),
    since: isIsoDate(since) ? since : undefined,
    q: (sp.get('q') ?? '').slice(0, 200),
  };
}

// Only non-default values go into the URL (keeps shared links short). Feed URLs carry `days`
// only when it was picked explicitly.
function stateToParams(s: FilterState, venues?: readonly VenueInfo[]): URLSearchParams {
  const p = new URLSearchParams();
  if (s.exchanges.length) p.set('exchange', [...s.exchanges].sort().join(','));
  if (s.tags.length) p.set('tag', [...s.tags].sort().join(','));
  if (s.days !== defaultDays(s.exchanges, venues)) p.set('days', String(s.days));
  if (s.since) p.set('since', s.since);
  if (s.q.trim()) p.set('q', s.q.trim());
  return p;
}

function isFiltered(s: FilterState): boolean {
  return s.exchanges.length > 0 || s.tags.length > 0 || s.q.trim() !== '' || s.days !== DEFAULT_DAYS || Boolean(s.since);
}

// `keys` are the selected venues resolved to "kind/id" (unknown tokens kept as typed).
// `withDates: false` ignores the date window (used for the upcoming list).
function applyFilter(entries: readonly ViewEntry[], s: FilterState, keys: readonly string[], today: string, opts: { ignoreExchanges?: boolean; withDates?: boolean } = {}): ViewEntry[] {
  let start = addDays(today, -s.days);
  if (s.since && s.since > start) start = s.since;
  const ex = opts.ignoreExchanges ? [] : keys;
  const tags = new Set(s.tags);
  const q = s.q.trim().toLowerCase();
  return entries.filter((e) => {
    if (opts.withDates !== false && e.date < start) return false;
    if (ex.length && !ex.some((t) => matchesVenue(e, t))) return false;
    if (tags.size && !e.tags.some((t) => tags.has(t))) return false;
    if (q && !`${e.title}\n${e.excerpt}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

const byDate = (a: ViewEntry, b: ViewEntry) => b.date.localeCompare(a.date) || b.firstSeen.localeCompare(a.firstSeen);

// ---------------------------------------------------------------------------
// entry point: URL-synced state inside <Suspense> (keeps the server page static/ISR)
// ---------------------------------------------------------------------------

export function ChangelogExplorer(props: ChangelogExplorerProps) {
  return (
    <Suspense fallback={<ExplorerView {...props} state={DEFAULT_STATE} />}>
      <UrlSyncedExplorer {...props} />
    </Suspense>
  );
}

function UrlSyncedExplorer(props: ChangelogExplorerProps) {
  const sp = useSearchParams();
  const { venues } = props;
  const state = useMemo(() => stateFromParams(new URLSearchParams(sp.toString()), venues), [sp, venues]);
  const onChange = useCallback(
    (patch: Partial<FilterState>) => {
      const next = { ...state, ...patch };
      // switching between one and several venues moves a default range to the new default
      if (patch.exchanges && patch.days === undefined && state.days === defaultDays(state.exchanges, venues)) next.days = defaultDays(patch.exchanges, venues);
      const qs = stateToParams(next, venues).toString();
      // native history update: Next syncs useSearchParams without a server round trip (the page
      // does not read searchParams, so router.replace would only re-download the same payload)
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    },
    [state, venues],
  );
  return <ExplorerView {...props} state={state} onChange={onChange} />;
}

// ---------------------------------------------------------------------------
// view
// ---------------------------------------------------------------------------

interface ViewProps extends ChangelogExplorerProps {
  state: FilterState;
  onChange?: (patch: Partial<FilterState>) => void;
}

// Filter token of a venue: the bare id for exchanges (a bare id resolves to the exchange first)
// and for prediction markets whose id no exchange uses; "prediction/<id>" otherwise.
function venueTokens(venues: readonly VenueInfo[]): Map<string, string> {
  const exchangeIds = new Set(venues.filter((v) => v.kind === 'exchange').map((v) => v.id));
  return new Map(venues.map((v) => [v.key, v.kind === 'prediction' && exchangeIds.has(v.id) ? v.key : v.id]));
}

function ExplorerView({ entries, venues, status, today, windowDays, state, onChange }: ViewProps) {
  const venueByKey = useMemo(() => new Map(venues.map((v) => [v.key, v])), [venues]);
  const tokenByKey = useMemo(() => venueTokens(venues), [venues]);
  // URL tokens -> "kind/id" keys (binance -> exchange/binance, binanceusdm -> exchange/binance)
  const keys = useMemo(() => [...new Set(state.exchanges.map((t) => resolveVenueToken(t, venues) ?? t))], [state.exchanges, venues]);
  // canonical state: URL tokens rewritten to the venue's own token (feed URLs, chips)
  const canon = useMemo(() => ({ ...state, exchanges: keys.map((k) => tokenByKey.get(k) ?? k) }), [state, keys, tokenByKey]);
  const single = keys.length === 1 ? keys[0] : undefined;
  const singleVenue = single ? venueByKey.get(single) : undefined;
  const history = useVenueHistory(singleVenue ? single : undefined, venueByKey);
  const set = onChange ?? (() => {});

  // With exactly one venue selected, swap in its full 365-day history (with bodies).
  const pool = useMemo(() => {
    if (!history.entries || !single) return entries;
    return [...entries.filter((e) => !matchesVenue(e, single)), ...history.entries].sort(byDate);
  }, [entries, history.entries, single]);

  const visible = useMemo(() => applyFilter(pool, state, keys, today), [pool, state, keys, today]);
  const upcoming = useMemo(() => upcomingEntries(applyFilter(pool, state, keys, today, { withDates: false }), today), [pool, state, keys, today]);
  // the header stat and the contents link point at #upcoming whenever anything is announced, so the
  // block stays (with an empty message) when the filters match none of it
  const anyUpcoming = useMemo(() => upcomingEntries(entries, today).length > 0, [entries, today]);
  const venueCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of applyFilter(entries, state, keys, today, { ignoreExchanges: true })) {
      const token = tokenByKey.get(venueKey(e.kind, e.exchange)) ?? e.exchange;
      m.set(token, (m.get(token) ?? 0) + 1);
    }
    return m;
  }, [entries, state, keys, today, tokenByKey]);
  // what the empty state offers to widen to: the last year of one venue's loaded history, else the
  // window latest.json covers (90 days), not a year it does not hold
  const widestDays = single && history.entries ? YEAR : (windowDays && windowDays > 0 ? Math.min(windowDays, YEAR) : YEAR);
  const widerCount = useMemo(
    () => (visible.length === 0 && (state.since || state.days < widestDays) ? applyFilter(pool, { ...state, days: widestDays, since: undefined }, keys, today).length : 0),
    [visible.length, pool, state, keys, today, widestDays],
  );

  const [limit, setLimit] = useState(PAGE_SIZE);
  useEffect(() => setLimit(PAGE_SIZE), [state]);
  const groups = useMemo(() => groupByDay(visible.slice(0, limit)), [visible, limit]);
  const venueCount = new Set(visible.map((e) => venueKey(e.kind, e.exchange))).size;
  // the 1y range is offered with one venue selected, and stays visible (pressed) while it applies
  const ranges: number[] = [...DAY_RANGES];
  if (single || state.days === YEAR) ranges.push(YEAR);
  if (!state.since && !ranges.includes(state.days)) ranges.push(state.days);
  ranges.sort((a, b) => a - b);
  const daysLabel = (d: number) => (d === YEAR ? 'in the last year' : `in the last ${d} days`);
  const windowLabel = state.since ? `since ${state.since}` : daysLabel(state.days);

  return (
    <div className={`not-prose flex flex-col gap-4 ${CHANGELOG_CONTRAST}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-fd-card px-3 py-2">
        <p className="min-w-0 flex-1 basis-60 text-sm text-fd-muted-foreground">
          Follow these changes in a feed reader or from an agent. Feeds follow your filters.
        </p>
        <div className="ml-auto">
          <SubscribePanel state={canon} />
        </div>
      </div>
      {singleVenue ? <VenueHeader venue={singleVenue} token={tokenByKey.get(singleVenue.key) ?? singleVenue.key} status={status?.[singleVenue.key]} /> : null}

      {upcoming.length || anyUpcoming ? <UpcomingBlock entries={upcoming} venueByKey={venueByKey} today={today} filtered={isFiltered(state)} /> : null}

      {/* toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-fd-card p-3 sm:p-4" role="search" aria-label="Filter exchange changelogs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBox value={state.q} onChange={(q) => set({ q })} disabled={!onChange} />
          <div className="flex flex-wrap items-center gap-2">
            <VenuePicker venues={venues} tokens={tokenByKey} counts={venueCounts} selected={canon.exchanges} onChange={(exchanges) => set({ exchanges })} disabled={!onChange} />
            <div className="inline-flex rounded-lg border p-0.5" role="group" aria-label="Date range">
              {ranges.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={!state.since && state.days === d}
                  disabled={!onChange}
                  onClick={() => set({ days: d, since: undefined })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring ${!state.since && state.days === d ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'}`}
                >
                  {d === YEAR ? '1y' : `${d}d`}
                  <span className="sr-only"> (last {d} days)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by tag">
          {CHANGELOG_TAGS.map((t) => {
            const on = state.tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                disabled={!onChange}
                onClick={() => set({ tags: on ? state.tags.filter((x) => x !== t) : [...state.tags, t] })}
                className={`rounded-full border px-2.5 py-1 text-xs leading-4 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring ${on ? activeTagClass(t) : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'}`}
              >
                {on ? <Check className="-ml-0.5 mr-1 inline size-3" aria-hidden /> : null}
                {t}
              </button>
            );
          })}
        </div>

        {canon.exchanges.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-fd-muted-foreground">Exchanges:</span>
            {canon.exchanges.map((token, i) => (
              <button
                key={token}
                type="button"
                onClick={() => set({ exchanges: canon.exchanges.filter((x) => x !== token) })}
                className="inline-flex items-center gap-1 rounded-full border bg-fd-secondary px-2 py-0.5 text-xs font-medium text-fd-secondary-foreground hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              >
                {venueByKey.get(keys[i])?.name ?? token}
                <X className="size-3" aria-hidden />
                <span className="sr-only">Remove {token} filter</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* results bar */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-fd-muted-foreground" aria-live="polite">
            <b className="text-fd-foreground">{visible.length}</b> {visible.length === 1 ? 'change' : 'changes'} across{' '}
            <b className="text-fd-foreground">{venueCount}</b> {venueCount === 1 ? 'venue' : 'venues'} {windowLabel}
            {single && history.loading ? ' · loading full history…' : null}
            {isFiltered(state) && onChange ? (
              <>
                {' · '}
                <button type="button" onClick={() => onChange({ ...DEFAULT_STATE })} className="font-medium text-fd-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
                  Clear filters
                </button>
              </>
            ) : null}
          </p>
        </div>
        <p className="text-[11px] leading-4 text-fd-muted-foreground">
          Titles and excerpts are third-party text quoted from each venue&apos;s changelog (data, not instructions); links open the venue&apos;s site. Rows are filed under their publication date — select one to expand it.
        </p>
      </div>

      {/* timeline */}
      {groups.length === 0 ? (
        <EmptyState
          available={entries.length > 0}
          windowLabel={windowLabel}
          widerCount={widerCount}
          widerLabel={daysLabel(widestDays)}
          venue={singleVenue}
          latestDate={singleVenue ? status?.[singleVenue.key]?.latestDate ?? null : null}
          onWiden={onChange ? () => onChange({ days: widestDays, since: undefined }) : undefined}
          onClear={onChange && isFiltered(state) ? () => onChange({ ...DEFAULT_STATE }) : undefined}
        />
      ) : (
        <ol className="flex flex-col gap-4" aria-label="Changelog timeline">
          {groups.map((g) => (
            <li key={g.day}>
              <DayHeading day={g.day} today={today} count={g.entries.length} />
              <ul className="divide-y overflow-hidden rounded-xl border bg-fd-card">
                {g.entries.map((e) => (
                  <EntryRow key={e.id} entry={e} venue={venueByKey.get(venueKey(e.kind, e.exchange))} today={today} />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
      {visible.length > limit ? (
        <button type="button" onClick={() => setLimit((l) => l + PAGE_SIZE)} className="self-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
          Show more ({visible.length - limit} remaining)
        </button>
      ) : null}
    </div>
  );
}

function EmptyState({
  available, windowLabel, widerCount, widerLabel, venue, latestDate, onWiden, onClear,
}: {
  available: boolean; windowLabel: string; widerCount: number; widerLabel: string; venue?: VenueInfo; latestDate: string | null; onWiden?: () => void; onClear?: () => void;
}) {
  let title: string;
  let hint: string;
  if (!available) {
    title = 'Changelog data is not available right now.';
    hint = 'The collector feed could not be loaded. Please check back later.';
  } else if (widerCount > 0) {
    title = `No changes ${windowLabel} — ${widerCount} ${widerLabel}.`;
    hint = 'Widen the date range to see them.';
  } else if (venue) {
    title = `No changes recorded for ${venue.name} ${windowLabel === 'in the last year' ? 'in the last year' : windowLabel}.`;
    hint = latestDate ? `Latest recorded change: ${formatDay(latestDate, { year: 'numeric', month: 'short', day: 'numeric' })}.` : 'Its changelog has had no dated entries since monitoring started.';
  } else {
    title = 'No changes match these filters.';
    hint = 'Try a longer date range, fewer tags, or another exchange.';
  }
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center">
      <Inbox className="size-8 text-fd-muted-foreground" aria-hidden />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-xs text-fd-muted-foreground">{hint}</p>
      <div className="mt-1 flex gap-2">
        {available && widerCount > 0 && onWiden ? (
          <button type="button" onClick={onWiden} className="rounded-md border bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
            {widerLabel === 'in the last year' ? 'Show the last year' : `Show the ${widerLabel.replace(/^in the /, '')}`}
          </button>
        ) : null}
        {available && onClear ? (
          <button type="button" onClick={onClear} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

function VenueHeader({ venue, token, status }: { venue: VenueInfo; token: string; status?: VenueStatus }) {
  const enc = encodeURIComponent(token);
  const prediction = venue.kind === 'prediction';
  let health: ReactNode = null;
  if (status?.unmonitored) {
    health = <span>Not monitored: {status.unmonitored}</span>;
  } else if (status && status.sources > 0) {
    const n = `${status.sources} ${status.sources === 1 ? 'source' : 'sources'}`;
    health = status.failing > 0 ? (
      <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="size-3.5" aria-hidden /> {n} · {status.failing} failing — changes may arrive late
      </span>
    ) : (
      <span className="inline-flex items-center gap-1">
        <CheckCircle2 className="size-3.5 text-emerald-700 dark:text-emerald-300" aria-hidden /> {n} · {status.healthy === status.sources ? 'all healthy' : `${status.healthy} healthy`}
        {status.blocked ? ` · ${status.blocked} blocked from CI` : ''}
      </span>
    );
  }
  const linkCls = 'inline-flex items-center gap-1 rounded-md border bg-fd-background px-2 py-1 text-xs font-medium hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';
  return (
    <section aria-label={`${venue.name} changelog`} className="flex flex-col gap-2 rounded-xl border bg-fd-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-semibold">{venue.name}</span>
          <span className="font-mono text-xs text-fd-muted-foreground">{venue.id}</span>
          <span className={`rounded-full border px-1.5 py-px text-[11px] leading-4 font-medium ${prediction ? 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300' : 'border-fd-border bg-fd-secondary text-fd-secondary-foreground'}`}>
            {prediction ? 'prediction market' : 'exchange'}
          </span>
        </p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-fd-muted-foreground">
          {health}
          {status?.latestDate ? <span>latest change {status.latestDate}</span> : null}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        {venue.docPath ? (
          <Link href={venue.docPath} className={linkCls}>
            <BookOpen className="size-3.5" aria-hidden /> CCXT docs
          </Link>
        ) : null}
        <a href={`${basePath}${XML_FEED_PATH}?exchange=${enc}`} className={linkCls}>
          <Rss className="size-3.5 text-orange-600" aria-hidden /> RSS<span className="sr-only"> feed for {venue.name}</span>
        </a>
        <a href={`${basePath}${JSON_FEED_PATH}?exchange=${enc}&full=1`} className={linkCls}>
          <Braces className="size-3.5" aria-hidden /> JSON<span className="sr-only"> history of {venue.name}</span>
        </a>
      </div>
    </section>
  );
}

function daysUntil(day: string, today: string): number {
  return Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

function UpcomingBlock({ entries, venueByKey, today, filtered }: { entries: ViewEntry[]; venueByKey: Map<string, VenueInfo>; today: string; filtered: boolean }) {
  const [all, setAll] = useState(false);
  const shown = all ? entries : entries.slice(0, UPCOMING_PREVIEW);
  return (
    <section aria-labelledby="upcoming" className="scroll-mt-24 rounded-xl border border-amber-500/40 bg-amber-500/[0.06] p-3 sm:p-4">
      <h3 id="upcoming" className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-semibold">
        <CalendarClock className="size-4 text-amber-700 dark:text-amber-300" aria-hidden />
        Upcoming deadlines
        {entries.length ? (
          <span className="text-xs font-normal text-fd-muted-foreground">
            {entries.length} announced {entries.length === 1 ? 'date' : 'dates'}{filtered ? ' matching the filters' : ''}, soonest first
          </span>
        ) : null}
      </h3>
      {entries.length === 0 ? <p className="py-1.5 text-xs text-fd-muted-foreground">No announced dates match the filters.</p> : null}
      <ul className={entries.length ? 'flex flex-col divide-y divide-amber-500/20' : 'hidden'}>
        {shown.map((e) => {
          const n = daysUntil(e.effectiveDate!, today);
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1.5 sm:flex-nowrap">
              <time dateTime={e.effectiveDate} className="w-[6.5rem] shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums">
                {formatDay(e.effectiveDate!, e.effectiveDate!.slice(0, 4) === today.slice(0, 4) ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' })}
                <span className="ml-1 font-normal text-fd-muted-foreground">{n === 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n}d`}</span>
              </time>
              <VenueBadge id={e.exchange} venue={venueByKey.get(venueKey(e.kind, e.exchange))} />
              <span className="relative min-w-0 flex-1 basis-full truncate text-sm sm:basis-auto">
                <EntryTitle entry={e} />
              </span>
              <TagChips tags={e.tags} className="flex-wrap sm:shrink-0 sm:flex-nowrap" />
            </li>
          );
        })}
      </ul>
      {entries.length > UPCOMING_PREVIEW ? (
        <button type="button" aria-expanded={all} onClick={() => setAll((v) => !v)} className="mt-1 text-xs font-medium text-fd-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
          {all ? 'Show fewer' : `Show all ${entries.length}`}
        </button>
      ) : null}
    </section>
  );
}

function activeTagClass(tag: string): string {
  if (tag === 'breaking') return 'border-red-500/50 bg-red-500/15 text-red-700 dark:text-red-300';
  if (tag === 'deprecation') return 'border-amber-500/50 bg-amber-500/15 text-amber-800 dark:text-amber-300';
  return 'border-fd-primary bg-fd-primary text-fd-primary-foreground';
}

function tagChipClass(tag: string): string {
  if (tag === 'breaking') return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
  if (tag === 'deprecation') return 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300';
  if (tag === 'new-endpoint') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300';
  return 'border-fd-border bg-fd-background text-fd-muted-foreground';
}

function TagChips({ tags, className = 'min-w-0 flex-wrap' }: { tags: string[]; className?: string }) {
  if (!tags.length) return null;
  return (
    <span className={`flex items-center gap-1 ${className}`}>
      {tags.map((t) => (
        <span key={t} className={`rounded-full border px-1.5 py-px text-[11px] leading-4 font-medium ${tagChipClass(t)}`}>
          {t}
        </span>
      ))}
    </span>
  );
}

function DayHeading({ day, today, count }: { day: string; today: string; count: number }) {
  const upcoming = day > today;
  return (
    <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-fd-foreground">
      <time dateTime={day}>{formatDay(day)}</time>
      {day === today ? <span className="rounded-full bg-fd-primary/10 px-2 py-0.5 text-[11px] leading-4 font-medium text-fd-primary">Today</span> : null}
      {upcoming ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] leading-4 font-medium text-amber-800 dark:text-amber-300">
          <CalendarClock className="size-3" aria-hidden /> Upcoming
        </span>
      ) : null}
      <span className="text-xs font-normal text-fd-muted-foreground">
        {count} {count === 1 ? 'change' : 'changes'}
      </span>
    </h3>
  );
}

const EXTERNAL_REL = 'nofollow noopener noreferrer';

function EntryTitle({ entry: e, wrap = false }: { entry: ViewEntry; wrap?: boolean }) {
  if (!e.href) return <span title={wrap ? undefined : e.title}>{e.title}</span>;
  return (
    <a
      href={e.href}
      target="_blank"
      rel={EXTERNAL_REL}
      title={wrap ? undefined : e.title}
      className="font-medium text-fd-foreground decoration-fd-primary/50 underline-offset-2 hover:text-fd-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
    >
      {e.title}
      <span className="sr-only"> (opens the venue&apos;s changelog in a new tab)</span>
    </a>
  );
}

// One line (venue, tags, title, date meta) that expands to the excerpt/body and details. The
// chevron button is the keyboard control (Enter/Space); a click anywhere else on the row that
// is not a link toggles it too.
function EntryRow({ entry: e, venue, today }: { entry: ViewEntry; venue?: VenueInfo; today: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const full = e.body && e.body.trim() !== e.excerpt.trim() ? e.body : undefined;
  const upcoming = e.effectiveDate && e.effectiveDate >= today;
  const onRowClick = (ev: ReactMouseEvent<HTMLLIElement>) => {
    const target = ev.target as HTMLElement;
    if (target.closest('a, button, input') || window.getSelection()?.toString()) return;
    if (!target.closest('[data-row-head]')) return;
    setOpen((v) => !v);
  };
  return (
    // mouse convenience only: the chevron button is the keyboard control
    <li className={`px-2 sm:px-3 ${open ? 'bg-fd-background/60' : ''}`} onClick={onRowClick}>
      <div data-row-head className="flex cursor-pointer items-start gap-1.5 py-2 sm:items-center">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="mt-px shrink-0 rounded p-0.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring sm:mt-0"
        >
          <ChevronRight className={`size-4 transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden />
          <span className="sr-only">{open ? 'Hide' : 'Show'} details: {e.title}</span>
        </button>
        <div className={`flex min-w-0 flex-1 flex-col gap-1 ${open ? '' : 'sm:flex-row sm:items-center sm:gap-2'}`}>
          <span className="flex flex-wrap items-center gap-1 sm:shrink-0">
            <VenueBadge id={e.exchange} venue={venue} />
            <TagChips tags={e.tags} />
          </span>
          <h4 className={`relative min-w-0 flex-1 text-sm leading-snug ${open ? '[overflow-wrap:anywhere]' : 'truncate'}`}>
            <EntryTitle entry={e} wrap={open} />
          </h4>
        </div>
        <span className="hidden shrink-0 items-center gap-2 text-[11px] leading-4 text-fd-muted-foreground sm:flex">
          {upcoming ? <EffectiveChip day={e.effectiveDate!} /> : null}
          {!e.publishedAt ? <span title="no publication date: filed under the day CCXT first saw it">seen</span> : null}
        </span>
      </div>
      {upcoming ? (
        <div className="-mt-1 mb-2 ml-7 sm:hidden">
          <EffectiveChip day={e.effectiveDate!} />
        </div>
      ) : null}
      <div id={panelId} hidden={!open} className="mb-3 ml-7 flex flex-col gap-1.5">
        {e.excerpt || full ? (
          <p className="whitespace-pre-line text-sm text-fd-muted-foreground [overflow-wrap:anywhere]">{full ?? e.excerpt}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fd-muted-foreground">
          {e.publishedAt ? <span>published {e.publishedAt}</span> : null}
          <span>first seen {e.firstSeen.slice(0, 10)}</span>
          {e.effectiveDate ? <span>effective {e.effectiveDate}</span> : null}
          {e.scope ? <span>scope: <span className="font-mono">{e.scope}</span></span> : null}
          {e.sourceHref ? (
            <a href={e.sourceHref} target="_blank" rel={EXTERNAL_REL} className="inline-flex items-center gap-1 hover:text-fd-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">
              source: {e.sourceHost}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function EffectiveChip({ day }: { day: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 px-1.5 py-px text-[11px] leading-4 font-semibold whitespace-nowrap text-amber-800 dark:text-amber-300">
      <CalendarClock className="size-3" aria-hidden />
      effective {day}
    </span>
  );
}

function VenueBadge({ id, venue }: { id: string; venue?: VenueInfo }) {
  const prediction = venue?.kind === 'prediction';
  const cls = `inline-flex items-center rounded-md border px-1.5 py-px font-mono text-[11px] leading-4 font-semibold ${prediction ? 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300' : 'border-fd-border bg-fd-secondary text-fd-secondary-foreground'}`;
  const label = venue?.name && venue.name !== id ? `${venue.name} (${id})` : id;
  if (!venue?.docPath) return <span className={cls} title={label}>{id}</span>;
  return (
    <Link href={venue.docPath} className={`${cls} hover:border-fd-primary hover:text-fd-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring`} title={`CCXT docs for ${label}`}>
      {id}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// controls
// ---------------------------------------------------------------------------

function SearchBox({ value, onChange, disabled }: { value: string; onChange: (q: string) => void; disabled?: boolean }) {
  const [text, setText] = useState(value);
  const id = useId();
  // last value this box pushed: only a different incoming value (Clear filters, back/forward)
  // resets the input, so the URL catching up never overwrites characters typed meanwhile
  const pushed = useRef(value);
  useEffect(() => {
    if (value.trim() === pushed.current.trim()) return;
    pushed.current = value;
    setText(value);
  }, [value]);
  useEffect(() => {
    if (text.trim() === pushed.current.trim()) return;
    const t = setTimeout(() => {
      pushed.current = text;
      onChange(text);
    }, 250);
    return () => clearTimeout(t);
    // only the typed text should trigger a URL update (not a changed onChange identity)
  }, [text]);
  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor={id} className="sr-only">Search changelog titles and excerpts</label>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fd-muted-foreground" aria-hidden />
      <input
        id={id}
        type="search"
        value={text}
        disabled={disabled}
        onChange={(ev) => setText(ev.target.value)}
        placeholder="Search titles and excerpts…"
        className="w-full rounded-lg border bg-fd-background py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-fd-muted-foreground focus:border-fd-primary focus-visible:ring-2 focus-visible:ring-fd-ring/40"
      />
    </div>
  );
}

function useDismiss(open: boolean, close: () => void, ref: RefObject<HTMLElement | null>, returnFocus: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) close();
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        close();
        returnFocus.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref, returnFocus]);
}

function VenuePicker({
  venues, tokens, counts, selected, onChange, disabled,
}: {
  venues: VenueInfo[]; tokens: Map<string, string>; counts: Map<string, number>; selected: string[]; onChange: (ids: string[]) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, wrap, button);
  const tokenOf = (v: VenueInfo) => tokens.get(v.key) ?? v.key;
  const sorted = useMemo(
    () => [...venues].sort((a, b) => (counts.get(tokens.get(b.key) ?? b.key) ?? 0) - (counts.get(tokens.get(a.key) ?? a.key) ?? 0) || a.name.localeCompare(b.name)),
    [venues, counts, tokens],
  );
  const needle = q.trim().toLowerCase();
  const shown = needle ? sorted.filter((v) => v.id.includes(needle) || v.name.toLowerCase().includes(needle)) : sorted;
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="relative" ref={wrap}>
      <button
        ref={button}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border bg-fd-background px-2.5 py-1.5 text-sm font-medium hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        Exchanges
        {selected.length ? <span className="rounded-full bg-fd-primary px-1.5 text-[11px] leading-4 text-fd-primary-foreground">{selected.length}</span> : <span className="text-xs text-fd-muted-foreground">all</span>}
        <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Filter by exchange"
          className="absolute left-0 z-30 mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-xl border bg-fd-popover p-2 text-fd-popover-foreground shadow-lg"
        >
          <label className="sr-only" htmlFor={`${panelId}-q`}>Search exchanges</label>
          <input
            id={`${panelId}-q`}
            autoFocus
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
            placeholder="Search exchanges…"
            className="mb-2 w-full rounded-md border bg-fd-background px-2.5 py-1.5 text-sm outline-none focus:border-fd-primary"
          />
          <ul className="max-h-64 overflow-y-auto">
            {shown.map((v) => {
              const token = tokenOf(v);
              const n = counts.get(token) ?? 0;
              return (
                <li key={v.key}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-fd-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fd-ring">
                    <input type="checkbox" className="size-3.5 accent-[var(--color-fd-primary)]" checked={selected.includes(token)} onChange={() => toggle(token)} />
                    <span className="min-w-0 flex-1 truncate">{v.name}</span>
                    <span className="font-mono text-[11px] leading-4 text-fd-muted-foreground">{v.id}{v.kind === 'prediction' ? ' · prediction' : ''}</span>
                    <span className={`w-6 text-right text-[11px] leading-4 tabular-nums ${n ? 'text-fd-foreground' : 'text-fd-muted-foreground/60'}`}>{n}</span>
                  </label>
                </li>
              );
            })}
            {shown.length === 0 ? <li className="px-2 py-3 text-center text-xs text-fd-muted-foreground">No exchange matches “{q}”.</li> : null}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs">
            <span className="text-fd-muted-foreground">{selected.length ? `${selected.length} selected` : 'All exchanges'}</span>
            <span className="flex gap-2">
              {selected.length ? (
                <button type="button" onClick={() => onChange([])} className="font-medium text-fd-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">Clear</button>
              ) : null}
              <button type="button" onClick={() => { setOpen(false); button.current?.focus(); }} className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring">Done</button>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SubscribePanel({ state }: { state: FilterState }) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState(siteUrl);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, wrap, button);
  useEffect(() => setOrigin(window.location.origin), []);
  const qs = stateToParams(state).toString();
  const withQs = (path: string, extra?: string) => {
    const all = [qs, extra].filter(Boolean).join('&');
    return `${origin}${basePath}${path}${all ? `?${all}` : ''}`;
  };
  const rows: { label: string; url: string; hint: string }[] = [
    { label: 'RSS', url: withQs(XML_FEED_PATH), hint: 'RSS 2.0, latest 100 items' },
    { label: 'Atom', url: withQs(XML_FEED_PATH, 'format=atom'), hint: 'Atom 1.0' },
    { label: 'JSON', url: withQs(JSON_FEED_PATH), hint: 'CCXT JSON (entries + venues)' },
    { label: 'JSON Feed', url: withQs(JSON_FEED_PATH, 'format=jsonfeed'), hint: 'JSON Feed 1.1' },
    { label: 'Markdown', url: `${origin}${basePath}${MD_PATH}`, hint: 'whole page, for LLM agents (unfiltered)' },
  ];
  return (
    <div className="relative" ref={wrap}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border bg-fd-background px-2.5 py-1.5 text-sm font-medium hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        <Rss className="size-4 text-orange-500" aria-hidden />
        Subscribe
        <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Feed URLs for the current filter"
          className="absolute right-0 z-30 mt-1 w-[min(32rem,calc(100vw-2rem))] rounded-xl border bg-fd-popover p-3 text-fd-popover-foreground shadow-lg"
        >
          <p className="mb-2 text-xs text-fd-muted-foreground">
            {qs ? 'Feeds for the current filter.' : 'Feeds for all venues.'} Pick exchanges or tags first to narrow them.
          </p>
          <ul className="flex flex-col gap-2">
            {rows.map((r) => (
              <FeedUrlRow key={r.label} {...r} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function FeedUrlRow({ label, url, hint }: { label: string; url: string; hint: string }): ReactNode {
  const [copied, setCopied] = useState(false);
  const id = useId();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      document.getElementById(id)?.focus();
      (document.getElementById(id) as HTMLInputElement | null)?.select();
    }
  };
  return (
    <li>
      <label htmlFor={id} className="mb-0.5 flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold">{label}</span>
        <span className="truncate text-fd-muted-foreground">{hint}</span>
      </label>
      <div className="flex items-center gap-1">
        <input
          id={id}
          readOnly
          value={url}
          onFocus={(ev) => ev.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border bg-fd-background px-2 py-1 font-mono text-xs outline-none focus:border-fd-primary"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        >
          {copied ? <Check className="size-3.5 text-emerald-600" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
          <span className="sr-only"> {label} URL</span>
        </button>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// full history for a single selected venue (fetched from the JSON route)
// ---------------------------------------------------------------------------

// `key` is a resolved venue key ("exchange/okx", "prediction/binance").
function useVenueHistory(key: string | undefined, venueByKey: Map<string, VenueInfo>): { entries?: ViewEntry[]; loading: boolean } {
  const [state, setState] = useState<{ key?: string; entries?: ViewEntry[]; loading: boolean }>({ loading: false });
  // read through a ref: a new venues array identity must not refetch the history
  const venuesRef = useRef(venueByKey);
  venuesRef.current = venueByKey;
  useEffect(() => {
    if (!key) {
      setState({ loading: false });
      return;
    }
    const ctrl = new AbortController();
    setState({ key, loading: true });
    fetch(`${basePath}${JSON_FEED_PATH}?exchange=${encodeURIComponent(key)}&full=1`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        const list = (data as { entries?: unknown } | null)?.entries;
        if (!Array.isArray(list)) return setState({ key, loading: false });
        const entries = (list as Partial<ChangelogEntry>[])
          .map((raw) => toViewEntry(raw, venuesRef.current.get(venueKey(raw.kind === 'prediction' ? 'prediction' : 'exchange', String(raw.exchange ?? '')))))
          .filter((e) => e.id && e.title && matchesVenue(e, key));
        setState({ key, entries, loading: false });
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setState({ key, loading: false });
      });
    return () => ctrl.abort();
  }, [key]);
  return state.key === key ? state : { loading: false };
}
