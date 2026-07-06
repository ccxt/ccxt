import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPinIcon } from 'lucide-react';
import { i18n } from '@/lib/i18n';
import { readExchangeStatus } from '@/lib/exchange-status';

// Where the health-monitor probes run from — latency numbers only make sense
// relative to this vantage point. Hardcoded: the monitor runs inside the docs
// server, so this changes only when the deployment moves hosts.
const PROBE_ORIGIN: { label: string; value: string }[] = [
  { label: 'ISP', value: 'Cloud FSN1' },
  { label: 'Services', value: 'Data Center/Transit' },
  { label: 'Country', value: 'Germany' },
  { label: 'State/Region', value: 'Sachsen' },
  { label: 'City', value: 'Falkenstein' },
];

// The status file is rewritten by the monitor sub-process every ~30 minutes —
// re-read it per request instead of caching the first render forever.
export const dynamic = 'force-dynamic';

// Render server-side in UTC so output doesn't depend on the build/server timezone.
// Hours and minutes only — the snapshot is at most ~30 minutes old, so the date is noise.
function formatCheckedAt(iso: string): string {
  return `${new Date(iso).toISOString().slice(11, 16)} UTC`;
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        ok
          ? 'inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400'
          : 'inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400'
      }
    >
      <span className={`size-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden />
      {ok ? 'Operational' : 'Down'}
    </span>
  );
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  const entries = await readExchangeStatus();
  // default locale keeps un-prefixed URLs (/docs/...); others get /<locale>/docs/...
  const prefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;
  return (
    <DocsPage toc={[]}>
      <DocsTitle>Exchange Status</DocsTitle>
      <DocsDescription>Availability and response latency of supported exchanges</DocsDescription>
      <DocsBody>
        <div className="not-prose mb-8 rounded-xl border bg-fd-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-fd-foreground">
            <MapPinIcon className="size-4 text-fd-muted-foreground" aria-hidden />
            Checks are performed from
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
            {PROBE_ORIGIN.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 sm:justify-start">
                <dt className="w-28 shrink-0 text-fd-muted-foreground">{label}</dt>
                <dd className="text-fd-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <table>
          <thead>
            <tr>
              <th aria-label="Logo" />
              <th>Exchange</th>
              <th>Status</th>
              <th>Method</th>
              <th>Latency</th>
              <th>Last checked</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.exchange}>
                <td>
                  {entry.logo ? (
                    // plain <img>, not the zoomable MDX wrapper — it's a tiny inline mark
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.logo}
                      alt={`${entry.exchange} logo`}
                      loading="lazy"
                      decoding="async"
                      width={85}
                      height={25}
                      // fixed 85x25 box; object-contain letterboxes the varying logo
                      // aspect ratios instead of stretching them
                      className="h-[25px] w-[85px] max-w-none object-contain"
                    />
                  ) : null}
                </td>
                <td>
                  <Link href={`${prefix}/docs/exchanges/${entry.exchange}`} className="font-medium">
                    {entry.exchange}
                  </Link>
                </td>
                <td>
                  <StatusBadge ok={entry.ok} />
                </td>
                <td>{entry.method ? <code>{entry.method}</code> : '—'}</td>
                <td className="font-bold">{entry.latencyMs} ms</td>
                <td>{formatCheckedAt(entry.checkedAt)}</td>
                <td>{entry.error ? <code>{entry.error}</code> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocsBody>
    </DocsPage>
  );
}

export const metadata: Metadata = {
  title: 'Exchange Status',
  description: 'Availability and response latency of supported exchanges',
};
