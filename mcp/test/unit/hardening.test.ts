import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { marketsCacheKey, marketsCacheFile, ensureMarketsLoaded } from '../../ts/markets.js';
import { MARKET_TYPES } from '../../ts/tools/common.js';
import { sanitizeUpstreamError, toErrorEnvelope, HOSTED_ERROR_MESSAGE_MAX } from '../../ts/errors.js';
import { runInRequestScope } from '../../ts/request-scope.js';

const here = path.dirname (fileURLToPath (import.meta.url));
const ccxtTypes = path.resolve (here, '..', '..', '..', 'ts', 'src', 'base', 'types.ts');

test ('marketType enum mirrors ccxt\'s MarketType', { 'skip': !fs.existsSync (ccxtTypes) ? 'outside the ccxt monorepo' : false }, () => {
    const source = fs.readFileSync (ccxtTypes).toString ();
    const match = source.match (/export type MarketType = ([^;]+);/);
    assert.ok (match, 'MarketType not found in ts/src/base/types.ts');
    const values = [ ...match[1].matchAll (/'([a-z]+)'/g) ].map ((m) => m[1]);
    assert.deepEqual ([ ...MARKET_TYPES ].sort (), values.sort ());
});

test ('markets cache key: built only from a validated id, a fixed namespace and a known or hashed type', () => {
    assert.equal (marketsCacheKey ('kraken', 'crypto', undefined), 'kraken-crypto-default');
    assert.equal (marketsCacheKey ('okx', 'crypto', 'swap'), 'okx-crypto-swap');
    // the prototype's traversal: reduced to a hash, no character of the input survives
    const traversal = marketsCacheKey ('kraken', 'crypto', '../../x');
    assert.match (traversal, /^kraken-crypto-type[0-9a-f]{16}$/);
    // a config-defined, exchange-specific defaultType still gets its own stable entry
    assert.equal (marketsCacheKey ('binance', 'crypto', 'linear'), marketsCacheKey ('binance', 'crypto', 'linear'));
    assert.notEqual (marketsCacheKey ('binance', 'crypto', 'linear'), marketsCacheKey ('binance', 'crypto', 'inverse'));
    for (const id of [ '../x', 'Kraken', 'kra/ken', '', 'a'.repeat (65), 42 ]) {
        assert.throws (() => marketsCacheKey (id as any, 'crypto', undefined), /exchange id/, String (id));
    }
    assert.throws (() => marketsCacheKey ('kraken', '../x' as any, undefined), /namespace/);
});

test ('markets cache path guard: rejects anything that would leave <cache>/<kind>/ on its own', () => {
    const root = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-cache-'));
    assert.equal (marketsCacheFile (root, 'markets', 'kraken-crypto-default'), path.join (root, 'markets', 'kraken-crypto-default.json'));
    for (const key of [ '../../x', 'kraken-crypto-../../x', '../markets/kraken', 'a/b', '/etc/passwd' ]) {
        assert.throws (() => marketsCacheFile (root, 'markets', key), /escapes the cache directory/, key);
    }
});

test ('markets disk cache: a traversal-shaped defaultType writes nothing outside the cache directory', async () => {
    const home = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-home-'));
    const previous = process.env['XDG_CACHE_HOME'];
    process.env['XDG_CACHE_HOME'] = path.join (home, 'cache');
    try {
        const exchange: any = {
            'id': 'fakex',
            'options': { 'defaultType': '../../../victim/dropped' },
            'has': {},
            'markets': undefined,
            'currencies': {},
            loadMarkets: async function () {
                this.markets = { 'BTC/USDT': { 'symbol': 'BTC/USDT' } };
                return this.markets;
            },
            setMarkets (markets: any) {
                this.markets = markets;
            },
        };
        await ensureMarketsLoaded (exchange, 86400000);
        assert.ok (exchange.markets['BTC/USDT']);
        assert.equal (fs.existsSync (path.join (home, 'victim')), false, 'nothing escaped the cache directory');
        const written = fs.readdirSync (path.join (home, 'cache', 'ccxt-mcp', 'markets'));
        assert.equal (written.length, 1);
        assert.match (written[0], /^fakex-crypto-type[0-9a-f]{16}\.json$/);
    } finally {
        if (previous === undefined) {
            delete process.env['XDG_CACHE_HOME'];
        } else {
            process.env['XDG_CACHE_HOME'] = previous;
        }
    }
});

const UPSTREAM = 'kraken GET https://api.kraken.com/0/public/Ticker?pair=XBTUSD&apiKey=x 403 Forbidden <html><head><title>Attention Required</title></head><body>' + 'x'.repeat (5000) + '</body></html>';

test ('sanitizeUpstreamError: stdio keeps the full (redacted) message, hosted strips URLs and bodies and truncates', () => {
    const error = new Error (UPSTREAM);
    assert.equal (sanitizeUpstreamError (error, { 'hosted': false }), UPSTREAM);
    const hosted = sanitizeUpstreamError (error, { 'hosted': true });
    assert.equal (hosted, 'kraken GET [url] 403 Forbidden [response body removed]');
    const json = sanitizeUpstreamError (new Error ('binance {"code":-1121,"msg":"Invalid symbol."}'), { 'hosted': true });
    assert.equal (json, 'binance [response body removed]');
    const long = sanitizeUpstreamError (new Error ('y'.repeat (2000)), { 'hosted': true });
    assert.equal (long.length, HOSTED_ERROR_MESSAGE_MAX);
    assert.ok (long.endsWith ('…'));
    assert.equal (sanitizeUpstreamError (new Error ('kraken does not have market symbol FOO/BAR'), { 'hosted': true }), 'kraken does not have market symbol FOO/BAR');
});

test ('toErrorEnvelope: the hosted flag comes from the context or the request scope', () => {
    const error = new Error (UPSTREAM);
    assert.equal (toErrorEnvelope (error, {}).error?.message, UPSTREAM);
    assert.equal (toErrorEnvelope (error, { 'hosted': true }).error?.message, 'kraken GET [url] 403 Forbidden [response body removed]');
    const scoped = runInRequestScope ({ 'request': undefined, 'hosted': true, 'authInfo': undefined }, () => toErrorEnvelope (error, {}));
    assert.equal (scoped.error?.message, 'kraken GET [url] 403 Forbidden [response body removed]');
});
