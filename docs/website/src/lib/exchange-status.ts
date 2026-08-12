import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Single source of truth for the exchange-status feed: both /api/status and the
// /docs/status page read through here, so they can never disagree.
//
// A separate monitor sub-process rewrites the JSON file every ~30 minutes. The file
// lives OUTSIDE the build (volume-mounted / written at runtime), so it's read with fs
// on every request rather than imported. STATUS_FILE overrides the location; the
// default resolves next to the server cwd (/app/data/... in the Docker standalone).
// Until the monitor writes its first snapshot, the committed seed data is served.

export type StatusEntry = {
  exchange: string;
  ok: boolean;
  latencyMs: number;
  checkedAt: string; // ISO 8601
  method?: string; // unified method used to probe (fetchStatus, fetchTime, ...)
  logo?: string; // exchange logo URL (from ccxt's urls.logo)
  error?: string;
};

// Shared with the writer side (lib/health-monitor.ts, started from instrumentation.ts).
export const STATUS_FILE = process.env.STATUS_FILE || path.join(process.cwd(), 'data', 'exchange-status.json');

function isStatusEntry(value: unknown): value is StatusEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.exchange === 'string'
    && typeof entry.ok === 'boolean'
    && typeof entry.latencyMs === 'number'
    && typeof entry.checkedAt === 'string'
    && (entry.method === undefined || typeof entry.method === 'string')
    && (entry.logo === undefined || typeof entry.logo === 'string')
    && (entry.error === undefined || typeof entry.error === 'string')
  );
}

export async function readExchangeStatus(): Promise<StatusEntry[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(STATUS_FILE, 'utf8'));
    // The monitor may rewrite the file mid-read or crash mid-write; a malformed or
    // partial snapshot must degrade to the previous known-good fallback, never throw
    // into the page/API.
    if (Array.isArray(parsed) && parsed.every(isStatusEntry)) return parsed;
  } catch {
    // missing file (monitor not started yet) or invalid JSON — fall through to seed
  }
  return [];
}
