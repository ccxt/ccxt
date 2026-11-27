import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startHarness, callTool, rpc, waitFor } from './helpers/harness.js';
import { createVenue, RateLimitExceeded } from './helpers/venue.js';
import { loadConfig } from '../src/config.js';
import { UpstreamGuard } from '../src/guard/upstream.js';
import { HostedToolProfile, HOSTED_INSTRUCTIONS } from '../src/profile.js';
import { createRuntime } from '../src/runtime.js';
import { buildServer } from '../../ts/factory.js';
import { recordingTelemetry } from './helpers/harness.js';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';

// live_update on the hosted server: the shared hub over HostedExchanges' public stream
// instances, REST through the guard, its own rate-limit bucket, and shutdown. Fake venue only.

const CHART = { 'view': 'chart', 'exchange': 'alpha', 'symbol': 'BTC/USDT', 'timeframe': '1m' };
const BOOK = { 'view': 'orderbook', 'exchange': 'alpha', 'symbol': 'BTC/USDT', 'depth': 5 };
const BOARD = { 'view': 'tickers', 'exchange': 'alpha', 'symbols': [ 'BTC/USDT', 'ETH/USDT' ] };

async function untilStream (url: string, args: any): Promise<any> {
    const started = Date.now ();
    while (Date.now () - started < 3000) {
        const response = await callTool (url, 'live_update', args);
        if (response.result?.structuredContent?.source === 'stream') {
            return response;
        }
        await new Promise ((resolve) => setTimeout (resolve, 10));
    }
    throw new Error ('never served from a stream');
}

test ('live: first poll from REST through the guard, then from the shared stream with no upstream request', async () => {
    const h = await startHarness ();
    try {
        const first = await callTool (h.url, 'live_update', BOOK);
        assert.equal (first.status, 200);
        assert.equal (first.result.isError, undefined, first.result?.content?.[0]?.text);
        assert.equal (first.result.structuredContent.source, 'rest');
        assert.equal (first.result.structuredContent.orderbook.bids.length, 2, 'the fake REST book has two levels');
        assert.equal (h.venue.upstreamCalls ('fetchOrderBook'), 1);
        // an identical poll within the cache TTL is answered by the guard's cache
        const again = await callTool (h.url, 'live_update', BOOK);
        assert.ok ([ 'cache', 'stream' ].includes (again.result.structuredContent.source), again.result.structuredContent.source);
        const live = await untilStream (h.url, BOOK);
        const upstream = h.venue.control.calls.length;
        assert.equal (live.result.structuredContent.orderbook.bids.length, 5);
        assert.equal (live.result.structuredContent.nextPollMs, 2000);
        for (let i = 0; i < 5; i++) {
            const poll = await callTool (h.url, 'live_update', BOOK);
            assert.equal (poll.result.structuredContent.source, 'stream');
        }
        assert.equal (h.venue.control.calls.length, upstream, 'polls served from the hub make no upstream request');
        // the stream instance: keyless, markets shared from the warm venue (no load of its own)
        const instance = h.venue.control.ws.instances[0];
        assert.equal (h.venue.control.ws.instances.length, 1);
        assert.equal (instance.newUpdates, false);
        assert.equal (instance.apiKey, undefined);
        assert.ok (Object.keys (instance.markets).length > 0);
        assert.ok (!h.venue.control.loads.some ((load: any) => load.reload === false && h.venue.control.loads.filter ((other: any) => other.exchange === load.exchange && other.reload === false).length > 1), 'no second markets load');
        assert.equal (h.server.runtime.live.stats ().streams, 1);
    } finally {
        await h.close ();
    }
});

test ('live: chart since-merging and a tickers subset, over HTTP', async () => {
    const h = await startHarness ();
    try {
        const latest = await callTool (h.url, 'live_update', CHART);
        assert.equal (latest.result.structuredContent.source, 'rest');
        assert.equal (latest.result.structuredContent.chart.candles.length, 200);
        // the fake stream holds the last 10 one-minute candles; since = the 8th
        await waitFor (() => h.server.runtime.live.stats ().streams === 1, 2000);
        const open = Math.floor (Date.now () / 60000) * 60000;
        const live = await untilStream (h.url, { ...CHART, 'since': open - 2 * 60000 });
        assert.deepEqual (live.result.structuredContent.chart.candles.map ((row: number[]) => row[0]), [ open - 120000, open - 60000, open ]);
        const board = await untilStream (h.url, BOARD);
        assert.deepEqual (Object.keys (board.result.structuredContent.tickers).sort (), [ 'BTC/USDT', 'ETH/USDT' ]);
        assert.ok (board.result.structuredContent.tickers['ETH/USDT'].last > 200);
        const lines = h.telemetry.summaries.filter ((summary) => summary.toolName === 'live_update');
        assert.ok (lines.length >= 3);
        assert.ok (lines.every ((summary) => summary.ok === true));
    } finally {
        await h.close ();
    }
});

test ('live: errors — BAD_SYMBOL, BAD_TIMEFRAME, EXCHANGE_WARMING, strict schema', async () => {
    const venue = createVenue ([ 'alpha', 'beta' ]);
    venue.control.loadLatencyMs['beta'] = 60000;
    const h = await startHarness ({ 'READY_GRACE_MS': '0' }, { venue });
    try {
        const code = async (args: any): Promise<string> => {
            const response = await callTool (h.url, 'live_update', args);
            assert.equal (response.result.isError, true);
            return response.envelope?.error?.code ?? 'VALIDATION';
        };
        assert.equal (await code ({ ...CHART, 'symbol': 'NOPE/USDT' }), 'BAD_SYMBOL');
        assert.equal (await code ({ ...CHART, 'symbol': '__proto__' }), 'BAD_SYMBOL');
        assert.equal (await code ({ ...CHART, 'timeframe': '7m' }), 'BAD_TIMEFRAME');
        assert.equal (await code ({ ...CHART, 'exchange': 'beta' }), 'EXCHANGE_WARMING');
        assert.equal (await code ({ ...CHART, 'exchange': 'gamma' }), 'UNKNOWN_EXCHANGE');
        assert.equal (await code ({ ...CHART, 'params': { 'x': 1 } }), 'VALIDATION');
        // a view never sends `context`; it is accepted when present
        const withContext = await callTool (h.url, 'live_update', { ...BOOK, 'context': 'refresh' });
        assert.equal (withContext.result.isError, undefined);
        assert.equal (h.venue.control.ws.instances.filter ((instance: any) => instance.id === 'beta').length, 0, 'no stream for a cold venue');
    } finally {
        await h.close ();
    }
});

test ('live: its own rate-limit bucket — live polls cannot spend the tool budget, nor tool calls the live budget', async () => {
    const h = await startHarness ({ 'RATE_LIMIT_PER_MINUTE': '1', 'RATE_LIMIT_BURST': '2', 'LIVE_RATE_LIMIT_PER_MINUTE': '1', 'LIVE_RATE_LIMIT_BURST': '3' });
    try {
        for (let i = 0; i < 3; i++) {
            assert.equal ((await callTool (h.url, 'live_update', BOARD)).status, 200, 'live poll ' + i);
        }
        // the live bucket is spent: answered in-band as the tool's RATE_LIMITED (a view waits it
        // out; an HTTP error would read as "this host cannot poll" and stop the view for good)
        const limitedPoll = await callTool (h.url, 'live_update', BOARD);
        assert.equal (limitedPoll.status, 200);
        assert.equal (limitedPoll.result.isError, true);
        assert.equal (limitedPoll.envelope.error.code, 'RATE_LIMITED');
        assert.ok (limitedPoll.envelope.error.retryAfterSeconds >= 1);
        assert.equal (limitedPoll.headers.get ('retry-after'), String (limitedPoll.envelope.error.retryAfterSeconds));
        // the tool-call budget is untouched by the polls
        assert.equal ((await callTool (h.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] })).status, 200);
        assert.equal ((await callTool (h.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] })).status, 200);
        assert.equal ((await callTool (h.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] })).status, 429);
        const limited = h.telemetry.summaries.find ((summary) => summary.toolName === 'live_update' && summary.ok === false);
        assert.equal (limited?.errorCode, 'RATE_LIMITED');
    } finally {
        await h.close ();
    }
    // and the other way round: a spent tool budget leaves the views live
    const other = await startHarness ({ 'RATE_LIMIT_PER_MINUTE': '1', 'RATE_LIMIT_BURST': '1' });
    try {
        assert.equal ((await callTool (other.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] })).status, 200);
        assert.equal ((await callTool (other.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] })).status, 429);
        assert.equal ((await callTool (other.url, 'live_update', BOARD)).status, 200);
    } finally {
        await other.close ();
    }
});

test ('live: repeated stream failures pause streaming on the exchange and polls go to REST; throttling errors feed the breaker', async () => {
    const h = await startHarness ({ 'LIVE_WS_FAILURE_THRESHOLD': '2', 'BREAKER_THRESHOLD': '2' });
    try {
        h.venue.control.ws.fail = () => new RateLimitExceeded ('alpha 429 Too Many Requests');
        await callTool (h.url, 'live_update', BOOK);
        await waitFor (() => h.server.runtime.live.stats ().disabledExchanges.includes ('alpha'), 5000);
        assert.equal (h.server.runtime.guard.breakerState ('alpha'), 'open', 'stream throttling counts against the breaker');
        const paused = await callTool (h.url, 'live_update', BOOK);
        // the breaker is open: REST is refused too, with the usual retry-after
        assert.equal (paused.envelope?.error?.code, 'EXCHANGE_UNAVAILABLE');
        assert.ok (paused.envelope?.error?.retryAfterSeconds > 0);
        assert.equal (h.server.runtime.live.stats ().streams, 0);
    } finally {
        await h.close ();
    }
});

test ('live: an exchange without a ccxt.pro class is served from REST', async () => {
    const venue = createVenue ([ 'alpha', 'beta' ]);
    venue.control.ws.noWs.add ('alpha');
    const h = await startHarness ({}, { venue });
    try {
        await callTool (h.url, 'live_update', BOOK);
        await new Promise ((resolve) => setTimeout (resolve, 30));
        const again = await callTool (h.url, 'live_update', BOOK);
        assert.ok ([ 'rest', 'cache' ].includes (again.result.structuredContent.source));
        assert.equal (h.server.runtime.live.stats ().streams, 0);
    } finally {
        await h.close ();
    }
});

test ('live: stopping the server closes every stream instance', async () => {
    const h = await startHarness ();
    await untilStream (h.url, BOARD);
    await untilStream (h.url, BOOK);
    assert.ok (h.venue.control.ws.instances.length >= 1);
    await h.close ();
    assert.ok (h.venue.control.ws.instances.every ((instance: any) => instance.closedWs === true));
    assert.equal (h.server.runtime.live.stats ().streams, 0);
    const watches = h.venue.control.ws.watches.length;
    await new Promise ((resolve) => setTimeout (resolve, 30));
    assert.ok (h.venue.control.ws.watches.length - watches <= 3, 'no stream loop runs after the stop');
});

test ('live: tools/list is identical with and without hub activity', async () => {
    const h = await startHarness ();
    try {
        const before = await rpc (h.url, 'tools/list', {});
        await untilStream (h.url, BOARD);
        const during = await rpc (h.url, 'tools/list', {});
        assert.deepEqual (during.body.result, before.body.result);
        const tool = before.body.result.tools.find ((entry: any) => entry.name === 'live_update');
        assert.deepEqual (tool._meta, { 'ui': { 'visibility': [ 'app' ] }, 'openai/visibility': 'private', 'openai/widgetAccessible': true, 'securitySchemes': [ { 'type': 'noauth' } ] });
        assert.equal (tool.inputSchema.additionalProperties, false, 'strict');
        assert.equal (tool.inputSchema.properties.context?.type, 'string');
        assert.ok (!(tool.inputSchema.required ?? []).includes ('context'));
    } finally {
        await h.close ();
    }
});

test ('live: with analytics injecting `context`, live_update still declares its own optional one', async () => {
    const config = loadConfig ({ 'EXCHANGES': 'alpha,beta' }, 'test');
    const runtime = createRuntime (config, createVenue ().module, recordingTelemetry ());
    const { server } = buildServer (runtime.shared, { 'profile': new HostedToolProfile (() => false), 'hosted': true, 'instructions': HOSTED_INSTRUCTIONS });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    await server.connect (serverTransport);
    const client = new Client ({ 'name': 'live-profile', 'version': '0' }, { 'versionNegotiation': { 'mode': 'legacy' } });
    await client.connect (clientTransport);
    const { tools } = await client.listTools ();
    await client.close ();
    await runtime.live.close ();
    const live: any = tools.find ((tool) => tool.name === 'live_update');
    const tickers: any = tools.find ((tool) => tool.name === 'get_tickers');
    assert.equal (live.inputSchema.properties.context?.type, 'string', 'the analytics SDK skips a tool that declares context');
    assert.equal (tickers.inputSchema.properties.context, undefined, 'other tools leave it to the SDK');
});

test ('guard: stream opens are refused while the breaker is not closed and rate-limited per exchange', () => {
    let clock = 1000000;
    const guard = new UpstreamGuard ({
        'maxConcurrentPerExchange': 1,
        'maxQueuedPerExchange': 1,
        'maxUpstreamPerCall': 5,
        'cacheMaxEntries': 10,
        'streamOpensPerMinute': 2,
        'breaker': { 'threshold': 1, 'windowMs': 60000, 'cooldownMs': 30000, 'maxCooldownMs': 60000 },
        'now': () => clock,
    });
    assert.equal (guard.admitStream ('alpha'), undefined);
    assert.equal (guard.admitStream ('alpha'), undefined);
    assert.equal (guard.admitStream ('alpha'), 'rate');
    assert.equal (guard.admitStream ('beta'), undefined, 'per exchange');
    clock += 60001;
    assert.equal (guard.admitStream ('alpha'), undefined);
    // a dropped socket says nothing about our addresses; throttling does
    guard.reportStreamError ('alpha', new Error ('socket hang up'));
    assert.equal (guard.breakerState ('alpha'), 'closed');
    assert.equal (guard.pressure ('alpha'), 1);
    guard.reportStreamError ('alpha', new RateLimitExceeded ('alpha 429'));
    assert.equal (guard.breakerState ('alpha'), 'open');
    assert.equal (guard.admitStream ('alpha'), 'breaker');
    assert.equal (guard.pressure ('alpha'), 3);
    clock += 30001;
    assert.equal (guard.breakerState ('alpha'), 'half-open');
    assert.equal (guard.admitStream ('alpha'), 'breaker', 'the half-open probe stays with REST');
});

test ('config: live variables', () => {
    const defaults = loadConfig ({}, 'test');
    assert.equal (defaults.live.enabled, true);
    assert.equal (defaults.live.idleMs, 60000);
    assert.equal (defaults.live.maxStreams, 200);
    assert.equal (defaults.live.maxStreamsPerExchange, 50);
    assert.equal (defaults.rateLimit.livePerMinute, 120);
    assert.equal (defaults.rateLimit.liveHostPerMinute, 12000);
    const set = loadConfig ({ 'LIVE_STREAMS': 'off', 'LIVE_IDLE_MS': '90000', 'LIVE_MAX_STREAMS': '7', 'LIVE_MAX_STREAMS_PER_EXCHANGE': '3', 'LIVE_MAX_STREAMS_PER_CLIENT': '2', 'LIVE_RATE_LIMIT_PER_MINUTE': '9' }, 'test');
    assert.equal (set.live.enabled, false);
    assert.equal (set.live.idleMs, 90000);
    assert.equal (set.live.maxStreamsPerClient, 2);
    assert.equal (defaults.live.maxStreamsPerClient, 30);
    assert.equal (defaults.live.maxOpensPerClientPerMinute, 20);
    assert.equal (set.live.maxStreams, 7);
    assert.equal (set.live.maxStreamsPerExchange, 3);
    assert.equal (set.rateLimit.livePerMinute, 9);
    assert.throws (() => loadConfig ({ 'LIVE_STREAMS': 'maybe' }, 'test'), /LIVE_STREAMS/);
    assert.throws (() => loadConfig ({ 'LIVE_IDLE_MS': '5' }, 'test'), /LIVE_IDLE_MS/);
});

test ('live: the in-band RATE_LIMITED refusal is an ordinary tool result for the official client in both eras', async () => {
    const { Client, StreamableHTTPClientTransport } = await import ('@modelcontextprotocol/client');
    const h = await startHarness ({ 'LIVE_RATE_LIMIT_PER_MINUTE': '1', 'LIVE_RATE_LIMIT_BURST': '1' });
    try {
        for (const mode of [ 'legacy', 'auto' ] as const) {
            const client = new Client ({ 'name': 'live-limit', 'version': '0' }, { 'versionNegotiation': { mode } } as any);
            await client.connect (new StreamableHTTPClientTransport (new URL (h.url)));
            const results: any[] = [];
            for (let i = 0; i < 2; i++) {
                results.push (await client.callTool ({ 'name': 'live_update', 'arguments': BOARD }));
            }
            const refused = results.find ((result) => result.isError === true);
            assert.ok (refused !== undefined, mode + ': one poll is refused');
            const parsed = JSON.parse (refused.content[0].text);
            assert.equal (parsed.error.code, 'RATE_LIMITED', mode);
            assert.ok (parsed.error.retryAfterSeconds >= 1, mode);
            await client.close ();
        }
    } finally {
        await h.close ();
    }
});

test ('config: live settings that contradict each other fail at start-up instead of being clamped', () => {
    // a cadence above the 30 s every view is held to
    assert.throws (() => loadConfig ({ 'LIVE_POLL_STREAM_MS': '40000' }, 'test'), /LIVE_POLL_STREAM_MS must be at most 30000/);
    assert.throws (() => loadConfig ({ 'LIVE_POLL_REST_MS': '60000' }, 'test'), /LIVE_POLL_REST_MS must be at most 30000/);
    // a lease shorter than the slowest poll: the stream would expire between two polls
    assert.throws (() => loadConfig ({ 'LIVE_IDLE_MS': '30000' }, 'test'), /LIVE_IDLE_MS must be at least 45000/);
    assert.throws (() => loadConfig ({ 'LIVE_IDLE_MS': '5000' }, 'test'), /LIVE_IDLE_MS/);
    // a per-exchange or per-client cap above the global one
    assert.throws (() => loadConfig ({ 'LIVE_MAX_STREAMS': '10', 'LIVE_MAX_STREAMS_PER_EXCHANGE': '20' }, 'test'), /LIVE_MAX_STREAMS_PER_EXCHANGE \(20\) must not exceed LIVE_MAX_STREAMS \(10\)/);
    assert.throws (() => loadConfig ({ 'LIVE_MAX_STREAMS': '10', 'LIVE_MAX_STREAMS_PER_EXCHANGE': '5', 'LIVE_MAX_STREAMS_PER_CLIENT': '11' }, 'test'), /LIVE_MAX_STREAMS_PER_CLIENT/);
    assert.equal (loadConfig ({ 'LIVE_POLL_REST_MS': '30000', 'LIVE_IDLE_MS': '45000' }, 'test').live.restPollMs, 30000);
});

test ('live: the in-band refusal carries the 2026-07-28 server info, and is counted in the hub stats', async () => {
    const h = await startHarness ({ 'LIVE_RATE_LIMIT_PER_MINUTE': '1', 'LIVE_RATE_LIMIT_BURST': '1' });
    try {
        const modern = { 'mcp-protocol-version': '2026-07-28' };
        await callTool (h.url, 'live_update', BOARD, modern);
        const refused = await callTool (h.url, 'live_update', BOARD, modern);
        assert.equal (refused.envelope.error.code, 'RATE_LIMITED');
        assert.equal (refused.result.resultType, 'complete');
        assert.deepEqual (refused.result._meta?.['io.modelcontextprotocol/serverInfo'], { 'name': 'ccxt-mcp', 'version': 'test' });
        // a 2025-era client gets neither
        const legacy = await callTool (h.url, 'live_update', BOARD);
        assert.equal (legacy.envelope.error.code, 'RATE_LIMITED');
        assert.equal (legacy.result._meta, undefined);
        assert.equal (legacy.result.resultType, undefined);
        assert.equal (h.server.runtime.live.stats ().refused.client, 2);
        const summaries = h.telemetry.summaries.filter ((summary) => summary.toolName === 'live_update' && summary.errorCode === 'RATE_LIMITED');
        assert.ok (summaries.length === 2 && summaries.every ((summary) => summary.limitedBy === 'client'), JSON.stringify (summaries));
    } finally {
        await h.close ();
    }
});

test ('live: while the server drains, a poll is answered in-band (the view keeps polling), other calls get the 503', async () => {
    const h = await startHarness ();
    try {
        await h.server.hosted.drain (100);
        const poll = await callTool (h.url, 'live_update', BOARD);
        assert.equal (poll.status, 200);
        assert.equal (poll.result.isError, true);
        assert.equal (poll.envelope.error.code, 'LIVE_UNAVAILABLE');
        assert.equal (poll.envelope.error.retryable, true);
        assert.equal (poll.envelope.error.retryAfterSeconds, 5);
        assert.equal (poll.headers.get ('retry-after'), '5');
        const other = await callTool (h.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] });
        assert.equal (other.status, 503);
        assert.equal (h.server.runtime.live.stats ().refused.draining, 1);
    } finally {
        await h.close ();
    }
});

test ('live: one client (an IP address, a ChatGPT user) can keep only LIVE_MAX_STREAMS_PER_CLIENT streams alive', async () => {
    const h = await startHarness ({ 'LIVE_MAX_STREAMS_PER_CLIENT': '1' });
    try {
        const first = await callTool (h.url, 'live_update', BOARD);
        assert.equal (first.result.isError, undefined);
        assert.equal (Object.keys (first.result.structuredContent.tickers).length, 2, 'answered in full');
        assert.equal (h.server.runtime.live.stats ().streams, 1, 'the second symbol opened no stream');
        assert.equal (h.server.runtime.live.stats ().fallbacks.quota, 1);
    } finally {
        await h.close ();
    }
});
