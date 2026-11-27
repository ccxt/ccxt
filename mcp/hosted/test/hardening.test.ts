import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startHarness, callTool, rpc } from './helpers/harness.js';
import { ExchangeNotAvailable } from './helpers/venue.js';
import { trippingKind } from '../src/guard/breaker.js';

// Regression tests for the review of the first hosted build: inputs that are prototype
// member names, and what they could do to the process and to the shared breaker.

const GENEROUS = { 'RATE_LIMIT_BURST': '100000', 'RATE_LIMIT_PER_MINUTE': '100000', 'MAX_CONCURRENT_REQUESTS': '1000' };
const PROTOTYPE_KEYS = [ '__proto__', 'constructor', 'toString', 'valueOf', 'hasOwnProperty' ];

test ('hardening: a prototype-named symbol in get_tickers neither pollutes Object.prototype nor breaks later requests', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        const { envelope } = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT', ...PROTOTYPE_KEYS ] });
        assert.equal (envelope.ok, false);
        assert.equal (envelope.error.code, 'BAD_SYMBOL');
        assert.equal (({} as any).symbol, undefined, 'Object.prototype gained no property');
        const listed = await rpc (harness.url, 'tools/list');
        assert.equal (listed.status, 200);
        assert.ok (Array.isArray (listed.body?.result?.tools));
        assert.equal ((await callTool (harness.url, 'list_exchanges', {})).envelope.ok, true);
        const health = await fetch (harness.origin + '/healthz');
        assert.equal (health.status, 200);
    } finally {
        await harness.close ();
    }
});

test ('hardening: prototype-named symbols and timeframes are BAD_SYMBOL / BAD_TIMEFRAME and never reach the exchange', async () => {
    const harness = await startHarness ({ ...GENEROUS, 'BREAKER_THRESHOLD': '3' });
    try {
        // were they sent, the exchange would answer like bitstamp (404) or kraken's WAF (403)
        harness.venue.control.failWith = () => new ExchangeNotAvailable ('alpha GET https://x 403 Forbidden');
        const before = harness.venue.control.calls.length;
        for (const symbol of PROTOTYPE_KEYS) {
            for (const [ tool, args ] of [
                [ 'get_orderbook', { 'exchange': 'alpha', symbol } ],
                [ 'get_trades', { 'exchange': 'alpha', symbol } ],
                [ 'get_ohlcv', { 'exchange': 'alpha', symbol, 'timeframe': '1h' } ],
                [ 'show_orderbook', { 'exchange': 'alpha', symbol } ],
                [ 'show_chart', { 'exchange': 'alpha', symbol, 'timeframe': '1h' } ],
            ] as const) {
                const { result } = await callTool (harness.url, tool, args);
                assert.equal (result.isError, true, tool + ' ' + symbol);
                assert.match (result.content[0].text, /BAD_SYMBOL/, tool + ' ' + symbol);
            }
            const ticker = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ symbol ] });
            assert.equal (ticker.envelope.error.code, 'BAD_SYMBOL', 'get_tickers ' + symbol);
        }
        for (const timeframe of PROTOTYPE_KEYS) {
            for (const tool of [ 'get_ohlcv', 'show_chart' ]) {
                const { result } = await callTool (harness.url, tool, { 'exchange': 'alpha', 'symbol': 'BTC/USDT', timeframe });
                assert.equal (result.isError, true, tool + ' ' + timeframe);
                assert.match (result.content[0].text, /BAD_TIMEFRAME/, tool + ' ' + timeframe);
            }
        }
        assert.equal (harness.venue.control.calls.length, before, 'nothing went upstream');
        assert.equal (harness.server.runtime.guard.breakerState ('alpha'), 'closed');
    } finally {
        await harness.close ();
    }
});

test ('hardening: the guarded instance itself refuses prototype-named symbols and timeframes', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        const exchange = await harness.server.runtime.exchanges.getPublic ('alpha');
        for (const symbol of PROTOTYPE_KEYS) {
            await assert.rejects (exchange.fetchOrderBook (symbol), (error: any) => error.code === 'BAD_SYMBOL', symbol);
            await assert.rejects (exchange.fetchTickers ([ 'BTC/USDT', symbol ]), (error: any) => error.code === 'BAD_SYMBOL', symbol);
            await assert.rejects (exchange.fetchOHLCV ('BTC/USDT', symbol), (error: any) => error.code === 'BAD_TIMEFRAME', symbol);
        }
        assert.equal (harness.venue.upstreamCalls (), 0);
        // real symbols, market ids and the expired-option spelling still pass through
        assert.equal ((await exchange.fetchOrderBook ('BTC/USDT')).symbol, 'BTC/USDT');
    } finally {
        await harness.close ();
    }
});

test ('hardening: a 404 says nothing about our addresses and never counts toward the breaker', () => {
    assert.equal (trippingKind (new ExchangeNotAvailable ('bitstamp GET https://x 404 Not Found')), undefined);
    assert.equal (trippingKind (new ExchangeNotAvailable ('kraken GET https://x 403 Forbidden')), 'counted');
    assert.equal (trippingKind (new ExchangeNotAvailable ('okx GET https://x 503 Service Unavailable')), 'counted');
});

test ('hardening: /healthz and /readyz fail once Object.prototype has been polluted', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        assert.equal ((await fetch (harness.origin + '/healthz')).status, 200);
        Object.defineProperty (Object.prototype, 'pollutedByTest', { 'value': 1, 'configurable': true, 'enumerable': false, 'writable': true });
        try {
            assert.equal ((await fetch (harness.origin + '/healthz')).status, 503);
            assert.equal ((await fetch (harness.origin + '/readyz')).status, 503);
        } finally {
            delete (Object.prototype as any).pollutedByTest;
        }
        assert.equal ((await fetch (harness.origin + '/healthz')).status, 200);
    } finally {
        await harness.close ();
    }
});

test ('hardening: a call landing on the open -> half-open boundary cannot wedge the breaker', async () => {
    const { UpstreamGuard } = await import ('../src/guard/upstream.js');
    const { RateLimitExceeded } = await import ('./helpers/venue.js');
    // every clock read can be scripted: the race needs the two reads call () used to make to
    // straddle the cooldown's end
    let now = 1000;
    const script: number[] = [];
    const clock = () => (script.length > 0) ? script.shift () as number : now;
    const guard = new UpstreamGuard ({ 'maxConcurrentPerExchange': 2, 'maxQueuedPerExchange': 2, 'maxUpstreamPerCall': 5, 'cacheMaxEntries': 10, 'now': clock, 'breaker': { 'threshold': 1, 'windowMs': 1000, 'cooldownMs': 500, 'maxCooldownMs': 500 } });
    guard.register ('x', 100);
    let upstream = 0;
    await assert.rejects (guard.call ('x', 'k1', 0, async () => {
        upstream += 1;
        throw new RateLimitExceeded ('x 429');
    }));
    assert.equal (guard.breakerState ('x'), 'open');
    const openedUntil = now + 500;
    // the first clock read sees "open" (1 ms before the end), the next one is past the end:
    // whatever that call is told, it must not leave the breaker unable to recover
    script.push (openedUntil - 1, openedUntil);
    now = openedUntil;
    await guard.call ('x', 'k2', 0, async () => {
        upstream += 1;
        return 'boundary';
    }).catch ((error: any) => assert.equal (error.code, 'EXCHANGE_UNAVAILABLE'));
    script.length = 0;
    now += 60000;
    const value = await guard.call ('x', 'k3', 0, async () => {
        upstream += 1;
        return 'fresh';
    });
    assert.equal (value, 'fresh', 'a later call goes through as the probe');
    assert.equal (guard.breakerState ('x'), 'closed');
    assert.equal (await guard.call ('x', 'k4', 0, async () => 'later'), 'later');
});

test ('hardening: IPv6 clients are rate-limited per /64, so rotating addresses inside one prefix gains nothing', async () => {
    const { identifyClient, RateLimiter } = await import ('../src/limits.js');
    const { CidrSet } = await import ('../src/ip.js');
    const ranges = { 'anthropic': new CidrSet ([]), 'openai': new CidrSet ([]) };
    const key = (ip: string) => identifyClient (ip, undefined, ranges).key;
    assert.equal (key ('2001:db8:1:2::1'), key ('2001:db8:1:2::3c'));
    assert.equal (key ('2001:db8:1:2::1'), key ('2001:0db8:0001:0002:ffff::9'));
    assert.equal (key ('2001:db8:1:2::1'), key ('2001:db8:1:2:aaaa:bbbb:cccc:dddd'));
    assert.notEqual (key ('2001:db8:1:2::1'), key ('2001:db8:1:3::1'));
    assert.equal (key ('::1'), key ('::2'));
    assert.equal (key ('203.0.113.7'), 'ip:203.0.113.7', 'IPv4 stays per address');
    assert.notEqual (key ('203.0.113.7'), key ('203.0.113.8'));
    const limiter = new RateLimiter (1000, () => 0);
    const budget = { 'perMinute': 60, 'burst': 30 };
    const outcomes = { 'ok': 0, 'limited': 0 };
    for (let i = 1; i <= 60; i++) {
        const retry = limiter.take (key ('2001:db8:1:2::' + i.toString (16)), budget, 1);
        outcomes[(retry === undefined) ? 'ok' : 'limited'] += 1;
    }
    assert.deepEqual (outcomes, { 'ok': 30, 'limited': 30 });
    assert.equal (limiter.take (key ('2001:db8:9:9::1'), budget, 1), undefined, 'another /64 has its own budget');
});

test ('hardening: one client can hold only a few listen streams open; a closed one frees its slot', async () => {
    const harness = await startHarness ({ ...GENEROUS, 'MAX_LISTENS_PER_CLIENT': '2' });
    const headers = { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream', 'mcp-protocol-version': '2026-07-28', 'mcp-method': 'subscriptions/listen' };
    const meta = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientInfo': { 'name': 'listen-test', 'version': '0' }, 'io.modelcontextprotocol/clientCapabilities': {} };
    const open = async (id: number) => {
        const controller = new AbortController ();
        const response = await fetch (harness.url, { 'method': 'POST', headers, 'signal': controller.signal, 'body': JSON.stringify ({ 'jsonrpc': '2.0', id, 'method': 'subscriptions/listen', 'params': { '_meta': meta, 'notifications': { 'toolsListChanged': true } } }) });
        return { response, controller };
    };
    const streams: { response: Response, controller: AbortController }[] = [];
    try {
        for (const id of [ 1, 2 ]) {
            const stream = await open (id);
            streams.push (stream);
            assert.equal (stream.response.status, 200, 'listen ' + id);
        }
        const refused = await open (3);
        assert.equal (refused.response.status, 429);
        assert.equal (refused.response.headers.get ('retry-after'), '60');
        assert.match (await refused.response.text (), /listen/);
        // ordinary requests are unaffected
        assert.equal ((await rpc (harness.url, 'tools/list')).status, 200);
        // closing one frees a slot
        streams[0].controller.abort ();
        await new Promise ((resolve) => setTimeout (resolve, 200));
        const again = await open (4);
        streams.push (again);
        assert.equal (again.response.status, 200);
    } finally {
        for (const stream of streams) {
            stream.controller.abort ();
        }
        await harness.close ();
    }
});

test ('hardening: a client that trickles its request body is cut off at the read timeout', async () => {
    const net = await import ('node:net');
    const harness = await startHarness ({ ...GENEROUS, 'REQUEST_READ_TIMEOUT_MS': '1500' });
    try {
        const url = new URL (harness.origin);
        const started = Date.now ();
        const answer = await new Promise<string> ((resolve) => {
            const socket = net.connect (Number (url.port), url.hostname, () => {
                socket.write ('POST /mcp HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/json\r\nContent-Length: 1000\r\n\r\n{"a":"');
            });
            let text = '';
            socket.on ('data', (chunk) => {
                text += chunk.toString ();
            });
            socket.on ('close', () => resolve (text));
            socket.on ('error', () => resolve (text));
            setTimeout (() => socket.destroy (), 10000).unref ();
        });
        const elapsed = Date.now () - started;
        assert.ok (elapsed < 6000, 'closed after ' + elapsed + ' ms');
        assert.match (answer, /^HTTP\/1\.1 408/);
    } finally {
        await harness.close ();
    }
});

test ('hardening: account stubs answer ACCOUNT_REQUIRED for any arguments, not a schema error', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        for (const tool of [ 'get_balance', 'get_orders', 'get_positions', 'get_my_trades' ]) {
            for (const args of [ {}, { 'exchange': 'coinbase' }, { 'account': 'main', 'symbol': 'BTC/USDT', 'context': 'user asked' } ]) {
                const { result, envelope } = await callTool (harness.url, tool, args);
                assert.equal (result.isError, true);
                assert.equal (envelope?.error?.code, 'ACCOUNT_REQUIRED', tool + ' ' + JSON.stringify (args) + ': ' + result.content[0].text.slice (0, 120));
            }
        }
        assert.equal (harness.venue.upstreamCalls (), 0);
    } finally {
        await harness.close ();
    }
});

test ('hardening: with analytics off a strict tool still accepts the `context` a cached tools/list may require', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        const { envelope } = await callTool (harness.url, 'list_exchanges', { 'context': 'user wants exchanges' });
        assert.equal (envelope?.ok, true);
        const tickers = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ], 'context': 'price check' });
        assert.equal (tickers.envelope?.ok, true);
        // any other unknown key is still refused
        const typo = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ], 'symbl': 'x' });
        assert.equal (typo.result.isError, true);
        assert.match (typo.result.content[0].text, /symbl/);
    } finally {
        await harness.close ();
    }
});

test ('hardening: 2026-07-28 list and view results carry public cache hints; 2025-era results carry none', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        const meta = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientInfo': { 'name': 'cache-test', 'version': '0' }, 'io.modelcontextprotocol/clientCapabilities': {} };
        const modern = async (method: string, params: Record<string, any> = {}) => {
            const response = await fetch (harness.url, {
                'method': 'POST',
                'headers': { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream', 'mcp-protocol-version': '2026-07-28', 'mcp-method': method, ...((params.name !== undefined || params.uri !== undefined) ? { 'mcp-name': String (params.name ?? params.uri) } : {}) },
                'body': JSON.stringify ({ 'jsonrpc': '2.0', 'id': 1, method, 'params': { ...params, '_meta': meta } }),
            });
            return ((await response.json ()) as any).result;
        };
        for (const method of [ 'server/discover', 'tools/list', 'resources/list' ]) {
            const result = await modern (method);
            assert.equal (result.ttlMs, 60000, method);
            assert.equal (result.cacheScope, 'public', method);
        }
        const tools = await modern ('tools/list');
        const uri = tools.tools.find ((tool: any) => tool.name === 'show_chart')._meta.ui.resourceUri;
        const read = await modern ('resources/read', { uri });
        assert.equal (read.ttlMs, 86400000);
        assert.equal (read.cacheScope, 'public');
        const legacy = await rpc (harness.url, 'tools/list');
        assert.equal (legacy.body.result.ttlMs, undefined);
        assert.equal (legacy.body.result.cacheScope, undefined);
    } finally {
        await harness.close ();
    }
});

test ('hardening: caller text in exchange, tool name or method never reaches the request log line', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        await callTool (harness.url, 'get_orderbook', { 'exchange': 'password PASSWORD-EXCH-7878 10.1.2.3', 'symbol': 'BTC/USDT' });
        await rpc (harness.url, 'tools/call', { 'name': 'my email is a@b.com 10.9.8.7', 'arguments': {} });
        await rpc (harness.url, 'free text method 10.0.0.1', {});
        await callTool (harness.url, 'get_orderbook', { 'exchange': 'password', 'symbol': 'BTC/USDT' });
        // summaries are written once the response body has been read
        await new Promise ((resolve) => setTimeout (resolve, 100));
        const json = JSON.stringify (harness.telemetry.summaries);
        for (const text of [ 'PASSWORD-EXCH', '10.1.2.3', 'a@b.com', '10.9.8.7', 'free text', '"password"' ]) {
            assert.ok (!json.includes (text), text + ' in ' + json);
        }
        const tools = harness.telemetry.summaries.map ((summary) => summary.toolName);
        assert.ok (tools.includes ('unknown'));
        assert.ok (tools.includes ('get_orderbook'));
        // a real call still names its exchange
        await callTool (harness.url, 'get_orderbook', { 'exchange': 'alpha', 'symbol': 'BTC/USDT' });
        await new Promise ((resolve) => setTimeout (resolve, 100));
        assert.equal (harness.telemetry.summaries.at (-1)?.exchange, 'alpha');
    } finally {
        await harness.close ();
    }
});
