import fs from 'fs';
import path from 'path';
import { cacheDirectory } from './config.js';
import { log } from './logging.js';

// Markets disk cache, ported from cli/ts/helpers.ts handleMarketsLoading but with an
// in-flight promise map so concurrent tool calls on a cold exchange share one load.
// The cache directory is ccxt-mcp's own (not shared with ccxt-cli) so the two
// independently-versioned packages can never skew each other's market schema.

const inFlight = new Map<string, Promise<void>> ();

// Bound how many COLD loadMarkets run at once. Each cold load resolves a distinct exchange
// hostname; Node runs getaddrinfo on the libuv threadpool (default 4), so a burst of dozens of
// concurrent loads starves DNS and surfaces as getaddrinfo ENOTFOUND — a LOCAL failure the agent
// would otherwise be told is the exchange being down. Bound = the threadpool size (not arbitrary).
const LOAD_LIMIT = Math.max (2, Number (process.env['UV_THREADPOOL_SIZE']) || 4);
let loadActive = 0;
const loadWaiters: Array<() => void> = [];

// runs fn while holding one of LOAD_LIMIT slots, queueing if all are taken (exported for tests)
export async function withMarketLoadLimit<T> (fn: () => Promise<T>): Promise<T> {
    if (loadActive < LOAD_LIMIT) {
        loadActive += 1;
    } else {
        await new Promise<void> ((resolve) => loadWaiters.push (resolve));
    }
    try {
        return await fn ();
    } finally {
        const next = loadWaiters.shift ();
        if (next !== undefined) {
            next (); // hand the slot straight to the next waiter (loadActive unchanged)
        } else {
            loadActive -= 1;
        }
    }
}

export function marketLoadLimit (): number {
    return LOAD_LIMIT;
}

function jsonStringify (obj: any): string {
    return JSON.stringify (obj, (k, v) => ((v === undefined) ? null : v));
}

async function writeFileEnsuringDir (filePath: string, content: string): Promise<void> {
    await fs.promises.mkdir (path.dirname (filePath), { 'recursive': true });
    await fs.promises.writeFile (filePath, content);
}

export async function ensureMarketsLoaded (exchange: any, refreshTimeout: number, forceRefresh = false): Promise<void> {
    if (exchange.markets !== undefined && Object.keys (exchange.markets).length > 0 && !forceRefresh) {
        return;
    }
    const marketType = exchange?.options?.['defaultType'] ?? 'default';
    const namespace = exchange?.has?.['fetchEvents'] ? 'prediction' : 'crypto';
    const key = exchange.id + '|' + namespace + '|' + marketType + '|' + (forceRefresh ? 'refresh' : 'load');
    const existing = inFlight.get (key);
    if (existing !== undefined) {
        return existing;
    }
    const promise = loadMarketsWithCache (exchange, refreshTimeout, forceRefresh).finally (() => {
        inFlight.delete (key);
    });
    inFlight.set (key, promise);
    return promise;
}

async function loadMarketsWithCache (exchange: any, refreshTimeout: number, forceRefresh: boolean): Promise<void> {
    const cachePath = cacheDirectory ();
    const marketType = exchange?.options?.['defaultType'] ?? 'default';
    const namespace = exchange?.has?.['fetchEvents'] ? 'prediction' : 'crypto';
    const cacheKey = exchange.id + '-' + namespace + '-' + marketType;
    const marketsPath = path.join (cachePath, 'markets', cacheKey + '.json');
    const currenciesPath = path.join (cachePath, 'currencies', cacheKey + '.json');
    if (!forceRefresh && fs.existsSync (marketsPath)) {
        try {
            const stats = fs.statSync (marketsPath);
            const age = Date.now () - stats.mtime.getTime ();
            if (age <= refreshTimeout) {
                if (fs.existsSync (currenciesPath)) {
                    exchange.currencies = JSON.parse (fs.readFileSync (currenciesPath).toString ());
                }
                const markets = JSON.parse (fs.readFileSync (marketsPath).toString ());
                exchange.setMarkets (markets);
                return;
            }
        } catch (e: any) {
            log ('warning', 'markets cache read failed for ' + exchange.id + ', falling back to a live load: ' + e.message);
        }
    }
    // gate only the cold network+disk path (not the cache-hit fast path above)
    await withMarketLoadLimit (async () => {
        await exchange.loadMarkets (forceRefresh);
        try {
            await writeFileEnsuringDir (marketsPath, jsonStringify (exchange.markets));
            await writeFileEnsuringDir (currenciesPath, jsonStringify (exchange.currencies));
        } catch (e: any) {
            log ('warning', 'markets cache write failed for ' + exchange.id + ': ' + e.message);
        }
    });
}
