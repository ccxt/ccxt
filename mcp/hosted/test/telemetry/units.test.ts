import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSecretKey, looksLikeSecret, scrub, capJson, sanitizeParameters, relativizePath, stripPathsInText, REDACTED } from '../../src/telemetry/redact.js';
import { sampledIn, errorCodeOf, exchangeOf, prepareEvent, type EventContext } from '../../src/telemetry/analytics.js';
import { sanitizeLogAttributes, levelEnabled } from '../../src/telemetry/logs.js';
import { telemetryConfigFromEnv, DEFAULT_EXPECTED_ERROR_CODES } from '../../src/telemetry/config.js';
import { endpointKind } from '../../src/telemetry/transport.js';

test ('isSecretKey: every ccxt credential name and the usual spellings, not their look-alikes', () => {
    for (const key of [ 'apiKey', 'api_key', 'API-KEY', 'x-api-key', 'secret', 'apiSecret', 'uid', 'login', 'password', 'twofa', 'privateKey', 'private_key', 'walletAddress', 'token', 'accessToken', 'passphrase', 'Authorization', 'cookie', 'signature', 'mnemonic', 'otp', 'key' ]) {
        assert.ok (isSecretKey (key), key);
    }
    for (const key of [ 'exchange', 'symbol', 'symbols', 'limit', 'timeframe', 'guid', 'fluid', 'monkey', 'keys', 'since', 'marketType' ]) {
        assert.ok (!isSecretKey (key), key);
    }
});

test ('looksLikeSecret: key formats whatever the key name', () => {
    assert.ok (looksLikeSecret ([ 'ph', 'c_', 'abcdefghijklmnopqrstuvwxyz' ].join ('')));
    assert.ok (looksLikeSecret ('sk-abcdefghijklmnop'));
    assert.ok (looksLikeSecret ('-----BEGIN EC PRIVATE KEY-----'));
    assert.ok (looksLikeSecret ('Bearer abcdefghijkl'));
    assert.ok (looksLikeSecret ('0x' + 'ab'.repeat (32)));
    assert.ok (!looksLikeSecret ('0x' + 'ab'.repeat (20)), 'a wallet address is public');
    assert.ok (!looksLikeSecret ('BTC/USDT'));
});

test ('scrub: nested and array redaction, caps, cycles, odd values', () => {
    const cyclic: any = { 'a': 1 };
    cyclic.self = cyclic;
    const out: any = scrub ({
        'apiKey': 'x', 'list': [ { 'secret': 'y' }, [ { 'Password': 'z' } ] ], 'long': 'a'.repeat (1000),
        'many': Array.from ({ 'length': 30 }, (_, i) => i), 'cyclic': cyclic, 'fn': () => 1, 'big': BigInt (5),
        'deep': { 'a': { 'b': { 'c': { 'd': { 'e': { 'f': { 'g': 1 } } } } } } },
    });
    assert.equal (out.apiKey, REDACTED);
    assert.equal (out.list[0].secret, REDACTED);
    assert.equal (out.list[1][0].Password, REDACTED);
    assert.ok (out.long.length < 300);
    assert.equal (out.many.length, 21);
    assert.equal (out.many[20], '[10 more]');
    assert.equal (out.cyclic.self, '[cycle]');
    assert.equal (out.fn, undefined);
    assert.equal (out.big, '5');
    assert.equal (out.deep.a.b.c.d.e, '[depth]');
    const wide: Record<string, number> = {};
    for (let i = 0; i < 60; i++) {
        wide['k' + i] = i;
    }
    assert.equal ((scrub (wide) as any)['$more_keys'], 10);
});

test ('capJson and sanitizeParameters: bounded size, request _meta removed', () => {
    const small = { 'a': 1 };
    assert.equal (capJson (small, 100), small);
    const capped: any = capJson ({ 'a': 'x'.repeat (5000) }, 2048);
    assert.equal (capped.$truncated, true);
    assert.ok (capped.preview.length <= 2048);
    const request = { 'request': { 'method': 'tools/call', 'params': { 'name': 't', 'arguments': { 'exchange': 'kraken', 'secret': 's' }, '_meta': { 'openai/subject': 'user-123' } } } };
    const safe: any = sanitizeParameters (request, 2048);
    assert.equal (safe.request.params._meta, undefined);
    assert.equal (safe.request.params.arguments.secret, REDACTED);
    assert.equal (request.request.params._meta['openai/subject'], 'user-123', 'the input is not mutated');
});

test ('paths: stack frames and messages lose absolute paths, URLs survive', () => {
    assert.equal (relativizePath ('/srv/app/node_modules/x/y.js', '/srv/app'), 'node_modules/x/y.js');
    assert.equal (relativizePath ('file:///srv/app/src/a.ts', '/srv/app'), 'src/a.ts');
    assert.equal (relativizePath ('/home/user/other/b.ts', '/srv/app'), 'b.ts');
    assert.equal (relativizePath ('node:internal/x', '/srv/app'), 'node:internal/x');
    assert.equal (relativizePath ('C:\\Users\\me\\app\\c.ts', '/srv/app'), 'c.ts');
    assert.equal (stripPathsInText ('failed at /home/user/app/x.ts:3:4 (see /tmp/y.log)'), 'failed at x.ts:3:4 (see y.log)');
    assert.equal (stripPathsInText ('GET https://api.kraken.com/0/public/Ticker failed'), 'GET https://api.kraken.com/0/public/Ticker failed');
    assert.equal (stripPathsInText ('BTC/USDT and 1/2'), 'BTC/USDT and 1/2');
});

test ('sampledIn: deterministic, bounded, roughly the asked rate', () => {
    assert.equal (sampledIn ('a', 1), true);
    assert.equal (sampledIn ('a', 0), false);
    let kept = 0;
    for (let i = 0; i < 10000; i++) {
        const key = 'req-' + i;
        const first = sampledIn (key, 0.25);
        assert.equal (sampledIn (key, 0.25), first);
        kept += first ? 1 : 0;
    }
    assert.ok (kept > 2250 && kept < 2750, 'kept ' + kept + ' of 10000 at 0.25');
});

test ('errorCodeOf and exchangeOf: read from the envelope and the arguments only', () => {
    assert.equal (errorCodeOf ({ '$mcp_error_type': 'validation' }), 'VALIDATION');
    assert.equal (errorCodeOf ({ '$mcp_response': { 'content': [ { 'type': 'text', 'text': '{"ok":false,"error":{"code":"RATE_LIMITED"}}' } ] } }), 'RATE_LIMITED');
    assert.equal (errorCodeOf ({ '$exception_list': [ { 'value': 'Input validation error: bad' } ] }), 'VALIDATION');
    assert.equal (errorCodeOf ({ '$mcp_error_message': 'TypeError: x' }), undefined);
    assert.equal (errorCodeOf ({ '$mcp_error_message': '{"error":{"code":"lower case"}}' }), undefined);
    assert.equal (exchangeOf ({ 'request': { 'params': { 'arguments': { 'exchange': 'kraken' } } } }), 'kraken');
    assert.equal (exchangeOf ({ 'request': { 'params': { 'arguments': { 'exchange': 'not an id; drop table' } } } }), undefined);
});

function context (overrides: Partial<EventContext> = {}): EventContext {
    return { 'sampleRate': 1, 'expectedErrorCodes': new Set (DEFAULT_EXPECTED_ERROR_CODES), 'appRoot': '/srv/app', ...overrides };
}

test ('prepareEvent: expected exceptions dropped, unexpected kept, success response dropped', () => {
    const exception = (code: string) => ({ 'event': '$exception', 'distinct_id': 'd', 'properties': { '$exception_list': [ { 'value': '{"ok":false,"error":{"code":"' + code + '"}}' } ] } });
    for (const code of [ 'RATE_LIMITED', 'BAD_SYMBOL', 'ACCOUNT_REQUIRED', 'VALIDATION' ]) {
        assert.equal (prepareEvent (exception (code), context ()), null, code);
    }
    for (const code of [ 'INTERNAL_ERROR', 'EXCHANGE_ERROR', 'UNKNOWN_OUTCOME', 'SOMETHING_NEW' ]) {
        assert.notEqual (prepareEvent (exception (code), context ()), null, code);
    }
    const success: any = prepareEvent ({ 'event': '$mcp_tool_call', 'distinct_id': 'd', 'properties': { '$mcp_is_error': false, '$mcp_response': { 'content': [ { 'type': 'text', 'text': 'x'.repeat (100) } ] }, '$ip': '203.0.113.9' } }, context ({ 'cache': 'coalesced', 'exchange': 'okx' }));
    assert.equal (success.properties.$mcp_response, undefined);
    assert.ok (success.properties.response_bytes > 100);
    assert.equal (success.properties.$ip, undefined);
    assert.equal (success.properties.cache, 'coalesced');
    assert.equal (success.properties.exchange, 'okx');
    const intent: any = prepareEvent ({ 'event': '$mcp_tool_call', 'distinct_id': 'd', 'properties': { '$mcp_intent': 'use my key sk-abcdefghijklmnopqrstu' } }, context ());
    assert.equal (intent.properties.$mcp_intent, 'use my key ' + REDACTED, 'only the secret-shaped part goes');
});

test ('log attributes: payload, header and address keys dropped, values bounded', () => {
    const out = sanitizeLogAttributes ({
        'arguments': { 'a': 1 }, 'headers': {}, 'ip': '203.0.113.1', 'x-forwarded-for': '203.0.113.1', 'apiKey': 'k', 'result': [],
        'tool': 'get_tickers', 'n': 3, 'ok': true, 'nested': { 'secret': 's', 'v': 1 }, 'error': new Error ('boom'), 'long': 'y'.repeat (5000),
        'leak': 'Bearer abcdefghijklmnop',
    });
    assert.deepEqual (Object.keys (out).sort (), [ 'error', 'leak', 'long', 'n', 'nested', 'ok', 'tool' ]);
    assert.equal (out['nested'], '{"secret":"[redacted]","v":1}');
    assert.equal (out['error'], 'Error: boom');
    assert.equal (out['leak'], REDACTED);
    assert.ok (String (out['long']).length < 1100);
    assert.ok (levelEnabled ('error', 'warn'));
    assert.ok (!levelEnabled ('info', 'warn'));
});

test ('config: safe defaults and env parsing', () => {
    const defaults = telemetryConfigFromEnv ({});
    assert.equal (defaults.token, undefined);
    assert.equal (defaults.host, 'https://eu.i.posthog.com');
    assert.equal (defaults.sampleRate, 1);
    assert.equal (defaults.logLevel, 'info');
    assert.deepEqual (defaults.analytics, { 'context': true, 'captureModel': false, 'conversationId': false, 'sendToolsListEvent': true, 'sendInitializeEvent': true, 'exceptionAutocapture': true });
    const custom = telemetryConfigFromEnv ({ 'POSTHOG_PROJECT_TOKEN': ' t ', 'POSTHOG_HOST': 'https://us.i.posthog.com/', 'POSTHOG_SAMPLE_RATE': '0.25', 'LOG_LEVEL': 'DEBUG', 'POSTHOG_CONTEXT': '0', 'POSTHOG_CAPTURE_MODEL': 'true', 'POSTHOG_EXPECTED_ERROR_CODES': 'CIRCUIT_OPEN, OVERLOADED' });
    assert.equal (custom.token, 't');
    assert.equal (custom.host, 'https://us.i.posthog.com');
    assert.equal (custom.sampleRate, 0.25);
    assert.equal (custom.logLevel, 'debug');
    assert.equal (custom.analytics.context, false);
    assert.equal (custom.analytics.captureModel, true);
    assert.ok (custom.expectedErrorCodes.includes ('OVERLOADED'));
    assert.equal (telemetryConfigFromEnv ({ 'POSTHOG_SAMPLE_RATE': '0' }).sampleRate, 0);
    assert.equal (telemetryConfigFromEnv ({ 'POSTHOG_SAMPLE_RATE': '1' }).sampleRate, 1);
    assert.equal (telemetryConfigFromEnv ({ 'LIVE_TELEMETRY_SAMPLE_RATE': '.05' }).liveSampleRate, 0.05);
    // a rate nobody chose is a start-up error, not a silent fallback or clamp
    for (const bad of [ 'abc', '1%', '0,05', '5', '-1', '1e-2', 'NaN' ]) {
        assert.throws (() => telemetryConfigFromEnv ({ 'POSTHOG_SAMPLE_RATE': bad }), /POSTHOG_SAMPLE_RATE must be a number from 0 to 1/, bad);
        assert.throws (() => telemetryConfigFromEnv ({ 'LIVE_TELEMETRY_SAMPLE_RATE': bad }), /LIVE_TELEMETRY_SAMPLE_RATE must be a number from 0 to 1/, bad);
    }
});

test ('endpointKind: classifies the PostHog paths status () watches', () => {
    assert.equal (endpointKind ('https://eu.i.posthog.com/i/v1/analytics/events'), 'analytics');
    assert.equal (endpointKind ('https://eu.i.posthog.com/i/v1/logs?token=x'), 'logs');
    assert.equal (endpointKind ('https://eu.i.posthog.com/flags?v=2'), 'flags');
    assert.equal (endpointKind ('not a url'), 'other');
});
