// Build-time fallback for /docs/changelog-exchanges and its feeds (npm "prebuild" step).
//
// Downloads the exchange-changelogs feed files (latest.json, health.json and, best effort, the
// per-venue <kind>/<id>.json files) into src/data/changelog-snapshot/. At runtime
// src/lib/exchange-changelogs.ts reads them as the last-good copy when the live fetch fails, so a
// fresh deploy never renders (and caches) an empty page.
//
// Never fails the build: any error is logged and the script exits 0. Nothing is written unless
// latest.json and health.json both downloaded and look valid (a previous snapshot is then left
// as it was). Files are written to a temp dir first and swapped in at the end.
//
// Source (same variables as the runtime loader):
//   EXCHANGE_CHANGELOGS_DIR   copy from this local feed dir instead of downloading
//   EXCHANGE_CHANGELOGS_URL   base URL of the feed (default: changelog-data branch on GitHub)
//   EXCHANGE_CHANGELOGS_SNAPSHOT=0  skip entirely
//
// Usage: node scripts/fetch-changelog-snapshot.mjs

import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname (fileURLToPath (import.meta.url));
const OUT = join (__dirname, '..', 'src', 'data', 'changelog-snapshot');
const DEFAULT_URL = 'https://raw.githubusercontent.com/ccxt/ccxt/changelog-data/feed';
const FILE_TIMEOUT_MS = 15_000;
const TOTAL_BUDGET_MS = 120_000;
const CONCURRENCY = 8;
const MAX_FILE_BYTES = 16 * 1024 * 1024;
const ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const KINDS = new Set (['exchange', 'prediction']);

const log = (msg) => console.log (`[changelog-snapshot] ${msg}`);
const started = Date.now ();
const budgetLeft = () => TOTAL_BUDGET_MS - (Date.now () - started);

async function readRemote (base, rel) {
    const res = await fetch (`${base}/${rel}`, { signal: AbortSignal.timeout (Math.max (1000, Math.min (FILE_TIMEOUT_MS, budgetLeft ()))) });
    if (!res.ok) {
        throw new Error (`HTTP ${res.status}`);
    }
    const text = await res.text ();
    if (text.length > MAX_FILE_BYTES) {
        throw new Error ('file too large');
    }
    return text;
}

async function readLocal (dir, rel) {
    return await readFile (join (dir, rel), 'utf8');
}

// Parse and check the envelope; returns the parsed object or throws.
function check (rel, text, shape) {
    const data = JSON.parse (text);
    if (typeof data !== 'object' || data === null || typeof data.schemaVersion !== 'number' || typeof data.generatedAt !== 'string') {
        throw new Error ('not a feed file');
    }
    if (shape === 'latest' && !(Array.isArray (data.venues) && data.venues.length > 0 && Array.isArray (data.entries))) {
        throw new Error ('latest.json lists no venues');
    }
    if (shape === 'health' && !(Array.isArray (data.sources) && data.sources.length > 0)) {
        throw new Error ('health.json lists no sources');
    }
    if (shape === 'venue' && !(typeof data.venue === 'object' && data.venue !== null && Array.isArray (data.entries))) {
        throw new Error (`${rel} is not a venue feed`);
    }
    return data;
}

async function pool (items, worker) {
    let next = 0;
    const run = async () => {
        while (next < items.length && budgetLeft () > 0) {
            const item = items[next++];
            await worker (item);
        }
    };
    await Promise.all (Array.from ({ 'length': Math.min (CONCURRENCY, items.length) }, run));
}

async function main () {
    if (process.env.EXCHANGE_CHANGELOGS_SNAPSHOT === '0') {
        log ('skipped (EXCHANGE_CHANGELOGS_SNAPSHOT=0)');
        return;
    }
    const dir = process.env.EXCHANGE_CHANGELOGS_DIR;
    const base = (process.env.EXCHANGE_CHANGELOGS_URL || DEFAULT_URL).replace (/\/$/, '');
    const read = dir ? (rel) => readLocal (dir, rel) : (rel) => readRemote (base, rel);
    log (`source: ${dir ? dir : base}`);

    const files = new Map ();
    let latest;
    try {
        const [ latestText, healthText ] = await Promise.all ([ read ('latest.json'), read ('health.json') ]);
        latest = check ('latest.json', latestText, 'latest');
        check ('health.json', healthText, 'health');
        files.set ('latest.json', latestText);
        files.set ('health.json', healthText);
    } catch (err) {
        log (`latest.json/health.json unavailable (${err instanceof Error ? err.message : String (err)}); keeping the previous snapshot, if any`);
        return;
    }

    // per-venue files: optional, each one best effort
    const venues = latest.venues.filter ((v) => v && KINDS.has (v.kind) && typeof v.id === 'string' && ID_RE.test (v.id) && !v.unmonitored);
    let failed = 0;
    await pool (venues, async (v) => {
        const rel = `${v.kind}/${v.id}.json`;
        try {
            const text = await read (rel);
            check (rel, text, 'venue');
            files.set (rel, text);
        } catch {
            failed++;
        }
    });

    const tmp = `${OUT}.tmp-${process.pid}`;
    await rm (tmp, { 'recursive': true, 'force': true });
    for (const [ rel, text ] of files) {
        const target = join (tmp, rel);
        await mkdir (dirname (target), { 'recursive': true });
        await writeFile (target, text);
    }
    await writeFile (join (tmp, 'snapshot.json'), JSON.stringify ({ 'fetchedAt': new Date ().toISOString (), 'source': dir ? 'local' : base, 'generatedAt': latest.generatedAt }, null, 2) + '\n');
    await rm (OUT, { 'recursive': true, 'force': true });
    await rename (tmp, OUT);
    log (`wrote ${files.size} files (feed generated ${latest.generatedAt}; ${failed} of ${venues.length} venue files unavailable) to ${OUT}`);
}

// hard stop: a stuck socket must never hold up the build
setTimeout (() => {
    log ('time budget exceeded, continuing without writing');
    process.exit (0);
}, TOTAL_BUDGET_MS + 30_000).unref ();

main ().catch ((err) => {
    log (`failed, continuing without a snapshot: ${err instanceof Error ? err.message : String (err)}`);
}).finally (() => {
    process.exitCode = 0;
});
