// Web and product analytics for docs.ccxt.com, sent to PostHog (EU cloud).
//
// Off unless the build sets NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: local dev, forks and CI make no
// analytics requests and do not even load posthog-js. Cookieless (no cookies, no
// local/session storage, no person profiles), so no consent banner is needed; Do Not Track is
// respected. Setup and the list of events: README.md, "Analytics".
import type { PostHog } from 'posthog-js';

export const POSTHOG_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? '';
export const analyticsEnabled = POSTHOG_TOKEN.length > 0;

// The docs' own path that next.config.mjs rewrites to PostHog (ad blockers drop requests to
// *.posthog.com). Kept in step with next.config.mjs and the matcher in src/proxy.ts.
export const INGEST_PATH = '/cx-relay';

// The only events this site sends by hand. Autocapture, $pageview, $pageleave and
// $web_vitals come from posthog-js itself.
export type DocsEvent =
  | 'docs_code_copied' // { surface: 'code_block' | 'install', page }
  | 'docs_search' // { query_length, results, locale }: never the query text
  | 'docs_language_changed' // { from, to }
  | 'docs_cta_clicked' // { cta }
  | 'docs_outbound_clicked' // { destination: 'github' | 'discord' | 'telegram', page }
  | 'docs_ai_opened' // { page }
  | 'docs_ai_question_sent'; // { length, page }: never the question text

// set by src/instrumentation-client.ts once posthog-js is loaded and initialised
let client: PostHog | undefined;

export function setAnalyticsClient(instance: PostHog): void {
  client = instance;
}

export function track(event: DocsEvent, properties: Record<string, string | number | boolean> = {}): void {
  client?.capture(event, properties);
}

export function currentPage(): string {
  return typeof location === 'undefined' ? '' : location.pathname;
}
