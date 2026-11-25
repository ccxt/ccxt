import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTelemetry } from '../../src/telemetry/index.js';
import { prepareEvent, type EventContext } from '../../src/telemetry/analytics.js';
import { telemetryConfigFromEnv, DEFAULT_EXPECTED_ERROR_CODES } from '../../src/telemetry/config.js';
import { loadConfig } from '../../src/config.js';
import { startHostedServer } from '../../src/server.js';
import { createVenue } from '../helpers/venue.js';
import { callTool, waitFor } from '../helpers/harness.js';
import { startSink } from './helpers.js';

// live_update telemetry: one view polls every few seconds, so its successes are sampled
// (LIVE_TELEMETRY_SAMPLE_RATE) and its request lines are debug, while errors are always kept.
// Checked end to end against a local PostHog capture sink, never the real PostHog.

// built at run time so no literal project token ever sits in the repository
const FAKE_TOKEN = [ 'ph', 'c_', 'offlineLiveTelemetryToken0123456789' ].join ('');

function context (overrides: Partial<EventContext> = {}): EventContext {
    return { 'sampleRate': 1, 'liveSampleRate': 0, 'expectedErrorCodes': new Set (DEFAULT_EXPECTED_ERROR_CODES), 'appRoot': '/app', ...overrides };
}

function toolCall (name: string, isError: boolean, requestId: string): any {
    const text = isError ? '{"ok":false,"error":{"code":"LIVE_UNAVAILABLE"}}' : 'live_update chart alpha: 3 candles from stream, next in 2000 ms';
    return { 'event': '$mcp_tool_call', 'distinct_id': 'd', 'properties': { '$mcp_tool_name': name, '$mcp_is_error': isError, 'request_id': requestId, '$mcp_response': { 'content': [ { 'type': 'text', text } ] } } };
}

test ('prepareEvent: live_update successes use the live rate, its errors and other tools are unaffected', () => {
    for (let i = 0; i < 20; i++) {
        assert.equal (prepareEvent (toolCall ('live_update', false, 'r' + i), context ()), null);
    }
    const error: any = prepareEvent (toolCall ('live_update', true, 'e1'), context ());
    assert.ok (error !== null);
    assert.equal (error.properties.error_code, 'LIVE_UNAVAILABLE');
    const kept: any = prepareEvent (toolCall ('live_update', false, 'k1'), context ({ 'liveSampleRate': 1 }));
    assert.equal (kept.properties.sample_rate, 1);
    const other: any = prepareEvent (toolCall ('get_tickers', false, 'o1'), context ());
    assert.equal (other.properties.sample_rate, 1, 'normal tools keep POSTHOG_SAMPLE_RATE');
    // the documented default, and the variable
    assert.equal (telemetryConfigFromEnv ({}).liveSampleRate, 0.01);
    assert.equal (telemetryConfigFromEnv ({ 'LIVE_TELEMETRY_SAMPLE_RATE': '0.5' }).liveSampleRate, 0.5);
    assert.ok (DEFAULT_EXPECTED_ERROR_CODES.includes ('LIVE_UNAVAILABLE'));
    // with a 1% rate, a long run of polls keeps about 1%: deterministic per request id
    let sent = 0;
    for (let i = 0; i < 5000; i++) {
        if (prepareEvent (toolCall ('live_update', false, 'poll-' + i), context ({ 'liveSampleRate': 0.01 })) !== null) {
            sent += 1;
        }
    }
    assert.ok (sent > 20 && sent < 90, 'kept ' + sent + ' of 5000');
});

test ('live telemetry end to end: no per-poll event or info log line, errors kept, hub stats at info (local sink)', async () => {
    const sink = await startSink ();
    const lines: string[] = [];
    const telemetry = await createTelemetry ({
        'token': FAKE_TOKEN,
        'host': sink.url,
        'clientHashSecret': 'offline-test-secret',
        'deployment': 'test',
        'liveSampleRate': 0,
        'sampleRate': 1,
        'stdout': (line) => lines.push (line),
    });
    const venue = createVenue ([ 'alpha', 'beta' ]);
    const config = loadConfig ({ 'PORT': '0', 'HOST': '127.0.0.1', 'EXCHANGES': 'alpha,beta', 'MARKETS_REFRESH_MINUTES': '0', 'LIVE_STATS_INTERVAL_MS': '0' }, 'test');
    const server = await startHostedServer ({ config, 'ccxt': venue.module, telemetry });
    try {
        await waitFor (() => server.hosted.ready (), 5000);
        const url = server.url.href;
        for (let i = 0; i < 8; i++) {
            const poll = await callTool (url, 'live_update', { 'view': 'tickers', 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] });
            assert.equal (poll.result.isError, undefined);
            await new Promise ((resolve) => setTimeout (resolve, 5));
        }
        const bad = await callTool (url, 'live_update', { 'view': 'chart', 'exchange': 'alpha', 'symbol': 'NOPE/USDT' });
        assert.equal (bad.envelope.error.code, 'BAD_SYMBOL');
        const normal = await callTool (url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ], 'context': 'price check' });
        assert.equal (normal.result.isError, undefined);
        server.runtime.live.logStats ();
    } finally {
        venue.release ();
        await server.stop ('test');
        await sink.close ();
    }
    const calls = sink.events ().filter ((event) => event.event === '$mcp_tool_call');
    const liveCalls = calls.filter ((event) => event.properties.$mcp_tool_name === 'live_update');
    assert.equal (liveCalls.filter ((event) => event.properties.$mcp_is_error !== true).length, 0, 'no success event per poll');
    assert.equal (liveCalls.filter ((event) => event.properties.$mcp_is_error === true).length, 1, 'the failed poll is kept');
    assert.equal (liveCalls[0].properties.error_code, 'BAD_SYMBOL');
    assert.equal (calls.filter ((event) => event.properties.$mcp_tool_name === 'get_tickers').length, 1, 'other tools are sampled as before');
    const parsed = lines.map ((line) => JSON.parse (line));
    const requestLines = parsed.filter ((line) => line.msg === 'request' && line.tool_name === 'live_update');
    assert.equal (requestLines.filter ((line) => line.level === 'info').length, 0, 'no per-poll request line at info');
    assert.equal (requestLines.length, 1, 'only the failed poll is logged (warn); successes are debug, below LOG_LEVEL=info');
    assert.equal (requestLines[0].level, 'warn');
    const stats = parsed.filter ((line) => line.msg === 'live hub stats');
    assert.equal (stats.length, 1);
    assert.equal (stats[0].level, 'info');
    assert.ok (stats[0].polls_stream + stats[0].polls_rest + stats[0].polls_cache >= 8);
    assert.ok (sink.logRecords ().some ((record: any) => JSON.stringify (record.record?.body ?? '').includes ('live hub stats')), 'mirrored to PostHog Logs');
    // nothing about symbols or clients in the stats line
    assert.ok (!JSON.stringify (stats[0]).includes ('BTC/USDT'));
});

test ('live telemetry: only this server\'s own budget refusals of a poll are lowered to debug; an upstream RATE_LIMITED stays warn', async () => {
    const lines: string[] = [];
    const telemetry = await createTelemetry ({ 'deployment': 'test', 'clientHashSecret': 'offline-test-secret', 'stdout': (line) => lines.push (line) });
    try {
        const base = { 'status': 200, 'mcpMethod': 'tools/call', 'toolName': 'live_update', 'ok': false, 'errorCode': 'RATE_LIMITED', 'durationMs': 1 };
        telemetry.requestDone ({ ...base, 'requestId': 'own-limit', 'limitedBy': 'client' });
        telemetry.requestDone ({ ...base, 'requestId': 'own-busy', 'limitedBy': 'busy' });
        // the exchange throttling this server (ccxt RateLimitExceeded), or the guard's full queue
        telemetry.requestDone ({ ...base, 'requestId': 'upstream' });
        telemetry.requestDone ({ ...base, 'requestId': 'served', 'ok': true, 'errorCode': undefined });
    } finally {
        await telemetry.shutdown (1000);
    }
    const requests = lines.map ((line) => JSON.parse (line)).filter ((line) => line.msg === 'request');
    assert.equal (requests.length, 1, JSON.stringify (requests));
    assert.equal (requests[0].level, 'warn');
    assert.equal (requests[0].error_code, 'RATE_LIMITED');
    assert.equal (requests[0].limited_by, undefined);
});
