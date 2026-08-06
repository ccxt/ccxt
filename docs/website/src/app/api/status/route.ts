import { readExchangeStatus } from '@/lib/exchange-status';

// Exchange availability feed for the /docs/status page and external consumers.
// The underlying file is rewritten by the monitor sub-process every ~30 minutes;
// force-dynamic re-reads it per request (an fs read — cheap) instead of letting
// Next cache the first snapshot forever.
export const dynamic = 'force-dynamic';

export async function GET() {
  const entries = await readExchangeStatus();
  return Response.json(entries, {
    // let nginx/browsers absorb bursts without going stale for a meaningful
    // fraction of the 30-minute refresh interval
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}
