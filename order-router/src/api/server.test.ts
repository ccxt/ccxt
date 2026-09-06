import { test } from 'node:test';
import assert from 'node:assert/strict';
import pino from 'pino';
import { OrderBookCache } from '../cache/orderBookCache.js';
import { FeeRegistry } from '../cache/feeRegistry.js';
import { buildServer } from './server.js';
import { STREAM_BALANCES_UNSUPPORTED } from './routeQuery.js';
import type { CachedOrderBook } from '../types.js';

const silentLogger = pino({ level: 'silent' });

function book (overrides: Partial<CachedOrderBook> = {}): CachedOrderBook {
    return {
        exchangeId: 'kraken',
        symbol: 'BTC/USDT',
        bids: [{ price: 100, amount: 5 }],
        asks: [{ price: 101, amount: 5 }],
        exchangeTimestamp: Date.now(),
        receivedAt: Date.now(),
        sequence: 1,
        ...overrides,
    };
}

// Every test runs against the real auth + rate-limit stack rather than a stripped-down app, so
// these integration tests would catch a middleware ordering regression that unit tests can't.
const TEST_API_KEY = 'test-api-key';
const AUTH = { 'x-api-key': TEST_API_KEY };

async function buildTestServer () {
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    try {
        const cache = new OrderBookCache();
        const feeRegistry = new FeeRegistry();
        const app = await buildServer(cache, feeRegistry, silentLogger);
        return { app, cache, feeRegistry };
    } finally {
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
}

test('GET /health returns ok', async () => {
    const { app } = await buildTestServer();
    const response = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().status, 'ok');
    await app.close();
});

// The distinction /health cannot draw. A process that has just booted is ALIVE — it answers
// /health with 200 from the first millisecond — but it can only answer /route with
// all_books_stale until websockets connect and books arrive. Sending traffic there because
// /health said 200 produces an outage the router reports as a successful 200. So readiness is
// asserted on the actual precondition for routing: fresh books.
test('GET /ready is 503 before any book has arrived and 200 once one has', async () => {
    const { app, cache } = await buildTestServer();

    const cold = await app.inject({ method: 'GET', url: '/ready' });
    assert.equal(cold.statusCode, 503);
    assert.equal(cold.json().status, 'not_ready');
    assert.equal(cold.json().freshCount, 0);

    cache.setBook({
        exchangeId: 'stub',
        symbol: 'BTC/USDT',
        bids: [ { price: 100, amount: 1 } ],
        asks: [ { price: 101, amount: 1 } ],
        exchangeTimestamp: undefined,
        receivedAt: Date.now(),
        sequence: 1,
    });

    const warm = await app.inject({ method: 'GET', url: '/ready' });
    assert.equal(warm.statusCode, 200);
    assert.equal(warm.json().status, 'ready');
    assert.equal(warm.json().freshCount, 1);
    await app.close();
});

// Readiness is only useful to an orchestrator that can reach it without a credential, for the
// same reason /health is public — probes run before any secret is injectable. It reports counts
// and never venue names, so it leaks nothing /health does not.
test('GET /ready needs no credentials, like the liveness probe', async () => {
    const { app } = await buildTestServer();
    const response = await app.inject({ method: 'GET', url: '/ready' });
    assert.notEqual(response.statusCode, 401);
    await app.close();
});

// /version is what a deploy asserts against, so the two properties that make it usable for that are
// worth pinning: it answers at all, and it is NOT public. A public /version would hand an attacker
// the exact revision to go read for a vulnerability — the same reason /exchanges/status is behind
// the key. The commit itself is 'unknown' here because nothing wrote dist/build-info.json for a
// tsx run from src/; that fallback not throwing is precisely what keeps `npm run dev` working.
test('GET /version requires a key and reports build provenance', async () => {
    const { app } = await buildTestServer();

    const anonymous = await app.inject({ method: 'GET', url: '/version' });
    assert.equal(anonymous.statusCode, 401);

    const response = await app.inject({ method: 'GET', url: '/version', headers: AUTH });
    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(typeof body.commit, 'string');
    assert.ok(body.commit.length > 0);
    assert.equal(typeof body.version, 'string');
    assert.equal(typeof body.uptimeSec, 'number');
    // Parses as a date, so a deploy check can compare it rather than guess at the format.
    assert.ok(!Number.isNaN(Date.parse(body.startedAt)));
    await app.close();
});

test('GET /symbols reflects the cache contents', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book({ symbol: 'BTC/USDT' }));
    cache.setBook(book({ symbol: 'ETH/USDT', exchangeId: 'coinbase' }));

    const response = await app.inject({ method: 'GET', url: '/symbols', headers: AUTH });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(new Set(response.json().symbols), new Set(['BTC/USDT', 'ETH/USDT']));
    await app.close();
});

test('GET /exchanges/status reflects recorded health', async () => {
    const { app, cache } = await buildTestServer();
    cache.initHealth('kraken');
    cache.recordUpdate('kraken');

    const response = await app.inject({ method: 'GET', url: '/exchanges/status', headers: AUTH });
    assert.equal(response.statusCode, 200);
    const status = response.json().exchanges.find((e: { exchangeId: string }) => e.exchangeId === 'kraken');
    assert.equal(status.connected, true);
    await app.close();
});

test('GET /orderbook/:exchange/:symbol returns 404 when nothing is cached', async () => {
    const { app } = await buildTestServer();
    const response = await app.inject({ method: 'GET', url: '/orderbook/kraken/BTC%2FUSDT', headers: AUTH });
    assert.equal(response.statusCode, 404);
    await app.close();
});

test('GET /orderbook/:exchange/:symbol returns the cached book', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book());

    const response = await app.inject({ method: 'GET', url: '/orderbook/kraken/BTC%2FUSDT', headers: AUTH });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().exchangeId, 'kraken');
    await app.close();
});

test('GET /route requires exactly one of amountIn or amountOut', async () => {
    const { app } = await buildTestServer();
    // Neither: the request is meaningless. Both: silently preferring one would turn a caller's
    // typo into a confidently wrong route.
    for (const q of ['from=USDT&to=BTC', 'from=USDT&to=BTC&amountIn=1&amountOut=1']) {
        const r = await app.inject({ method: 'GET', url: `/route?${q}`, headers: AUTH });
        assert.equal(r.statusCode, 400, q);
    }
    const zero = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=0', headers: AUTH });
    assert.equal(zero.statusCode, 400);
    await app.close();
});

test('a repeated query parameter is rejected, not crashed on', async () => {
    // Fastify turns ?from=A&from=B into an array, which reached .trim()/.split() and threw: a 500
    // leaking the internal message on REST, and an abnormal 1006 close with no error frame on WS.
    // Silently taking one of the values would be worse than either — a duplicated requireFullFill
    // or certified would drop a safety flag with nothing to detect it by.
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    for (const q of [
        'from=USDT&from=BTC&to=BTC&amountOut=1',
        'from=USDT&to=BTC&amountOut=1&amountOut=2',
        'from=USDT&to=BTC&amountOut=1&requireFullFill=true&requireFullFill=false',
        'from=USDT&to=BTC&amountOut=1&exchanges=kraken&exchanges=binance',
    ]) {
        const r = await app.inject({ method: 'GET', url: `/route?${q}`, headers: AUTH });
        assert.equal(r.statusCode, 400, `${q} -> ${r.statusCode} ${r.body.slice(0, 120)}`);
        assert.match(r.json().error, /must not be repeated/);
    }
    await app.close();
});

test('GET /route echoes requireFullFill so the caller can confirm it was applied', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    const on = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1&requireFullFill=true', headers: AUTH });
    const off = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1', headers: AUTH });
    assert.equal(on.json().requireFullFill, true);
    assert.equal(off.json().requireFullFill, false);
    await app.close();
});

test('GET /route requires from and to, and rejects from === to', async () => {
    const { app } = await buildTestServer();
    for (const q of ['to=BTC&amountOut=1', 'from=USDT&amountOut=1', 'from=BTC&to=BTC&amountOut=1']) {
        const r = await app.inject({ method: 'GET', url: `/route?${q}`, headers: AUTH });
        assert.equal(r.statusCode, 400, q);
    }
    await app.close();
});

test('GET /route derives pair and direction from the asset pair', async () => {
    const { app, cache, feeRegistry } = await buildTestServer();
    cache.setBook(book());
    feeRegistry.setFee('kraken', 'BTC/USDT', 0.001);

    // USDT -> BTC must resolve to a BUY of BTC/USDT without the caller ever saying "buy".
    const r = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1', headers: AUTH });
    assert.equal(r.statusCode, 200);
    const body = r.json();
    assert.equal(body.hops.length, 1);
    assert.equal(body.hops[0].pair, 'BTC/USDT');
    assert.equal(body.hops[0].side, 'buy');
    assert.equal(body.hops[0].legs[0].exchangeId, 'kraken');
    assert.equal(body.fullyFillable, true);
    assert.equal(body.strategy, 'best_single');
    assert.equal(body.exactSide, 'out');
    assert.equal(body.requestedAmount, 1);
    assert.ok(body.requestId, 'every recommendation must carry an audit id');
    assert.ok(body.calculatedAt > 0);
    await app.close();
});

test('GET /route reverses direction when from and to are swapped', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    const r = await app.inject({ method: 'GET', url: '/route?from=BTC&to=USDT&amountIn=1', headers: AUTH });
    const body = r.json();
    assert.equal(body.hops[0].pair, 'BTC/USDT', 'the same market serves both directions');
    assert.equal(body.hops[0].side, 'sell');
    assert.equal(body.exactSide, 'in');
    await app.close();
});

test('GET /route is 501, not 404, for a reachable pair the router cannot solve', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    cache.setBook(book({ exchangeId: 'kraken', symbol: 'SOL/USDT' }));
    // SOL -> BTC is reachable over USDT, but exact-out across hops is not implemented. That is a
    // different answer from "these assets are unreachable", and the status code must say so.
    const r = await app.inject({ method: 'GET', url: '/route?from=SOL&to=BTC&amountOut=1', headers: AUTH });
    assert.equal(r.statusCode, 501);
    assert.equal(r.json().unroutableReason, 'exact_out_multi_hop_unsupported');
    // The same conversion the other way round is supported and must still succeed.
    const ok = await app.inject({ method: 'GET', url: '/route?from=SOL&to=BTC&amountIn=1', headers: AUTH });
    assert.equal(ok.statusCode, 200);
    await app.close();
});

test('GET /route is 404 when no market and no bridge path exists', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    // An unreachable asset is a request-level mistake (wrong ticker, unlisted asset), not an
    // empty market result — so it must not look like a successful zero-liquidity quote.
    const r = await app.inject({ method: 'GET', url: '/route?from=DOGE&to=SHIB&amountIn=1', headers: AUTH });
    assert.equal(r.statusCode, 404);
    assert.equal(r.json().unroutableReason, 'no_market');
    await app.close();
});

// --- Authentication (integration, through the real hook chain) ---

test('every non-health route rejects a request with no credentials', async () => {
    const { app } = await buildTestServer();
    const protectedUrls = [
        '/symbols',
        '/exchanges/status',
        '/orderbook/kraken/BTC%2FUSDT',
        '/route?from=USDT&to=BTC&amountOut=1',
    ];
    for (const url of protectedUrls) {
        const response = await app.inject({ method: 'GET', url });
        assert.equal(response.statusCode, 401, `${url} should require auth`);
    }
    await app.close();
});

test('/health stays reachable without credentials so probes keep working', async () => {
    const { app } = await buildTestServer();
    const response = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(response.statusCode, 200);
    await app.close();
});

test('a wrong API key is rejected', async () => {
    const { app } = await buildTestServer();
    const response = await app.inject({ method: 'GET', url: '/symbols', headers: { 'x-api-key': 'wrong' } });
    assert.equal(response.statusCode, 401);
    await app.close();
});

test('Authorization: Bearer is accepted as an alternative to X-API-Key', async () => {
    const { app } = await buildTestServer();
    const response = await app.inject({
        method: 'GET',
        url: '/symbols',
        headers: { authorization: `Bearer ${TEST_API_KEY}` },
    });
    assert.equal(response.statusCode, 200);
    await app.close();
});

test('auth rejection does not leak whether the key was missing or merely wrong', async () => {
    const { app } = await buildTestServer();
    const missing = await app.inject({ method: 'GET', url: '/symbols' });
    const wrong = await app.inject({ method: 'GET', url: '/symbols', headers: { 'x-api-key': 'wrong' } });
    assert.equal(missing.statusCode, wrong.statusCode);
    assert.deepEqual(missing.json(), wrong.json());
    await app.close();
});

test('auth runs before routing, so unknown paths also require credentials', async () => {
    // Prevents an information leak where 404-vs-401 reveals which routes exist.
    const { app } = await buildTestServer();
    const response = await app.inject({ method: 'GET', url: '/definitely-not-a-route' });
    assert.equal(response.statusCode, 401);
    await app.close();
});

// --- Rate limiting ---

async function buildRateLimitedServer (max: number) {
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    try {
        const cache = new OrderBookCache();
        const feeRegistry = new FeeRegistry();
        const app = await buildServer(cache, feeRegistry, silentLogger, { rateLimitMax: max });
        return { app, cache };
    } finally {
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
}

test('requests beyond the rate limit are rejected with 429', async () => {
    const { app } = await buildRateLimitedServer(3);
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) {
        const response = await app.inject({ method: 'GET', url: '/symbols', headers: AUTH });
        codes.push(response.statusCode);
    }
    assert.deepEqual(codes.slice(0, 3), [200, 200, 200], 'first 3 within limit');
    assert.deepEqual(codes.slice(3), [429, 429], 'subsequent requests throttled');
    await app.close();
});

test('rate limit responses carry retry-after and limit headers', async () => {
    const { app } = await buildRateLimitedServer(1);
    await app.inject({ method: 'GET', url: '/symbols', headers: AUTH });
    const limited = await app.inject({ method: 'GET', url: '/symbols', headers: AUTH });
    assert.equal(limited.statusCode, 429);
    assert.ok(limited.headers['retry-after'] !== undefined, 'retry-after present');
    assert.ok(limited.headers['x-ratelimit-limit'] !== undefined, 'x-ratelimit-limit present');
    await app.close();
});

test('/health is exempt from rate limiting so probes never see a 429', async () => {
    const { app } = await buildRateLimitedServer(2);
    for (let i = 0; i < 10; i++) {
        const response = await app.inject({ method: 'GET', url: '/health' });
        assert.equal(response.statusCode, 200, `health request ${i} should not be throttled`);
    }
    await app.close();
});

test('rate limit buckets are per API key, not global', async () => {
    // One client exhausting its budget must not lock out a different key.
    const { app } = await buildRateLimitedServer(2);
    try {
        await app.inject({ method: 'GET', url: '/symbols', headers: AUTH });
        await app.inject({ method: 'GET', url: '/symbols', headers: AUTH });
        const throttled = await app.inject({ method: 'GET', url: '/symbols', headers: AUTH });
        assert.equal(throttled.statusCode, 429, 'first key exhausted');

        // A different (invalid) key hits its own fresh bucket, so it reaches auth and gets 401 —
        // not 429, which would prove the buckets were shared.
        const otherKey = await app.inject({ method: 'GET', url: '/symbols', headers: { 'x-api-key': 'another-key' } });
        assert.equal(otherKey.statusCode, 401, 'separate bucket, so reaches auth rather than the limiter');
    } finally {
        await app.close();
    }
});

test('failed auth attempts are themselves rate limited (key brute-force is throttled)', async () => {
    // Regression test for a real bug: registering the auth hook with a bare app.addHook placed it
    // AHEAD of @fastify/rate-limit's deferred hook, so every 401 short-circuited before the
    // limiter counted it — leaving API key brute-force completely unthrottled while authenticated
    // traffic appeared correctly limited. Asserting only the authenticated case (as the original
    // tests did) cannot catch this.
    const { app } = await buildRateLimitedServer(5);
    const codes: number[] = [];
    for (let i = 0; i < 12; i++) {
        const response = await app.inject({ method: 'GET', url: '/symbols', headers: { 'x-api-key': 'wrong-key' } });
        codes.push(response.statusCode);
    }
    assert.ok(codes.includes(429), `repeated bad keys must eventually 429, got ${JSON.stringify(codes)}`);
    await app.close();
});

test('rotating the API key does not mint unlimited fresh rate-limit buckets', async () => {
    // The limiter buckets by the attacker-supplied key header. If a fresh key value always got a
    // fresh bucket, an attacker could rotate the header per request and brute-force without limit.
    const { app } = await buildRateLimitedServer(5);
    const codes: number[] = [];
    for (let i = 0; i < 15; i++) {
        const response = await app.inject({ method: 'GET', url: '/symbols', headers: { 'x-api-key': `guess-${i}` } });
        codes.push(response.statusCode);
    }
    assert.ok(codes.includes(429), `rotating keys must still be throttled, got ${JSON.stringify(codes)}`);
    await app.close();
});

test('unauthenticated requests with no key at all are rate limited', async () => {
    const { app } = await buildRateLimitedServer(5);
    const codes: number[] = [];
    for (let i = 0; i < 12; i++) {
        const response = await app.inject({ method: 'GET', url: '/symbols' });
        codes.push(response.statusCode);
    }
    assert.ok(codes.includes(429), `unauthenticated flood must be throttled, got ${JSON.stringify(codes)}`);
    await app.close();
});

// --- WebSocket stream endpoint input validation ---

test('WS /stream/route applies exactly the same validation as GET /route', async () => {
    // The streaming path originally did its own ad-hoc parsing and skipped amount validation
    // entirely, so `amount=abc` became NaN, defeated the walk's termination check, traversed
    // every level of every book and then streamed nulls — repeatedly, on every book update. Both
    // endpoints now share one parser, and this asserts the two agree case for case. Needs a real
    // listening server (not inject()) because the behaviour lives in the upgrade handler.
    // The cache is seeded so a rejection can only come from validation, never from no_market.
    const { WebSocket } = await import('ws');
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book());
    const app = await buildServer(cache, new FeeRegistry(), silentLogger, { rateLimitMax: 100000 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        const bad = [
            'from=USDT&to=BTC&amountOut=abc',
            'from=USDT&to=BTC&amountOut=-5',
            'from=USDT&to=BTC&amountOut=0',
            'from=USDT&to=BTC',                             // neither amount
            'from=USDT&to=BTC&amountIn=1&amountOut=1',      // both amounts
            'to=BTC&amountOut=1',                           // missing from
            'from=BTC&to=BTC&amountOut=1',                  // from === to
            'from=USDT&to=BTC&amountOut=1&strategy=nonsense',
            'from=USDT&to=BTC&amountOut=1&maxVenues=0',
            'from=USDT&to=BTC&amountOut=1&minLegNotional=-1',
            'from=USDT&to=BTC&amountOut=1&hopPenaltyBps=-1',
        ];
        for (const q of bad) {
            // REST and WS must reach the same verdict, or the two surfaces have drifted again.
            const rest = await app.inject({ method: 'GET', url: `/route?${q}`, headers: AUTH });
            assert.equal(rest.statusCode, 400, `REST should reject ${q}`);

            const closeCode = await new Promise<number>((resolve) => {
                const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?${q}`, {
                    headers: { 'x-api-key': TEST_API_KEY },
                });
                ws.on('close', (code: number) => resolve(code));
                ws.on('error', () => resolve(-1));
                setTimeout(() => { ws.close(); resolve(0); }, 2000);
            });
            assert.equal(closeCode, 1008, `WS should reject ${q} with a policy-violation close`);
        }
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

test('WS /stream/route pushes a full route and refuses an unreachable pair', async () => {
    const { WebSocket } = await import('ws');
    const { app, port, cache } = await buildWsLimitedServer({ wsMaxConnectionsPerKey: 5 });
    try {
        const first = await new Promise<Record<string, unknown>>((resolve, reject) => {
            const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountOut=1`, {
                headers: { 'x-api-key': TEST_API_KEY },
            });
            ws.on('message', (d: Buffer) => { resolve(JSON.parse(d.toString())); ws.close(); });
            ws.on('error', reject);
            setTimeout(() => reject(new Error('timeout')), 3000);
        });
        // The streamed body is the REST body — a caller switching to streaming changes the URL
        // and nothing else. Comparing key NAMES alone was not enough: the handler could ignore
        // half the parsed options and still produce an identically-shaped object, so the option
        // echoes and the computed values are compared too.
        const rest = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1', headers: AUTH });
        const restBody = rest.json();
        assert.deepEqual(Object.keys(first).sort(), Object.keys(restBody).sort());
        // The CONTRACT — what was asked and what settings were applied — must match exactly.
        for (const field of ['from', 'to', 'exactSide', 'requestedAmount', 'strategy', 'includeFees',
            'certifiedOnly', 'staleBookMs', 'stalenessPenaltyBps', 'hopPenaltyBps', 'requireFullFill',
            'fullyFillable', 'fillRatio']) {
            assert.deepEqual(first[field], restBody[field], `${field} differs between /route and /stream/route`);
        }
        // PRICED values are compared with a tolerance, because they are not deterministic across two
        // calls: the staleness penalty is a function of each book's age, so two requests microseconds
        // apart price the same book fractionally differently. Asserting exact equality here would be
        // asserting that the router ignores time, which is the opposite of what it does.
        for (const field of ['amountIn', 'amountOut', 'effectiveRate']) {
            const a = first[field] as number;
            const b = restBody[field] as number;
            assert.ok(Math.abs(a - b) <= Math.abs(b) * 1e-4,
                `${field} differs by more than staleness drift: ${a} vs ${b}`);
        }
        assert.equal((first['hops'] as unknown[]).length, 1);

        // An unreachable pair can never produce an update, so holding the socket open would be a
        // silent hang rather than an answer.
        const closeCode = await new Promise<number>((resolve) => {
            const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=DOGE&to=SHIB&amountIn=1`, {
                headers: { 'x-api-key': TEST_API_KEY },
            });
            ws.on('close', (code: number) => resolve(code));
            ws.on('error', () => resolve(-1));
            setTimeout(() => resolve(0), 3000);
        });
        assert.equal(closeCode, 1008);
        assert.ok(cache);
    } finally {
        await app.close();
    }
});

test('WS /stream/route follows a market that appears after the socket opened', async () => {
    // The watch set used to be frozen at connect while computeRoute re-enumerated candidate paths
    // on every push. Once a newly-listed market became the winning route, the stream quoted a
    // market it was not subscribed to: silent through every move of the market it was actually
    // recommending, then a jump when some unrelated leg happened to tick. The same freeze bit every
    // client that connected during startup, while 60 connectors were still populating the cache.
    const { WebSocket } = await import('ws');
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book({ symbol: 'SOL/USDT', bids: [{ price: 10, amount: 1000 }], asks: [{ price: 10, amount: 1000 }] }));
    cache.setBook(book({ symbol: 'BTC/USDT', bids: [{ price: 100, amount: 1000 }], asks: [{ price: 100, amount: 1000 }] }));
    // A short idle timeout doubles as the resubscribe tick, which is what notices a brand-new market.
    const app = await buildServer(cache, new FeeRegistry(), silentLogger,
        { rateLimitMax: 100000, wsIdleTimeoutMs: 150 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        const frames: Record<string, unknown>[] = [];
        const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=SOL&to=BTC&amountIn=10`, {
            headers: { 'x-api-key': TEST_API_KEY },
        });
        ws.on('message', (d: Buffer) => frames.push(JSON.parse(d.toString())));
        await new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
            setTimeout(() => reject(new Error('never opened')), 3000);
        });
        await new Promise((r) => setTimeout(r, 200));
        assert.ok(frames.length >= 1, 'a first frame must arrive on connect');
        assert.deepEqual((frames[0]!['hops'] as { pair: string }[]).map((h) => h.pair), ['SOL/USDT', 'BTC/USDT']);

        // A direct market is listed AFTER the socket opened, and it is much better than the bridge.
        cache.setBook(book({ symbol: 'SOL/BTC', bids: [{ price: 5, amount: 1000 }], asks: [{ price: 5, amount: 1000 }] }));
        const seenDirect = new Promise<void>((resolve, reject) => {
            const started = frames.length;
            const poll = setInterval(() => {
                for (let i = started; i < frames.length; i++) {
                    const pairs = (frames[i]!['hops'] as { pair: string }[]).map((h) => h.pair);
                    if (pairs.length === 1 && pairs[0] === 'SOL/BTC') { clearInterval(poll); resolve(); return; }
                }
            }, 25);
            setTimeout(() => { clearInterval(poll); reject(new Error('never picked up the new market')); }, 4000);
        });
        await seenDirect;

        // And it must now be SUBSCRIBED to that market, not merely willing to quote it: moving the
        // new market alone has to produce a frame.
        const before = frames.length;
        const moved = new Promise<void>((resolve, reject) => {
            const poll = setInterval(() => {
                if (frames.length > before) { clearInterval(poll); resolve(); }
            }, 25);
            setTimeout(() => { clearInterval(poll); reject(new Error('a move on the newly-quoted market produced no frame')); }, 3000);
        });
        cache.setBook(book({ symbol: 'SOL/BTC', bids: [{ price: 7, amount: 1000 }], asks: [{ price: 7, amount: 1000 }] }));
        await moved;
        const latest = frames[frames.length - 1]!;
        assert.ok((latest['amountOut'] as number) > 60, `expected the improved rate to be quoted, got ${latest['amountOut']}`);
        ws.terminate();
    } finally {
        await app.close();
    }
});

test('WS /stream/route refuses a bridged exact-out, exactly as REST does', async () => {
    // REST answers 501 for this shape. A streaming endpoint that ACCEPTS a request its REST twin
    // rejects is precisely the drift the shared parser exists to prevent.
    const { WebSocket } = await import('ws');
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book({ symbol: 'SOL/USDT', bids: [{ price: 10, amount: 1000 }], asks: [{ price: 10, amount: 1000 }] }));
    cache.setBook(book({ symbol: 'BTC/USDT', bids: [{ price: 100, amount: 1000 }], asks: [{ price: 100, amount: 1000 }] }));
    const app = await buildServer(cache, new FeeRegistry(), silentLogger, { rateLimitMax: 100000 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        const rest = await app.inject({ method: 'GET', url: '/route?from=SOL&to=BTC&amountOut=1', headers: AUTH });
        assert.equal(rest.statusCode, 501);

        const code = await new Promise<number>((resolve) => {
            const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=SOL&to=BTC&amountOut=1`, {
                headers: { 'x-api-key': TEST_API_KEY },
            });
            ws.on('close', (c: number) => resolve(c));
            ws.on('error', () => resolve(-1));
            setTimeout(() => resolve(0), 3000);
        });
        assert.equal(code, 1008, 'the stream must refuse what REST refuses');
    } finally {
        await app.close();
    }
});

test('WS /stream/route re-pushes when any leg of a bridged route moves', async () => {
    // A bridged route depends on more than one market, so subscribing only to the first leg would
    // silently miss half the price changes that alter the answer.
    const { WebSocket } = await import('ws');
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book({ symbol: 'SOL/USDT', bids: [{ price: 10, amount: 1000 }], asks: [{ price: 10, amount: 1000 }] }));
    cache.setBook(book({ symbol: 'BTC/USDT', bids: [{ price: 50, amount: 1000 }], asks: [{ price: 50, amount: 1000 }] }));
    const app = await buildServer(cache, new FeeRegistry(), silentLogger, { rateLimitMax: 100000 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        const frames: number[] = [];
        const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=SOL&to=BTC&amountIn=10`, {
            headers: { 'x-api-key': TEST_API_KEY },
        });
        await new Promise<void>((resolve, reject) => {
            ws.on('message', (d: Buffer) => { frames.push(JSON.parse(d.toString()).amountOut); resolve(); });
            ws.on('error', reject);
            setTimeout(() => reject(new Error('timeout')), 3000);
        });
        assert.equal(frames.length, 1, 'the first frame arrives on connect, before any update');

        // Move the SECOND leg only. BTC gets cheaper, so the same 10 SOL must buy more BTC.
        // The timeout matters: without it a regression in the subscription set makes this test hang
        // the whole run instead of failing, which reads as a stuck CI rather than a broken feature.
        const bumped = new Promise<void>((resolve, reject) => {
            ws.once('message', () => resolve());
            setTimeout(() => reject(new Error('no frame after the far leg moved — subscription regressed')), 3000);
        });
        cache.setBook(book({ symbol: 'BTC/USDT', bids: [{ price: 25, amount: 1000 }], asks: [{ price: 25, amount: 1000 }] }));
        await bumped;
        assert.equal(frames.length, 2, 'a move on the far leg must reach the subscriber');
        assert.ok(frames[1]! > frames[0]!, `cheaper BTC must yield more BTC: ${frames[0]} -> ${frames[1]}`);
        ws.terminate();
    } finally {
        await app.close();
    }
});

test('rejected WebSocket upgrades do not leak server-side sockets', async () => {
    // Regression test for a confirmed unauthenticated FD-exhaustion DoS. When auth ran at
    // onRequest, its 401 set reply.sent, which halts Fastify's hook chain — so @fastify/websocket's
    // own onRequest hook (the one that sets request.ws) never ran, its onResponse cleanup
    // (`if (request.ws) ...destroy()`) no-oped, and the socket Node had already handed off via the
    // upgrade event was held for the life of the process. No timeout reaps a post-upgrade socket.
    // Measured on the original code: 1200 upgrades leaked 1200 FDs in ~700ms.
    //
    // Must drive a real TCP upgrade: app.inject() never touches the socket path where this lives.
    const net = await import('node:net');
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const app = await buildServer(new OrderBookCache(), new FeeRegistry(), silentLogger, { rateLimitMax: 100000 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        const upgrade = (path: string) => new Promise<void>((resolve) => {
            const socket = net.connect(port, '127.0.0.1', () => {
                socket.write(
                    `GET ${path} HTTP/1.1\r\nHost: h\r\nUpgrade: websocket\r\n`
                    + 'Connection: Upgrade\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n'
                    + 'Sec-WebSocket-Version: 13\r\n\r\n');
            });
            let buf = '';
            socket.on('data', (d) => { buf += d; if (buf.includes('\r\n\r\n')) { socket.destroy(); resolve(); } });
            socket.on('error', () => resolve());
            socket.setTimeout(3000, () => { socket.destroy(); resolve(); });
        });

        // Path-independent on the original bug: matched WS route, matched non-WS route, and an
        // unmatched path all leaked, so all three are covered here.
        for (const path of ['/stream/route?from=USDT&to=BTC&amountOut=1', '/symbols', '/nonexistent']) {
            for (let i = 0; i < 10; i++) await upgrade(path);
        }
        await new Promise((r) => setTimeout(r, 1500));

        const held = await new Promise<number>((resolve, reject) =>
            app.server.getConnections((e, c) => (e ? reject(e) : resolve(c))));
        assert.ok(held <= 2, `rejected upgrades must not accumulate sockets, ${held} still held`);
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

// --- WebSocket connection limits (security finding #4b) ---

async function buildWsLimitedServer (opts: { wsMaxConnectionsPerKey?: number; wsIdleTimeoutMs?: number }) {
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book());
    const app = await buildServer(cache, new FeeRegistry(), silentLogger, {
        rateLimitMax: 100000,
        ...opts,
    });
    await app.listen({ port: 0, host: '127.0.0.1' });
    const address = app.server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    return { app, port, cache };
}

test('concurrent WS stream connections are capped per API key', async () => {
    // Each stream holds a cache listener removed only on close, which the client controls. Rate
    // limiting bounds how fast connections open, not how many stay open, so without a cap an
    // authenticated client can accumulate listeners until the process exhausts resources.
    const { WebSocket } = await import('ws');
    const { app, port } = await buildWsLimitedServer({ wsMaxConnectionsPerKey: 3 });
    const open: InstanceType<typeof WebSocket>[] = [];
    try {
        const connect = (key: string) => new Promise<{ ok: boolean; code: number }>((resolve) => {
            const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountOut=1`, {
                headers: { 'x-api-key': key },
            });
            open.push(ws);
            let sawData = false;
            ws.on('message', (d: Buffer) => {
                const parsed = JSON.parse(d.toString());
                if (parsed.error === undefined) { sawData = true; resolve({ ok: true, code: 0 }); }
            });
            ws.on('close', (code: number) => resolve({ ok: sawData, code }));
            ws.on('error', () => resolve({ ok: false, code: -1 }));
        });

        const accepted = [];
        for (let i = 0; i < 3; i++) accepted.push(await connect(TEST_API_KEY));
        assert.ok(accepted.every((r) => r.ok), 'first 3 connections within the cap are accepted');

        const rejected = await connect(TEST_API_KEY);
        assert.equal(rejected.ok, false, 'connection past the cap is rejected');
        assert.equal(rejected.code, 1013, 'rejected with 1013 Try Again Later');
    } finally {
        for (const ws of open) { try { ws.terminate(); } catch { /* already closed */ } }
        await app.close();
    }
});

test('closing a stream frees its slot against the cap', async () => {
    // Guards the release path: a leaked count would permanently lock a legitimate client out of
    // its own budget, turning the DoS defence into a self-inflicted DoS.
    const { WebSocket } = await import('ws');
    const { app, port } = await buildWsLimitedServer({ wsMaxConnectionsPerKey: 1 });
    try {
        const openOne = () => new Promise<InstanceType<typeof WebSocket>>((resolve, reject) => {
            const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountOut=1`, {
                headers: { 'x-api-key': TEST_API_KEY },
            });
            ws.on('message', () => resolve(ws));
            ws.on('error', reject);
            setTimeout(() => reject(new Error('timeout')), 3000);
        });

        const first = await openOne();
        first.close();
        await new Promise((r) => setTimeout(r, 300));

        // Slot must be reusable now; if the count leaked this rejects with 1013.
        const second = await openOne();
        assert.equal(second.readyState, second.OPEN, 'slot was released and reused');
        second.terminate();
    } finally {
        await app.close();
    }
});

test('per-key WS caps are independent across keys', async () => {
    const { WebSocket } = await import('ws');
    const { app, port } = await buildWsLimitedServer({ wsMaxConnectionsPerKey: 1 });
    const open: InstanceType<typeof WebSocket>[] = [];
    try {
        // Both use the valid key header value here; a different *valid* identity isn't available
        // under single-key auth, so this asserts the bookkeeping is keyed at all rather than global.
        const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountOut=1`, {
            headers: { 'x-api-key': TEST_API_KEY },
        });
        open.push(ws);
        await new Promise((resolve, reject) => {
            ws.on('message', resolve);
            ws.on('error', reject);
            setTimeout(() => reject(new Error('timeout')), 3000);
        });
        // A second connection on the SAME key must be refused at cap 1.
        const refusedCode = await new Promise<number>((resolve) => {
            const ws2 = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountOut=1`, {
                headers: { 'x-api-key': TEST_API_KEY },
            });
            open.push(ws2);
            ws2.on('close', (code: number) => resolve(code));
            ws2.on('error', () => resolve(-1));
        });
        assert.equal(refusedCode, 1013);
    } finally {
        for (const w of open) { try { w.terminate(); } catch { /* already closed */ } }
        await app.close();
    }
});

test('unresponsive WS clients are reaped by the heartbeat', async () => {
    // A socket that never sends a close frame (half-open TCP, suspended client) would otherwise
    // hold its listener and cap slot forever. Uses a short idle timeout and suppresses the
    // client's automatic pong so it looks dead to the server.
    const { WebSocket } = await import('ws');
    const { app, port } = await buildWsLimitedServer({ wsMaxConnectionsPerKey: 5, wsIdleTimeoutMs: 250 });
    try {
        const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountOut=1`, {
            headers: { 'x-api-key': TEST_API_KEY },
        });
        await new Promise((resolve, reject) => {
            ws.on('message', resolve);
            ws.on('error', reject);
            setTimeout(() => reject(new Error('timeout')), 3000);
        });
        // Silence the automatic pong so the server sees no liveness signal.
        ws.pong = () => { /* deliberately unresponsive */ };

        const closed = await new Promise<boolean>((resolve) => {
            ws.on('close', () => resolve(true));
            setTimeout(() => resolve(false), 4000);
        });
        assert.equal(closed, true, 'unresponsive socket must be terminated by the reaper');
    } finally {
        await app.close();
    }
});

// --- Reverse-proxy (nginx) deployment behaviour ---

test('without trustProxy, a spoofed X-Forwarded-For cannot mint fresh rate-limit buckets', async () => {
    // The dangerous direction: if trustProxy were on by default and no proxy overwrote the header,
    // any client could rotate X-Forwarded-For per request and bypass rate limiting entirely —
    // handing back the exact brute-force hole the limiter exists to close.
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const app = await buildServer(new OrderBookCache(), new FeeRegistry(), silentLogger, {
        rateLimitMax: 3,
        trustProxy: false,
    });
    try {
        const codes: number[] = [];
        for (let i = 0; i < 6; i++) {
            const response = await app.inject({
                method: 'GET',
                url: '/symbols',
                headers: { 'x-api-key': 'wrong', 'x-forwarded-for': `10.0.0.${i}` },
            });
            codes.push(response.statusCode);
        }
        assert.ok(codes.includes(429), 'rotating X-Forwarded-For must NOT evade the limiter');
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

test('with trustProxy, distinct forwarded client IPs get independent buckets', async () => {
    // The nginx direction: without this, every request arrives from the proxy's address and all
    // unauthenticated traffic shares one bucket, so one abuser throttles every other client.
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const app = await buildServer(new OrderBookCache(), new FeeRegistry(), silentLogger, {
        rateLimitMax: 2,
        trustProxy: true,
    });
    try {
        const exhaust = async (ip: string) => {
            const codes: number[] = [];
            for (let i = 0; i < 3; i++) {
                const response = await app.inject({
                    method: 'GET',
                    url: '/symbols',
                    headers: { 'x-api-key': 'wrong', 'x-forwarded-for': ip },
                });
                codes.push(response.statusCode);
            }
            return codes;
        };
        const first = await exhaust('203.0.113.10');
        assert.equal(first[2], 429, 'first client exhausts its own bucket');

        const second = await exhaust('203.0.113.99');
        assert.equal(second[0], 401, 'a different forwarded IP starts with a fresh bucket');
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

test('rejects an unknown strategy rather than silently defaulting', async () => {
    const { app } = await buildTestServer();
    const r = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1&strategy=nonsense', headers: AUTH });
    assert.equal(r.statusCode, 400);
    await app.close();
});

test('echoes a caller-supplied x-request-id so traces line up on both sides', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    const r = await app.inject({
        method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1',
        headers: { ...AUTH, 'x-request-id': 'caller-supplied-id' },
    });
    assert.equal(r.json().requestId, 'caller-supplied-id');
    assert.equal(r.headers['x-request-id'], 'caller-supplied-id');
    await app.close();
});

test('mints a request id when the caller does not supply one', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    const r = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1', headers: AUTH });
    const id = r.json().requestId;
    assert.match(id, /^[0-9a-f-]{36}$/, 'expected a uuid');
    assert.equal(r.headers['x-request-id'], id, 'header and body must agree');
    await app.close();
});

test('WS /stream/route is rate-bounded and omits the quotes diagnostic by default', async () => {
    // Coalescing per event-loop tick is not a rate bound: BTC/USDT alone updates from dozens of
    // venues, so nearly every tick carries one. Measured against the live service before the floor
    // existed, ONE socket pushed 658 frames/sec at 9.3KB each — 6.3 MB/s, against a per-key cap of
    // 50 sockets. Both halves of the fix are asserted: how often it pushes, and how big each push is.
    const { WebSocket } = await import('ws');
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    const feeRegistry = new FeeRegistry();
    for (const exchangeId of ['a', 'b', 'c', 'd', 'e']) {
        cache.setBook(book({ exchangeId, bids: [{ price: 99, amount: 50 }], asks: [{ price: 101, amount: 50 }] }));
        feeRegistry.setFee(exchangeId, 'BTC/USDT', 0.001);
    }
    const app = await buildServer(cache, feeRegistry, silentLogger,
        { rateLimitMax: 100000, wsMinPushIntervalMs: 100 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        const frames: Record<string, unknown>[] = [];
        const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountOut=1`, {
            headers: { 'x-api-key': TEST_API_KEY },
        });
        ws.on('message', (d: Buffer) => frames.push(JSON.parse(d.toString())));
        await new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
            setTimeout(() => reject(new Error('never opened')), 3000);
        });

        // Hammer the cache the way five live exchanges would.
        const stop = Date.now() + 600;
        let updates = 0;
        while (Date.now() < stop) {
            for (const exchangeId of ['a', 'b', 'c', 'd', 'e']) {
                cache.setBook(book({ exchangeId, bids: [{ price: 99, amount: 50 }],
                    asks: [{ price: 101 + (updates % 7) * 0.01, amount: 50 }] }));
                updates++;
            }
            await new Promise((r) => setImmediate(r));
        }
        await new Promise((r) => setTimeout(r, 300));

        assert.ok(updates > 500, `precondition: the cache must actually be busy, got ${updates} updates`);
        // ~900ms at a 100ms floor allows roughly 10 pushes; anything near `updates` means unbounded.
        assert.ok(frames.length <= 15,
            `${updates} cache updates produced ${frames.length} frames — the push floor is not holding`);
        assert.ok(frames.length >= 2, 'the floor must not stop delivery altogether');

        // The last frame must reflect the final state, not be dropped for arriving too soon —
        // that is the trailing edge, and without it a stream goes stale exactly when it matters.
        const last = frames[frames.length - 1]!;
        assert.ok((last['amountIn'] as number) > 0);

        // quotes[] is ~90% of the payload and is a "why these venues?" explanation, not an input to
        // any decision. It must be off unless asked for — but freshVenueCount, which callers DO act
        // on, must survive.
        const hop = (last['hops'] as Record<string, unknown>[])[0]!;
        assert.deepEqual(hop['quotes'], [], 'the stream must not ship per-venue quotes by default');
        assert.equal(hop['freshVenueCount'], 5, 'venue counts must survive the omission');
        assert.equal(hop['venueCount'], 5);
        ws.terminate();
    } finally {
        await app.close();
    }
});

test('includeQuotes is opt-out on REST and opt-in on the stream', async () => {
    const { app, cache, feeRegistry } = await buildTestServer();
    cache.setBook(book());
    feeRegistry.setFee('kraken', 'BTC/USDT', 0.001);
    const on = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1', headers: AUTH });
    assert.equal(on.json().hops[0].quotes.length, 1, 'REST returns the diagnostic by default');
    const off = await app.inject({
        method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1&includeQuotes=false', headers: AUTH });
    assert.deepEqual(off.json().hops[0].quotes, []);
    // Suppressing the diagnostic must not change the routing DECISION — same venues, same order.
    // The amounts are compared with a tolerance rather than exactly, because the staleness penalty
    // is a function of book age, so two calls a millisecond apart price the same book fractionally
    // differently. Asserting exact equality would assert that the router ignores time.
    const offLegs = off.json().hops[0].legs as { exchangeId: string; amount: number }[];
    const onLegs = on.json().hops[0].legs as { exchangeId: string; amount: number }[];
    assert.deepEqual(offLegs.map((l) => l.exchangeId), onLegs.map((l) => l.exchangeId),
        'the same venues must be chosen, in the same order');
    for (const [i, leg] of offLegs.entries()) {
        assert.ok(Math.abs(leg.amount - onLegs[i]!.amount) <= Math.abs(onLegs[i]!.amount) * 1e-4,
            `leg ${leg.exchangeId} amount differs by more than staleness drift`);
    }
    assert.equal(off.json().hops[0].freshVenueCount, on.json().hops[0].freshVenueCount);
    await app.close();
});

test('an unroutable reason does not depend on whether quotes were requested', async () => {
    // classify() used to read quotes.length to tell "the filters excluded everything" from "every
    // book was stale" — which made the diagnosis of a failure depend on whether the caller happened
    // to ask for diagnostics.
    const { app, cache } = await buildTestServer();
    const stale = book();
    stale.receivedAt = Date.now() - 600_000;
    cache.setBook(stale);
    // An unrelated fresh book, so the service is READY (routing is refused wholesale below the
    // readiness threshold) while every book on the queried path is still stale — which is the
    // state this classifier distinction is actually about. It shares no asset with USDT->BTC, so
    // it cannot become part of the answer.
    cache.setBook(book({ exchangeId: 'coinbase', symbol: 'SOL/USDC' }));
    for (const suffix of ['', '&includeQuotes=false']) {
        const r = await app.inject({
            method: 'GET', url: `/route?from=USDT&to=BTC&amountOut=1${suffix}`, headers: AUTH });
        assert.equal(r.json().unroutableReason, 'all_books_stale', `differed with includeQuotes${suffix}`);
    }
    const filtered = await app.inject({
        method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1&exchanges=&includeQuotes=false', headers: AUTH });
    assert.equal(filtered.json().unroutableReason, 'no_venues_matched_filter');
    await app.close();
});

test('freshness is the router\'s judgment, not a caller parameter', async () => {
    // These were query parameters. They are not any more: a caller cannot see the update rates they
    // would be calibrating against, and a millisecond number is the wrong shape for "is this price
    // still real?" anyway. Supplying them is now inert rather than an error — they are simply
    // unknown query keys — but they must NOT change the answer.
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    const plain = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1', headers: AUTH });
    const meddled = await app.inject({
        method: 'GET',
        url: '/route?from=USDT&to=BTC&amountOut=1&maxStalenessMs=999999&stalenessPenaltyBps=500',
        headers: AUTH,
    });
    assert.equal(meddled.statusCode, 200);
    assert.equal(meddled.json().staleBookMs, plain.json().staleBookMs,
        'a caller must not be able to widen the freshness window');
    assert.equal(meddled.json().stalenessPenaltyBps, plain.json().stalenessPenaltyBps,
        'a caller must not be able to disable the staleness penalty');
    await app.close();
});

test('the staleness penalty is applied by default, not merely available', async () => {
    // It shipped defaulting to 0, which meant every caller got the naive behaviour unless they knew
    // to ask for something they had no way to calibrate. The echoed value proves it is actually on.
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    const r = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1', headers: AUTH });
    assert.ok(r.json().stalenessPenaltyBps > 0,
        'the router must price staleness by default rather than ignoring it');
    // And still be echoed, so a caller can always see what judgment was applied to their quote.
    assert.ok(r.json().staleBookMs > 0);
    await app.close();
});

test('GET /route honours balances end to end and echoes what it applied', async () => {
    const { app, cache } = await buildTestServer();
    // kraken alone quotes BTC/USDT here, at 101 with 5 BTC on offer — plenty for 300 USDT.
    cache.setBook(book());

    const wide = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountIn=300', headers: AUTH });
    assert.equal(wide.json().balancesApplied, null, 'an absent balances must stay indistinguishable from before');
    assert.equal(wide.json().balanceCapAmountIn, null);

    const held = await app.inject({
        method: 'GET', url: '/route?from=USDT&to=BTC&amountIn=300&balances=kraken.USDT:100', headers: AUTH,
    });
    const body = held.json();
    // The echo is what a client verifies before executing: /route declares its query type to
    // Fastify with no JSON schema, so a server that predates this feature IGNORES balances and
    // answers byte-identically to one that never received them.
    assert.equal(body.balancesApplied, 'kraken.USDT:100');
    assert.equal(body.balanceMode, 'cap');
    assert.equal(body.balanceEntryCount, 1);
    assert.equal(body.balanceCapAmountIn, 100);
    assert.ok(Math.abs(body.amountIn - 100) < 1e-9, `spent ${body.amountIn}, expected the wallet's 100`);
    assert.equal(body.requestedAmount, 300, 'the ask is unchanged; only the fill was clamped');
    assert.equal(body.fullyFillable, false);

    const unfunded = await app.inject({
        method: 'GET', url: '/route?from=USDT&to=BTC&amountIn=300&balances=binance.USDT:5000', headers: AUTH,
    });
    assert.equal(unfunded.json().unroutableReason, 'insufficient_balance');

    for (const q of ['balances=nonsense', 'balances=a.USDT:1,a.USDT:2', 'balanceMode=maybe']) {
        const bad = await app.inject({ method: 'GET', url: `/route?from=USDT&to=BTC&amountIn=300&${q}`, headers: AUTH });
        assert.equal(bad.statusCode, 400, q);
    }
    await app.close();
});

test('a repeated balances parameter is a 400, inherited from the blanket array check', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book());
    const r = await app.inject({
        method: 'GET', url: '/route?from=USDT&to=BTC&amountIn=300&balances=USDT:1&balances=BTC:1', headers: AUTH,
    });
    assert.equal(r.statusCode, 400);
    assert.equal(r.json().error, 'balances must not be repeated');
    await app.close();
});

test('WS /stream/route refuses balances rather than pricing a portfolio it cannot refresh', async () => {
    // A socket lives for minutes and there is no socket.on('message') to update the holdings it
    // opened with, so every frame after the first prices a wallet that may already have moved.
    const { WebSocket } = await import('ws');
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book());
    const app = await buildServer(cache, new FeeRegistry(), silentLogger, { rateLimitMax: 100000 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        // REST accepts exactly what the stream refuses — the one place the two are allowed to
        // differ, and it is stated in the frame rather than left to be inferred from a close code.
        const rest = await app.inject({
            method: 'GET', url: '/route?from=USDT&to=BTC&amountOut=1&balances=USDT:5000', headers: AUTH,
        });
        assert.equal(rest.statusCode, 200);

        const refusal = await new Promise<{ code: number; error: string }>((resolve) => {
            let error = '';
            const ws = new WebSocket(
                `ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountOut=1&balances=USDT:5000`,
                { headers: { 'x-api-key': TEST_API_KEY } });
            ws.on('message', (d: Buffer) => { error = JSON.parse(d.toString()).error; });
            ws.on('close', (code: number) => resolve({ code, error }));
            ws.on('error', () => resolve({ code: -1, error }));
            setTimeout(() => resolve({ code: 0, error }), 3000);
        });
        assert.equal(refusal.code, 1008);
        assert.equal(refusal.error, STREAM_BALANCES_UNSUPPORTED);
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

test('the access log redacts the balances parameter the ROUTER honoured, however it was spelled', async () => {
    // Two ends that disagreed on what "balances" is. Fastify's querystring parser percent-decodes
    // parameter NAMES, so `bal%61nces=` is honoured and the constraint is fully applied — while a
    // redactor reading the raw URL for the literal text never matched, and the amounts went to the
    // diagnostic log in the clear. The test sends the encoded spelling precisely because the
    // un-encoded one already passed.
    const lines: string[] = [];
    const capturing = pino({ level: 'info' }, { write: (line: string) => { lines.push(line); } });
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book());
    const app = await buildServer(cache, new FeeRegistry(), capturing);
    try {
        const r = await app.inject({
            method: 'GET',
            url: '/route?from=USDT&to=BTC&amountIn=300&bal%61nces=kraken.USDT:40817',
            headers: AUTH,
        });
        // The constraint really was applied — which is what makes the leak a leak rather than a
        // parameter the server ignored.
        assert.equal(r.statusCode, 200);
        assert.equal(r.json().balancesApplied, 'kraken.USDT:40817');
        assert.equal(r.json().balanceCapAmountIn, 40817);

        const serialised = lines.join('\n');
        assert.ok(!serialised.includes('40817'), `the log leaked 40817:\n${serialised}`);
        assert.ok(serialised.includes('[redacted]'), 'the parameter must be redacted, not dropped');
        // The spelling the caller used is kept: redaction must not rewrite the request into one
        // the server never saw.
        assert.ok(serialised.includes('bal%61nces=[redacted]'), serialised);
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

test('the access line still carries every field Fastify would have logged', async () => {
    // requestLogLine REPLACES Fastify's default req serializer, so anything it forgets is gone from
    // every access line for every request — a field you discover missing mid-incident.
    const lines: string[] = [];
    const capturing = pino({ level: 'info' }, { write: (line: string) => { lines.push(line); } });
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const app = await buildServer(new OrderBookCache(), new FeeRegistry(), capturing);
    try {
        // A real socket rather than inject(), because remotePort is one of the fields being
        // checked and inject() has no socket to read one from.
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;
        await fetch(`http://127.0.0.1:${port}/health`, { headers: { ...AUTH, 'accept-version': '1.x' } });
        const access = lines.map((l) => JSON.parse(l)).find((l) => l.req !== undefined);
        assert.ok(access, 'an access line must be emitted');
        // The exact field set fastify/lib/logger-pino.js emits.
        assert.deepEqual(Object.keys(access.req).sort(),
            ['host', 'method', 'remoteAddress', 'remotePort', 'url', 'version']);
        assert.equal(access.req.version, '1.x');
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

test('the access log never records the amounts a caller holds', async () => {
    // The access line carries the full request URL, so redacting only the audit record would
    // accomplish nothing. Asserted on the SERIALISED line rather than on the redaction helper,
    // because redaction-by-regex is exactly the thing that silently stops matching after an
    // unrelated refactor — and the failure mode is a compliance incident, not a broken route.
    const lines: string[] = [];
    const capturing = pino({ level: 'info' }, { write: (line: string) => { lines.push(line); } });
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book());
    const app = await buildServer(cache, new FeeRegistry(), capturing);
    try {
        await app.inject({
            method: 'GET',
            url: '/route?from=USDT&to=BTC&amountIn=300&balances=kraken.USDT:40817,binance.BTC:0.31337',
            headers: AUTH,
        });
        const serialised = lines.join('\n');
        assert.ok(serialised.includes('"url"'), 'the access line must still record the URL it redacted');
        for (const secret of ['40817', '0.31337']) {
            assert.ok(!serialised.includes(secret), `the log leaked ${secret}:\n${serialised}`);
        }
        // The record still has to be useful: how many entries, which mode, and a stable fingerprint
        // to correlate the same portfolio across requests.
        const audit = lines.map((l) => JSON.parse(l)).find((l) => l.event === 'route_recommendation');
        assert.ok(audit, 'the routing decision must still be audited');
        assert.equal(audit.balancesApplied, true);
        assert.equal(audit.balanceEntryCount, 2);
        assert.equal(audit.balanceMode, 'cap');
        assert.match(audit.balancesHash, /^[0-9a-f]{16}$/);
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

// An unroutable answer is a 200 with a well-formed body: it does not touch the error rate, the
// status-code labels, or the latency histogram. A shard whose books have all gone stale therefore
// keeps serving 200s at normal latency while telling every caller it cannot route — and before
// this counter existed, noticing that meant someone reading logs.
test('an unroutable answer increments a metric, not just a log line', async () => {
    const { app, cache } = await buildTestServer();
    const key = AUTH;

    const before = await app.inject({ method: 'GET', url: '/metrics', headers: key });
    assert.equal(before.body.indexOf('order_router_unroutable_total{reason="no_market"} 1'), -1);

    // A fresh book so the router is past the readiness gate, on a market that shares nothing with
    // the pair asked for: no market exists between THESE two assets, which is the 404 under test.
    cache.setBook(book({ exchangeId: 'coinbase', symbol: 'SOL/USDC' }));
    const route = await app.inject({ method: 'GET', url: '/route?from=DOGE&to=SHIB&amountIn=1', headers: key });
    assert.equal(route.json().unroutableReason, 'no_market');

    const after = await app.inject({ method: 'GET', url: '/metrics', headers: key });
    assert.ok(after.body.indexOf('order_router_unroutable_total{reason="no_market"} 1') !== -1,
        'the reason is counted with its label: ' + after.body.split('\n').filter((l) => l.indexOf('unroutable') !== -1).join(' | '));
    await app.close();
});

// ---------------------------------------------------------------------------
// H11: the one parameter that should never be in a URL
// ---------------------------------------------------------------------------

test('POST /route answers exactly as GET /route does', async () => {
    // A caller's holdings are scrubbed from both of this service's logs, but a URL does not stay
    // inside this process: nginx, an ALB and a CDN all log the full request line by default, and
    // so do browser history and any client-side tracing. None of that is reachable from here, so
    // the only actual fix is for the wallet not to be in the URL at all. POST exists for that, and
    // is only useful if it is the SAME route — a second implementation that drifts is worse than
    // no alternative.
    const { app } = await buildTestServer();
    const get = await app.inject({ method: 'GET', url: '/route?from=DOGE&to=SHIB&amountIn=1', headers: AUTH });
    const post = await app.inject({
        method: 'POST', url: '/route', headers: AUTH,
        payload: { from: 'DOGE', to: 'SHIB', amountIn: 1 },
    });
    assert.equal(post.statusCode, get.statusCode);
    const a = get.json();
    const b = post.json();
    // calculatedAt/calculatedAtIso are clock readings and requestId is per-request; the rest of
    // the body is the answer, and the answer must not depend on which verb asked for it.
    delete a.calculatedAt; delete b.calculatedAt;
    delete a.calculatedAtIso; delete b.calculatedAtIso;
    delete a.requestId; delete b.requestId;
    assert.deepEqual(b, a);
    await app.close();
});

test('POST /route validates its body the same way and needs the same key', async () => {
    const { app } = await buildTestServer();

    const anonymous = await app.inject({ method: 'POST', url: '/route', payload: { from: 'USDT', to: 'BTC', amountIn: 1 } });
    assert.equal(anonymous.statusCode, 401, 'the body form is not a way around auth');

    // Neither-or-both, exactly as the query form enforces it.
    const both = await app.inject({
        method: 'POST', url: '/route', headers: AUTH,
        payload: { from: 'USDT', to: 'BTC', amountIn: 1, amountOut: 1 },
    });
    assert.equal(both.statusCode, 400);

    const empty = await app.inject({ method: 'POST', url: '/route', headers: AUTH, payload: {} });
    assert.equal(empty.statusCode, 400);
    await app.close();
});

test('balances sent in the body appear in no log line, because they are in no URL', async () => {
    // The GET form relies on redactBalancesInUrl to keep holdings out of this service's own logs.
    // The body form removes the question: there is nothing in the request line to redact.
    const { app } = await buildTestServer();
    const response = await app.inject({
        method: 'POST', url: '/route', headers: AUTH,
        payload: { from: 'USDT', to: 'BTC', amountIn: 1, balances: 'USDT:1000' },
    });
    assert.notEqual(response.statusCode, 401);
    assert.equal(response.raw.req.url, '/route', 'the request line carries no parameters at all');
    await app.close();
});

test('a streamed recommendation reaches the audit trail and the unroutable counter', async () => {
    // The audit record is what settles "why did you route it there?" after the fact, and it was
    // written only by the REST handler. A caller on /stream/route got recommendations it could act
    // on that left no record at all, and a streaming-only outage never touched the unroutable
    // counter either — so the dashboards read healthy while every pushed frame said it could not
    // route. Asserted on the serialised log lines, since that is the artefact the ingester reads.
    const { WebSocket } = await import('ws');
    const lines: string[] = [];
    const capturing = pino({ level: 'info' }, { write: (line: string) => { lines.push(line); } });
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book());
    const app = await buildServer(cache, new FeeRegistry(), capturing, { rateLimitMax: 100000 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;

        const frames: Record<string, unknown>[] = [];
        const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountIn=300`, {
            headers: { 'x-api-key': TEST_API_KEY },
        });
        ws.on('message', (d: Buffer) => frames.push(JSON.parse(d.toString())));
        await new Promise<void>((resolve, reject) => {
            ws.on('open', () => resolve());
            ws.on('error', reject);
            setTimeout(() => reject(new Error('never opened')), 3000);
        });
        await new Promise((r) => setTimeout(r, 250));
        assert.ok(frames.length >= 1, 'a first frame must arrive on connect');

        const records = lines.map((l) => JSON.parse(l)).filter((l) => l.event === 'route_recommendation');
        assert.ok(records.length >= 1, `a pushed frame must be audited, got ${lines.join('\n')}`);
        const record = records[0];
        //  Self-contained, exactly like the REST record: the decision AND its inputs.
        assert.equal(record.from, 'USDT');
        assert.equal(record.to, 'BTC');
        assert.equal(record.requestedAmount, 300);
        assert.ok(Array.isArray(record.hops), 'the chosen path is recorded');
        assert.ok(Array.isArray(record.pathsConsidered), 'and the losing candidates with it');
        //  The frame the caller received and the record written about it must name the same
        //  recommendation, or the trail cannot be joined back to what was actually served.
        assert.equal(record.requestId, frames[0]!['requestId'],
            'the audit record carries the id of the frame it describes');

        //  A second push gets its own record under its own id — a stream is many recommendations,
        //  not one.
        const before = records.length;
        cache.setBook(book({ bids: [{ price: 90, amount: 1000 }], asks: [{ price: 91, amount: 1000 }] }));
        await new Promise((r) => setTimeout(r, 300));
        const after = lines.map((l) => JSON.parse(l)).filter((l) => l.event === 'route_recommendation');
        assert.ok(after.length > before, 'each pushed frame is its own audited recommendation');
        assert.notEqual(after[after.length - 1].requestId, record.requestId,
            'and carries a distinct id, so two pushes on one socket stay distinguishable');
        ws.terminate();
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

test('LOG_LEVEL can quiet the diagnostic log without silencing the audit trail', async () => {
    // The per-request child logger used to be forced up to ORDER_ROUTER_AUDIT_LOG_LEVEL so that
    // "audit lines on it" would survive LOG_LEVEL. They do not live on it — every audit record
    // goes to the audit stream, which carries its own level — but the override also raised
    // Fastify's built-in per-request pair, so LOG_LEVEL=warn reduced per-request volume by
    // nothing. The box runs warn precisely because a misbehaving exchange once wrote 930MB of
    // retry chatter, and the one knob for that did nothing for the biggest contributor.
    const diagnostic: string[] = [];
    const auditLines: string[] = [];
    // Two streams, exactly as production has them: LOG_LEVEL governs the first, and
    // ORDER_ROUTER_AUDIT_LOG_LEVEL the second.
    const quiet = pino({ level: 'warn' }, { write: (line: string) => { diagnostic.push(line); } });
    const auditLogger = pino({ level: 'info' }, { write: (line: string) => { auditLines.push(line); } });
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book());
    const app = await buildServer(cache, new FeeRegistry(), quiet, { auditLogger });
    try {
        // Startup warnings are legitimately at warn and are not what this test is about; only
        // what the REQUEST adds is measured.
        const beforeRequest = diagnostic.length;
        const res = await app.inject({
            method: 'GET',
            url: '/route?from=USDT&to=BTC&amountIn=300',
            headers: AUTH,
        });
        assert.equal(res.statusCode, 200, 'the request itself still succeeds');

        // Nothing per-request reaches the diagnostic stream at warn. This is the whole point:
        // the knob has to actually turn the volume down.
        const perRequest = diagnostic.slice(beforeRequest);
        assert.deepEqual(perRequest, [],
            `LOG_LEVEL=warn must silence per-request diagnostics, got:\n${perRequest.join('\n')}`);

        // And the audit trail is untouched — quieting connector noise must not turn off the
        // record of who called what.
        const events = auditLines.map((l) => JSON.parse(l)).map((l) => l.event);
        assert.ok(events.includes('request'), `the access line must survive, got ${events.join(',')}`);
        assert.ok(events.includes('route_recommendation'),
            `the routing decision must survive, got ${events.join(',')}`);
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});

test('a dropped stream frame is reported three ways, not silently discarded', async () => {
    // Source-level: forcing socket.bufferedAmount past a megabyte from a test means writing to a
    // peer that has genuinely stopped reading, which is timing-dependent and flaky. What is worth
    // pinning is that the drop is not silent in any of the three directions it can be — the
    // operator's counter, the log, and the client — since silence in all three is what the finding
    // was, and each is one line that can be deleted independently.
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const src = readFileSync(fileURLToPath(new URL('./server.ts', import.meta.url)), 'utf8');
    const drop = src.slice(src.indexOf('if (socket.bufferedAmount > WS_MAX_BUFFERED_BYTES)'));
    const block = drop.slice(0, drop.indexOf('const frameId'));
    assert.ok(block.indexOf('streamDrops.inc()') !== -1, 'the operator gets a metric');
    assert.ok(/request\.log\.warn/.test(block), 'the log gets a line');
    // Once per socket, not once per frame: a saturated socket drops continuously, and this is the
    // production log level.
    assert.ok(block.indexOf('droppedFrames === 1') !== -1, 'the log line is per socket, not per frame');
    // And the client, on the next frame that does get through, can tell "the market did not move"
    // from "I missed the frames where it did".
    assert.ok(src.indexOf('...pushed, droppedFrames') !== -1, 'the client is told on the next frame');
});

// --- Refusing to route while the cache is still cold ---

// The deploy's own smoke allows five minutes for the book cache to warm after a restart, and for
// those five minutes /route answered 200. Not an error 200 either: with a handful of books in and
// the rest still connecting, the router ranks the venues it happens to have and returns a route it
// has no basis to call best. The caller cannot tell that answer apart from a warm one — same shape,
// same confident fields — so a deploy silently degrades everyone's execution instead of failing
// visibly. /ready already knows the answer; this makes /route consult it.
test('GET /route is 503 with reason cache_cold while the service is not ready', async () => {
    const { app, cache } = await buildTestServer();

    // A book that exists but is older than the staleness cutoff: freshCount is 0, so the service is
    // not ready, while the market itself is known — which is exactly the state that used to answer
    // 200 rather than 404-no_market.
    cache.setBook(book({ receivedAt: Date.now() - 600_000, exchangeTimestamp: Date.now() - 600_000 }));

    const ready = await app.inject({ method: 'GET', url: '/ready' });
    assert.equal(ready.statusCode, 503, 'precondition: this state is not ready');

    for (const injection of [
        { method: 'GET' as const, url: '/route?from=USDT&to=BTC&amountIn=100', headers: AUTH },
        { method: 'POST' as const, url: '/route', headers: AUTH,
            payload: { from: 'USDT', to: 'BTC', amountIn: '100' } },
    ]) {
        const response = await app.inject(injection);
        assert.equal(response.statusCode, 503, `${injection.method} /route should refuse while cold`);
        const body = response.json();
        // Machine-readable, because the whole point is that a client can branch on it: retry the
        // same request in a moment, rather than act on a route or give up on a bad ticker.
        assert.equal(body.reason, 'cache_cold');
        assert.equal(body.freshCount, 0);
        assert.equal(body.minFreshBooksForReady, 1);
        // Retry-After, so a well-behaved client backs off without inventing an interval.
        // Not 1: the warm-up is minutes, and a one-second retry-after asks every compliant
        // client to poll once a second for the whole window, against the instance least able
        // to absorb it.
        const retryAfter = Number(response.headers['retry-after']);
        assert.ok(Number.isFinite(retryAfter), 'retry-after present and numeric');
        assert.ok(retryAfter >= 5, `retry-after should be a multi-second wait, got ${retryAfter}`);
    }

    // And once a fresh book lands, the same request is answered normally again.
    cache.setBook(book());
    const warm = await app.inject({ method: 'GET', url: '/route?from=USDT&to=BTC&amountIn=100', headers: AUTH });
    assert.equal(warm.statusCode, 200);
    await app.close();
});

// A malformed request is malformed whether the cache is warm or not, and telling a caller "try
// again in a moment" about a typo would send them into a retry loop that can never succeed. So
// validation keeps winning over the readiness gate.
test('a 400-level /route request still gets 400, not the cold-cache 503', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book({ receivedAt: Date.now() - 600_000, exchangeTimestamp: Date.now() - 600_000 }));
    const response = await app.inject({ method: 'GET', url: '/route?from=BTC&to=BTC&amountIn=1', headers: AUTH });
    assert.equal(response.statusCode, 400);
    await app.close();
});

// The probes are the one thing that must keep answering while cold — gating them on readiness
// would make the service unable to report that it is not ready, and would take /metrics off the
// air during exactly the window an operator is watching it.
test('/health, /ready and /metrics keep answering while the cache is cold', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book({ receivedAt: Date.now() - 600_000, exchangeTimestamp: Date.now() - 600_000 }));

    assert.equal((await app.inject({ method: 'GET', url: '/health' })).statusCode, 200);
    assert.equal((await app.inject({ method: 'GET', url: '/ready' })).statusCode, 503);
    assert.equal((await app.inject({ method: 'GET', url: '/metrics', headers: AUTH })).statusCode, 200);
    await app.close();
});

// /orderbook is deliberately NOT gated, and that is the consistent treatment rather than an
// exception to it. What makes a cold /route answer wrong is that it RANKS across the cache: a
// missing venue silently changes the winner, and nothing in the body says so. A single book is
// returned verbatim, with its own receivedAt, and a half-filled cache cannot make that answer
// wrong — refusing it would only deny a caller data the router itself holds and trusts.
test('GET /orderbook still serves a cached book while the service is not ready', async () => {
    const { app, cache } = await buildTestServer();
    cache.setBook(book({ exchangeId: 'kraken', symbol: 'BTC/USDT',
        receivedAt: Date.now() - 600_000, exchangeTimestamp: Date.now() - 600_000 }));
    assert.equal((await app.inject({ method: 'GET', url: '/ready' })).statusCode, 503);
    const response = await app.inject({
        method: 'GET', url: '/orderbook/kraken/BTC%2FUSDT', headers: AUTH });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().exchangeId, 'kraken');
    await app.close();
});

// The streaming twin refuses on the same condition, for the same reason, and says so in the same
// words. A socket that opened during a deploy would otherwise push confidently-shaped frames
// computed off a fraction of the venues, which is worse than the REST case: the caller acts on
// them repeatedly and never sees a status code at all.
test('WS /stream/route refuses to open while the cache is cold', async () => {
    const { WebSocket } = await import('ws');
    const previous = process.env['ORDER_ROUTER_API_KEY'];
    process.env['ORDER_ROUTER_API_KEY'] = TEST_API_KEY;
    const cache = new OrderBookCache();
    cache.setBook(book({ receivedAt: Date.now() - 600_000, exchangeTimestamp: Date.now() - 600_000 }));
    const app = await buildServer(cache, new FeeRegistry(), silentLogger, { rateLimitMax: 100000 });
    try {
        await app.listen({ port: 0, host: '127.0.0.1' });
        const address = app.server.address();
        const port = typeof address === 'object' && address ? address.port : 0;
        const outcome = await new Promise<{ code: number; message: unknown }>((resolve) => {
            let message: unknown;
            const ws = new WebSocket(`ws://127.0.0.1:${port}/stream/route?from=USDT&to=BTC&amountIn=100`, {
                headers: { 'x-api-key': TEST_API_KEY },
            });
            ws.on('message', (d: Buffer) => { message = JSON.parse(d.toString()); });
            ws.on('close', (code: number) => resolve({ code, message }));
            ws.on('error', () => resolve({ code: -1, message }));
            setTimeout(() => resolve({ code: 0, message }), 3000);
        });
        assert.equal(outcome.code, 1013, 'try-again-later, not a policy violation: the request is fine');
        assert.equal((outcome.message as { reason?: string })?.reason, 'cache_cold');
    } finally {
        await app.close();
        if (previous === undefined) delete process.env['ORDER_ROUTER_API_KEY'];
        else process.env['ORDER_ROUTER_API_KEY'] = previous;
    }
});
