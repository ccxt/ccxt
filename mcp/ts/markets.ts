import fs from 'fs';
import path from 'path';
import { cacheDirectory } from './config.js';
import { log } from './logging.js';

// Markets disk cache, ported from cli/ts/helpers.ts handleMarketsLoading but with an
// in-flight promise map so concurrent tool calls on a cold exchange share one load.
// The cache directory is ccxt-mcp's own (not shared with ccxt-cli) so the two
// independently-versioned packages can never skew each other's market schema.

const inFlight = new Map<string, Promise<void>> ();

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
    const key = exchange.id + '|' + (forceRefresh ? 'refresh' : 'load');
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
    const marketsPath = path.join (cachePath, 'markets', exchange.id + '.json');
    const currenciesPath = path.join (cachePath, 'currencies', exchange.id + '.json');
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
    await exchange.loadMarkets (forceRefresh);
    try {
        await writeFileEnsuringDir (marketsPath, jsonStringify (exchange.markets));
        await writeFileEnsuringDir (currenciesPath, jsonStringify (exchange.currencies));
    } catch (e: any) {
        log ('warning', 'markets cache write failed for ' + exchange.id + ': ' + e.message);
    }
}
