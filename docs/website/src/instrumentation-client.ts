// Runs before the app's frontend code (Next.js instrumentation-client). Initialises PostHog
// once, as PostHog's Next.js guide shows, and adds the few delegated click events the docs
// need. With no project token at build time it does nothing: posthog-js is loaded with a
// dynamic import inside the enabled branch, so a build without a token ships none of it.
import { analyticsEnabled, POSTHOG_TOKEN, INGEST_PATH, setAnalyticsClient, track, currentPage } from '@/lib/analytics';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

if (analyticsEnabled) {
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(POSTHOG_TOKEN, {
      // through the docs' own origin: next.config.mjs rewrites this path to the EU ingestion host
      api_host: basePath + INGEST_PATH,
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || 'https://eu.posthog.com',
      // PostHog's current recommended settings: pageviews and pageleaves on client-side
      // navigation (history changes) and autocapture
      defaults: '2026-08-30',
      // Privacy: no cookies or browser storage (a server-side hash counts unique visitors), no
      // person profiles, Do Not Track honoured. Cookieless tracking must be enabled in the
      // PostHog project (Settings > Project > Web analytics), or PostHog discards these events.
      cookieless_mode: 'always',
      person_profiles: 'never',
      respect_dnt: true,
      capture_performance: { web_vitals: true },
      disable_session_recording: true,
    });
    setAnalyticsClient(posthog);
  });

  const OUTBOUND: [RegExp, string][] = [
    [/^https?:\/\/(www\.)?github\.com\//i, 'github'],
    [/^https?:\/\/(www\.)?discord\.(gg|com)\//i, 'discord'],
    [/^https?:\/\/t\.me\//i, 'telegram'],
  ];

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null;
      if (!target || typeof target.closest !== 'function') return;
      // explicit markers: homepage calls to action and the install copy buttons
      const cta = target.closest('[data-docs-cta]');
      if (cta) track('docs_cta_clicked', { cta: cta.getAttribute('data-docs-cta') ?? 'unknown' });
      const copy = target.closest('[data-docs-copy]');
      if (copy) {
        track('docs_code_copied', { surface: copy.getAttribute('data-docs-copy') ?? 'unknown', page: currentPage() });
      } else {
        // Fumadocs code blocks: the copy button is the only button inside the block's <figure>
        const button = target.closest('button');
        if (button && button.closest('figure')) track('docs_code_copied', { surface: 'code_block', page: currentPage() });
      }
      const link = target.closest('a[href]') as HTMLAnchorElement | null;
      if (link) {
        const match = OUTBOUND.find(([pattern]) => pattern.test(link.href));
        if (match) track('docs_outbound_clicked', { destination: match[1], page: currentPage() });
      }
    },
    { capture: true, passive: true },
  );
}
