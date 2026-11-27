import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startHarness, callTool, rpc, waitFor } from './helpers/harness.js';
import { createVenue, RateLimitExceeded, symbolsFor } from './helpers/venue.js';

// What one caller (or many) can make the server do to the exchanges and to other callers.
// Every caller shares the server's IP addresses at each exchange, so these are the tests
// that keep those addresses from being rate-limited or banned.

const GENEROUS = { 'RATE_LIMIT_BURST': '100000', 'RATE_LIMIT_PER_MINUTE': '100000', 'MAX_CONCURRENT_REQUESTS': '1000' };

test ('abuse: 200 concurrent identical get_tickers make exactly one upstream request', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        harness.venue.control.latencyMs = 300;
        const results = await Promise.all (Array.from ({ 'length': 200 }, () => callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] })));
        assert.equal (harness.venue.upstreamCalls ('fetchTicker'), 1);
        for (const result of results) {
            assert.equal (result.status, 200);
            assert.equal (result.envelope.ok, true);
            assert.equal (result.envelope.data[0].last, 100);
        }
        await waitFor (() => harness.telemetry.summaries.filter ((summary) => summary.toolName === 'get_tickers').length === 200, 2000);
        const outcomes = harness.telemetry.summaries.filter ((summary) => summary.toolName === 'get_tickers').map ((summary) => summary.cache);
        assert.equal (outcomes.filter ((outcome) => outcome === 'miss').length, 1);
        assert.equal (outcomes.filter ((outcome) => outcome === 'coalesced' || outcome === 'hit').length, 199);
        // inside the TTL the next identical call is a cache hit, still no upstream request
        const again = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] });
        assert.equal (again.envelope.ok, true);
        assert.equal (harness.venue.upstreamCalls ('fetchTicker'), 1);
    } finally {
        await harness.close ();
    }
});

test ('abuse: distinct symbols beyond the queue bound fail fast with RATE_LIMITED; queued work ends at the deadline', async () => {
    const harness = await startHarness ({ ...GENEROUS, 'UPSTREAM_CONCURRENCY_PER_EXCHANGE': '2', 'UPSTREAM_QUEUE_PER_EXCHANGE': '4', 'REQUEST_DEADLINE_MS': '1500' });
    try {
        harness.venue.control.hold = true; // the exchange never answers until released
        const symbols = symbolsFor (20);
        const started = Date.now ();
        const timings: number[] = [];
        const results = await Promise.all (symbols.map (async (symbol) => {
            const result = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ symbol ] });
            timings.push (Date.now () - started);
            return result;
        }));
        const codes = results.map ((result) => result.envelope?.error?.code);
        const limited = results.filter ((result) => result.envelope?.error?.code === 'RATE_LIMITED');
        const timedOut = results.filter ((result) => result.envelope?.error?.code === 'TIMEOUT');
        assert.equal (limited.length, 14, JSON.stringify (codes));
        assert.equal (timedOut.length, 6, JSON.stringify (codes));
        for (const result of limited) {
            assert.equal (result.result.isError, true);
            assert.equal (result.envelope.error.retryable, true);
            assert.ok (result.envelope.error.retryAfterSeconds >= 1);
        }
        // a TOOL error at the deadline, not a hung socket, and nobody waited past it
        assert.ok (Math.max (...timings) < 1500 + 1000, 'slowest answer took ' + Math.max (...timings) + ' ms');
        // the rejected ones answered immediately
        const fast = timings.slice ().sort ((a, b) => a - b).slice (0, 14);
        assert.ok (Math.max (...fast) < 1000, 'fast rejections took up to ' + Math.max (...fast) + ' ms');
        // only the two admitted requests ever reached the exchange; the four that waited in
        // the queue were dropped at the deadline and never sent
        harness.venue.release ();
        await new Promise ((resolve) => setTimeout (resolve, 100));
        assert.equal (harness.venue.upstreamCalls ('fetchTicker'), 2);
    } finally {
        await harness.close ();
    }
});

test ('abuse: a client that disconnects while queued never causes an upstream request', async () => {
    const harness = await startHarness ({ ...GENEROUS, 'UPSTREAM_CONCURRENCY_PER_EXCHANGE': '1', 'UPSTREAM_QUEUE_PER_EXCHANGE': '4' });
    try {
        harness.venue.control.hold = true;
        const first = callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] });
        await waitFor (() => harness.venue.control.calls.length === 1, 2000);
        const controller = new AbortController ();
        const second = fetch (harness.url, {
            'method': 'POST',
            'signal': controller.signal,
            'headers': { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream' },
            'body': JSON.stringify ({ 'jsonrpc': '2.0', 'id': 2, 'method': 'tools/call', 'params': { 'name': 'get_tickers', 'arguments': { 'exchange': 'alpha', 'symbols': [ 'ETH/USDT' ] } } }),
        }).catch ((error) => error);
        await waitFor (() => harness.server.runtime.guard.queueDepth ('alpha').waiting === 1, 2000);
        controller.abort ();
        await second;
        await waitFor (() => harness.server.runtime.guard.queueDepth ('alpha').waiting === 0, 2000);
        harness.venue.release ();
        assert.equal ((await first).envelope.ok, true);
        await new Promise ((resolve) => setTimeout (resolve, 50));
        assert.deepEqual (harness.venue.control.calls.map ((call) => call.args[0]), [ 'BTC/USDT' ]);
    } finally {
        await harness.close ();
    }
});

test ('abuse: one tool call cannot fan out past the per-call upstream budget', async () => {
    const venue = createVenue ([ 'alpha', 'beta' ]);
    venue.control.noBatch.add ('alpha');
    const harness = await startHarness ({ ...GENEROUS, 'MAX_UPSTREAM_CALLS_PER_TOOL': '10' }, { venue });
    try {
        const { envelope } = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': symbolsFor (12) });
        assert.equal (envelope.error.code, 'RATE_LIMITED');
        assert.match (envelope.error.hint, /fewer symbols/);
        assert.equal (venue.upstreamCalls ('fetchTicker'), 10);
        // with a batch endpoint the same request is one upstream call
        const batched = await callTool (harness.url, 'get_tickers', { 'exchange': 'beta', 'symbols': symbolsFor (12) });
        assert.equal (batched.envelope.ok, true);
        assert.equal (venue.upstreamCalls ('fetchTickers'), 1);
    } finally {
        await harness.close ();
    }
});

test ('abuse: the breaker opens after upstream rate-limit errors, stops calling, and recovers through one probe', async () => {
    const harness = await startHarness ({ ...GENEROUS, 'BREAKER_THRESHOLD': '3', 'BREAKER_COOLDOWN_MS': '1000' });
    try {
        harness.venue.control.failWith = (exchange) => ((exchange === 'alpha') ? new RateLimitExceeded ('alpha 429 Too Many Requests') : undefined);
        for (const symbol of symbolsFor (3)) {
            const { envelope } = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ symbol ] });
            assert.equal (envelope.error.code, 'RATE_LIMITED');
        }
        assert.equal (harness.server.runtime.guard.breakerState ('alpha'), 'open');
        const callsWhenOpened = harness.venue.control.calls.length;
        const refused = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'ETH/USDT' ] });
        assert.equal (refused.envelope.error.code, 'EXCHANGE_UNAVAILABLE');
        assert.equal (refused.envelope.error.retryable, true);
        assert.ok (refused.envelope.error.retryAfterSeconds >= 1);
        // never retried automatically, and nothing reached the exchange while open
        assert.equal (harness.venue.control.calls.length, callsWhenOpened);
        // another exchange is unaffected
        assert.equal ((await callTool (harness.url, 'get_tickers', { 'exchange': 'beta', 'symbols': [ 'ETH/USDT' ] })).envelope.ok, true);
        // /readyz shows it
        const ready: any = await (await fetch (harness.origin + '/readyz')).json ();
        assert.equal (ready.exchanges.alpha.breaker, 'open');
        // after the cooldown one probe goes through; it succeeds and the breaker closes
        harness.venue.control.failWith = undefined;
        await new Promise ((resolve) => setTimeout (resolve, 1100));
        assert.equal (harness.server.runtime.guard.breakerState ('alpha'), 'half-open');
        const probe = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'ETH/USDT' ] });
        assert.equal (probe.envelope.ok, true);
        assert.equal (harness.server.runtime.guard.breakerState ('alpha'), 'closed');
        assert.equal ((await callTool (harness.url, 'get_orderbook', { 'exchange': 'alpha', 'symbol': 'ETH/USDT' })).envelope.ok, true);
    } finally {
        await harness.close ();
    }
});

test ('abuse: per-client limit keys on the proxy-set X-Real-IP; spoofed X-Forwarded-For does not bypass it', async () => {
    const harness = await startHarness ({ 'TRUSTED_PROXY': 'nginx-x-real-ip', 'RATE_LIMIT_BURST': '3', 'RATE_LIMIT_PER_MINUTE': '1' });
    try {
        const call = (headers: Record<string, string>) => callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, headers);
        for (let i = 0; i < 3; i++) {
            const { status } = await call ({ 'x-real-ip': '203.0.113.5', 'x-forwarded-for': '10.0.0.' + i });
            assert.equal (status, 200);
        }
        const limited = await call ({ 'x-real-ip': '203.0.113.5', 'x-forwarded-for': '198.51.100.99' });
        assert.equal (limited.status, 429);
        assert.ok (Number (limited.headers.get ('retry-after')) >= 1);
        // another client is unaffected
        assert.equal ((await call ({ 'x-real-ip': '203.0.113.6' })).status, 200);
        // a forged openai/subject from outside OpenAI's ranges does not mint a new bucket
        const forged = await rpc (harness.url, 'tools/call', { 'name': 'get_tickers', 'arguments': { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, '_meta': { 'openai/subject': 'fresh-subject' } }, { 'x-real-ip': '203.0.113.5' });
        assert.equal (forged.status, 429);
    } finally {
        await harness.close ();
    }
});

test ('abuse: with TRUSTED_PROXY=none, client headers are ignored entirely', async () => {
    const harness = await startHarness ({ 'TRUSTED_PROXY': 'none', 'RATE_LIMIT_BURST': '2', 'RATE_LIMIT_PER_MINUTE': '1' });
    try {
        const statuses: number[] = [];
        for (let i = 0; i < 3; i++) {
            statuses.push ((await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, { 'x-real-ip': '203.0.113.' + i })).status);
        }
        assert.deepEqual (statuses, [ 200, 200, 429 ]);
    } finally {
        await harness.close ();
    }
});

test ('abuse: Anthropic egress addresses get the host budget; OpenAI subjects get their own buckets', async () => {
    const harness = await startHarness ({ 'TRUSTED_PROXY': 'nginx-x-real-ip', 'RATE_LIMIT_BURST': '3', 'RATE_LIMIT_PER_MINUTE': '1', 'HOST_RATE_LIMIT_BURST': '50', 'HOST_RATE_LIMIT_PER_MINUTE': '1' });
    try {
        for (let i = 0; i < 20; i++) {
            const { status } = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, { 'x-real-ip': '160.79.104.10' });
            assert.equal (status, 200, 'anthropic call ' + i);
        }
        assert.equal ((await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, { 'x-real-ip': '153.61.210.1' })).status, 200);
        // from an OpenAI connector address, openai/subject is the key and has the client budget
        const openaiIp = '100.31.168.162';
        const asSubject = (subject: string) => rpc (harness.url, 'tools/call', { 'name': 'get_tickers', 'arguments': { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, '_meta': { 'openai/subject': subject } }, { 'x-real-ip': openaiIp });
        for (let i = 0; i < 3; i++) {
            assert.equal ((await asSubject ('user-a')).status, 200);
        }
        assert.equal ((await asSubject ('user-a')).status, 429);
        assert.equal ((await asSubject ('user-b')).status, 200);
        // an ordinary address gets the small budget
        for (let i = 0; i < 3; i++) {
            await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, { 'x-real-ip': '192.0.2.44' });
        }
        assert.equal ((await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, { 'x-real-ip': '192.0.2.44' })).status, 429);
    } finally {
        await harness.close ();
    }
});

test ('abuse: the global concurrency cap answers 503 + Retry-After instead of queueing', async () => {
    const harness = await startHarness ({ ...GENEROUS, 'MAX_CONCURRENT_REQUESTS': '2' });
    try {
        harness.venue.control.hold = true;
        const held = [ 'BTC/USDT', 'ETH/USDT' ].map ((symbol) => callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ symbol ] }));
        await waitFor (() => harness.server.hosted.inflight () === 2, 2000);
        const third = await rpc (harness.url, 'tools/list');
        assert.equal (third.status, 503);
        assert.equal (third.headers.get ('retry-after'), '1');
        harness.venue.release ();
        for (const result of await Promise.all (held)) {
            assert.equal (result.envelope.ok, true);
        }
        await waitFor (() => harness.server.hosted.inflight () === 0, 2000);
        assert.equal ((await rpc (harness.url, 'tools/list')).status, 200);
    } finally {
        await harness.close ();
    }
});
