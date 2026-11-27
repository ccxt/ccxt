import { test } from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { CircuitBreaker, trippingKind } from '../src/guard/breaker.js';
import { ResponseCache, stableKey } from '../src/guard/cache.js';
import { UpstreamGuard } from '../src/guard/upstream.js';
import { ohlcvTtlMs } from '../src/guard/exchanges.js';
import { clientIp, jsonDepthExceeds, RateLimiter, identifyClient, requestCost } from '../src/limits.js';
import { CidrSet, normaliseIp } from '../src/ip.js';
import { loadConfig, parseTrustedProxy, canonicalUrl, DEFAULT_EXCHANGES } from '../src/config.js';
import { runInCallScope, summariseCache, type CallScope } from '../src/scope.js';
import { OPENAI_CONNECTOR_RANGES } from '../src/data/openai-egress.js';
import { RateLimitExceeded, DDoSProtection, ExchangeNotAvailable, BadSymbol } from './helpers/venue.js';

const headers = (values: Record<string, string>) => ({ 'get': (name: string) => values[name] });

test ('unit: breaker trips on throttling classes and statuses, not on ordinary errors', () => {
    assert.equal (trippingKind (new RateLimitExceeded ('x')), 'counted');
    assert.equal (trippingKind (new DDoSProtection ('x')), 'counted');
    assert.equal (trippingKind (new ExchangeNotAvailable ('x')), 'counted');
    assert.equal (trippingKind (new Error ('binance GET https://x 418 I\'m a teapot')), 'immediate');
    assert.equal (trippingKind (new Error ('kraken GET https://x 451 Unavailable For Legal Reasons')), 'immediate');
    assert.equal (trippingKind (new Error ('okx GET https://x 429 Too Many Requests')), 'counted');
    assert.equal (trippingKind (new BadSymbol ('nope')), undefined);
    assert.equal (trippingKind (new Error ('price 4290.5 is out of range')), undefined);
});

test ('unit: breaker opens at the threshold within the window, half-opens after the cooldown, backs off on a failed probe', () => {
    let now = 0;
    const breaker = new CircuitBreaker ({ 'threshold': 3, 'windowMs': 1000, 'cooldownMs': 500, 'maxCooldownMs': 1500, 'now': () => now });
    breaker.onFailure (new RateLimitExceeded ('a'));
    now = 2000; // outside the window: the first failure no longer counts
    breaker.onFailure (new RateLimitExceeded ('b'));
    breaker.onFailure (new RateLimitExceeded ('c'));
    assert.equal (breaker.state (), 'closed');
    breaker.onFailure (new RateLimitExceeded ('d'));
    assert.equal (breaker.state (), 'open');
    assert.equal (breaker.tryAcquire (), false);
    now += 500;
    assert.equal (breaker.state (), 'half-open');
    assert.equal (breaker.tryAcquire (), 'probe');
    assert.equal (breaker.tryAcquire (), false, 'one probe at a time');
    breaker.onFailure (new RateLimitExceeded ('probe'));
    assert.equal (breaker.state (), 'open');
    assert.equal (breaker.retryAfterSeconds (), 1); // 1000 ms cooldown now
    now += 999;
    assert.equal (breaker.state (), 'open');
    now += 1;
    assert.equal (breaker.tryAcquire (), 'probe');
    breaker.release (); // the probe was cancelled before it ran
    assert.equal (breaker.tryAcquire (), 'probe');
    breaker.onSuccess ();
    assert.equal (breaker.state (), 'closed');
    // a 418 opens at once
    breaker.onFailure (new Error ('x 418 teapot'));
    assert.equal (breaker.state (), 'open');
});

test ('unit: response cache expires, evicts least recently used, and hands out copies', () => {
    let now = 0;
    const cache = new ResponseCache (2, () => now);
    cache.set ('a', { 'v': 1 }, 100);
    cache.set ('b', { 'v': 2 }, 100);
    const copy = cache.get ('a')!.value;
    copy.v = 99;
    assert.equal (cache.get ('a')!.value.v, 1, 'mutating a result does not touch the cache');
    cache.set ('c', { 'v': 3 }, 100); // evicts b (a was used more recently)
    assert.equal (cache.get ('b'), undefined);
    now = 100;
    assert.equal (cache.get ('a'), undefined, 'expired');
    cache.set ('zero', 1, 0);
    assert.equal (cache.get ('zero'), undefined, 'a zero TTL is never stored');
    assert.equal (stableKey ({ 'b': 1, 'a': [ 2, { 'd': 1, 'c': undefined } ] }), stableKey ({ 'a': [ 2, { 'c': null, 'd': 1 } ], 'b': 1 }));
});

test ('unit: upstream guard coalesces, caches, and drops queued work whose caller left', async () => {
    const guard = new UpstreamGuard ({ 'maxConcurrentPerExchange': 1, 'maxQueuedPerExchange': 2, 'maxUpstreamPerCall': 5, 'cacheMaxEntries': 10, 'breaker': { 'threshold': 3, 'windowMs': 1000, 'cooldownMs': 1000, 'maxCooldownMs': 1000 } });
    guard.register ('x', 100);
    let calls = 0;
    let release: () => void = () => {};
    const gate = new Promise<void> ((resolve) => {
        release = resolve;
    });
    const task = async () => {
        calls += 1;
        await gate;
        return { 'n': calls };
    };
    const scope = (controller: AbortController): CallScope => ({ 'requestId': 'r', 'clientKey': 'k', 'deadlineAt': Date.now () + 60000, 'signal': controller.signal, 'upstreamCalls': 0, 'cache': new Set () });
    const one = new AbortController ();
    const a = runInCallScope (scope (one), () => guard.call ('x', 'k1', 1000, task));
    const b = runInCallScope (scope (new AbortController ()), () => guard.call ('x', 'k1', 1000, task));
    const leaving = new AbortController ();
    const leavingScope = scope (leaving);
    const queued = runInCallScope (leavingScope, () => guard.call ('x', 'k2', 1000, task)).catch ((error) => error);
    assert.deepEqual (guard.queueDepth ('x'), { 'active': 1, 'waiting': 1 });
    leaving.abort ();
    const error = await queued;
    assert.equal (error.code, 'CANCELLED');
    assert.deepEqual (guard.queueDepth ('x'), { 'active': 1, 'waiting': 0 });
    release ();
    assert.deepEqual (await a, { 'n': 1 });
    assert.deepEqual (await b, { 'n': 1 });
    assert.equal (calls, 1, 'k2 never ran');
    const hitScope = scope (new AbortController ());
    assert.deepEqual (await runInCallScope (hitScope, () => guard.call ('x', 'k1', 1000, task)), { 'n': 1 });
    assert.deepEqual ([ ...hitScope.cache ], [ 'hit' ]);
    assert.deepEqual (guard.stats, { 'hits': 1, 'misses': 2, 'coalesced': 1, 'rejected': 0 });
    assert.equal (summariseCache (new Set ([ 'hit', 'miss' ])), 'miss');
    assert.equal (summariseCache (new Set ([ 'hit', 'coalesced' ])), 'coalesced');
    assert.equal (summariseCache (new Set ()), undefined);
});

test ('unit: OHLCV cache lifetime is a tenth of the candle, between 2 s and 60 s', () => {
    const exchange = { 'parseTimeframe': (frame: string) => ({ '1m': 60, '5m': 300, '1h': 3600, '1d': 86400 } as any)[frame] };
    assert.equal (ohlcvTtlMs (exchange, '1m'), 6000);
    assert.equal (ohlcvTtlMs (exchange, '5m'), 30000);
    assert.equal (ohlcvTtlMs (exchange, '1h'), 60000);
    assert.equal (ohlcvTtlMs (exchange, '1d'), 60000);
    assert.equal (ohlcvTtlMs ({}, '1m'), 2000);
});

test ('unit: client IP comes only from a header the trusted proxy wrote', () => {
    const real = { 'kind': 'x-real-ip' } as const;
    // a public peer is never a proxy: its headers are ignored
    assert.equal (clientIp (real, '198.51.100.1', headers ({ 'x-real-ip': '1.2.3.4' })), '198.51.100.1');
    assert.equal (clientIp (real, '127.0.0.1', headers ({ 'x-real-ip': '1.2.3.4' })), '1.2.3.4');
    assert.equal (clientIp (real, '::ffff:172.18.0.1', headers ({ 'x-real-ip': '1.2.3.4' })), '1.2.3.4');
    assert.equal (clientIp (real, '127.0.0.1', headers ({ 'x-real-ip': 'not-an-ip' })), '127.0.0.1');
    // hop counting from the right; the client-supplied leftmost entry is never used
    const hops = { 'kind': 'hops', 'hops': 1 } as const;
    assert.equal (clientIp (hops, '10.0.0.2', headers ({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9' })), '203.0.113.9');
    assert.equal (clientIp ({ 'kind': 'hops', 'hops': 2 }, '10.0.0.2', headers ({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9, 10.0.0.9' })), '203.0.113.9');
    assert.equal (clientIp (hops, '10.0.0.2', headers ({})), '10.0.0.2');
    assert.equal (clientIp ({ 'kind': 'none' }, '127.0.0.1', headers ({ 'x-real-ip': '1.2.3.4' })), '127.0.0.1');
    assert.equal (normaliseIp ('[::1]'), '::1');
    assert.equal (normaliseIp ('garbage'), undefined);
});

test ('unit: JSON depth check is iterative and exact', () => {
    let value: any = 1;
    for (let i = 0; i < 32; i++) {
        value = [ value ];
    }
    assert.equal (jsonDepthExceeds (value, 32), false);
    assert.equal (jsonDepthExceeds ([ value ], 32), true);
    let deep: any = 0;
    for (let i = 0; i < 200000; i++) {
        deep = { 'a': deep };
    }
    assert.equal (jsonDepthExceeds (deep, 32), true);
});

test ('unit: token buckets refill over time and are bounded in number', () => {
    let now = 0;
    const limiter = new RateLimiter (3, () => now);
    const budget = { 'perMinute': 60, 'burst': 2 };
    assert.equal (limiter.take ('a', budget, 1), undefined);
    assert.equal (limiter.take ('a', budget, 1), undefined);
    assert.equal (limiter.take ('a', budget, 1), 1);
    now += 1000;
    assert.equal (limiter.take ('a', budget, 1), undefined);
    for (const key of [ 'b', 'c', 'd', 'e' ]) {
        limiter.take (key, budget, 1);
    }
    assert.equal (limiter.size, 3);
    assert.equal (requestCost ('tools/call'), 1);
    assert.ok (requestCost ('tools/list') < 1);
    assert.ok (requestCost ('notifications/initialized') < requestCost ('tools/list'));
});

test ('unit: client identity — openai/subject only counts from OpenAI addresses', () => {
    const ranges = { 'anthropic': new CidrSet ([ '160.79.104.0/21' ]), 'openai': new CidrSet ([ '100.31.168.162/32' ]) };
    assert.deepEqual (identifyClient ('203.0.113.1', 'u1', ranges), { 'key': 'ip:203.0.113.1', 'budget': 'client' });
    assert.deepEqual (identifyClient ('100.31.168.162', 'u1', ranges), { 'key': 'openai-subject:u1', 'budget': 'client', 'host': 'openai' });
    assert.deepEqual (identifyClient ('100.31.168.162', undefined, ranges), { 'key': 'ip:100.31.168.162', 'budget': 'host', 'host': 'openai' });
    assert.deepEqual (identifyClient ('100.31.168.162', 'x'.repeat (500), ranges), { 'key': 'ip:100.31.168.162', 'budget': 'host', 'host': 'openai' });
    assert.deepEqual (identifyClient ('160.79.111.255', undefined, ranges), { 'key': 'ip:160.79.111.255', 'budget': 'host', 'host': 'anthropic' });
    assert.equal (identifyClient ('160.79.112.0', undefined, ranges).budget, 'client');
});

test ('unit: the embedded OpenAI range snapshot parses and is non-trivial', () => {
    const set = new CidrSet (OPENAI_CONNECTOR_RANGES);
    assert.ok (set.size > 100);
    assert.equal (set.has ('100.31.168.162'), true);
    assert.equal (set.has ('8.8.8.8'), false);
});

test ('unit: config defaults are safe and every override is validated', () => {
    const config = loadConfig ({}, '1.2.3');
    assert.equal (canonicalUrl (config), 'https://mcp.ccxt.com/mcp');
    assert.deepEqual (config.allowedHosts, [ 'mcp.ccxt.com', 'localhost', '127.0.0.1', '[::1]' ]);
    assert.deepEqual (config.corsOrigins, []);
    assert.deepEqual (config.trustedProxy, { 'kind': 'none' });
    assert.equal (config.host, '127.0.0.1');
    assert.equal (config.maxBodyBytes, 262144);
    assert.equal (config.maxJsonDepth, 32);
    assert.equal (config.requestDeadlineMs, 20000);
    assert.deepEqual (config.exchanges, DEFAULT_EXCHANGES);
    assert.equal (config.uiWhenUnknown, 'attach');
    assert.equal (config.openaiAppsChallenge, undefined);
    assert.deepEqual (parseTrustedProxy ('nginx-x-real-ip'), { 'kind': 'x-real-ip' });
    assert.deepEqual (parseTrustedProxy ('2'), { 'kind': 'hops', 'hops': 2 });
    assert.throws (() => parseTrustedProxy ('leftmost'));
    assert.throws (() => loadConfig ({ 'PORT': 'abc' }));
    assert.throws (() => loadConfig ({ 'UI_WHEN_UNKNOWN': 'maybe' }));
    assert.throws (() => loadConfig ({ 'MCP_PATH': 'mcp' }));
    assert.throws (() => loadConfig ({ 'PUBLIC_BASE_URL': 'not a url' }));
    const custom = loadConfig ({ 'EXCHANGES': ' kraken , okx ', 'PUBLIC_BASE_URL': 'https://mcp.example.org/', 'MCP_PATH': '/x/mcp', 'MARKETS_REFRESH_MINUTES': '30' });
    assert.deepEqual (custom.exchanges, [ 'kraken', 'okx' ]);
    assert.equal (canonicalUrl (custom), 'https://mcp.example.org/x/mcp');
    assert.equal (custom.allowedHosts[0], 'mcp.example.org');
    assert.equal (custom.marketsRefreshMs, 1800000);
});

test ('unit: the reachability script checks the same default allowlist the server serves', () => {
    const script = fs.readFileSync (new URL ('../scripts/check-exchanges.mjs', import.meta.url), 'utf8');
    const match = /const DEFAULT_EXCHANGES = (\[[^\]]*\]);/.exec (script);
    assert.ok (match !== null);
    assert.deepEqual (JSON.parse (match![1].replace (/'/g, '"')), DEFAULT_EXCHANGES);
});
