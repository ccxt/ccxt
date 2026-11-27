import { test } from 'node:test';
import assert from 'node:assert/strict';
import { looksLikeSecret, redactSecretsInText, scrub } from '../../src/telemetry/redact.js';
import { prepareEvent, type EventContext } from '../../src/telemetry/analytics.js';
import { sanitizeLogAttributes } from '../../src/telemetry/logs.js';
import { DEFAULT_EXPECTED_ERROR_CODES } from '../../src/telemetry/config.js';

// Exchange credentials in the shapes exchanges issue them, pasted by a user and copied by a
// model into an argument, an error-echoed symbol or the `context` text, must not reach
// PostHog (events or logs) in clear. Values are built at run time so no key-shaped literal
// sits in the repository.

const repeat = (unit: string, length: number) => unit.repeat (Math.ceil (length / unit.length)).slice (0, length);
const CREDENTIALS: Record<string, string> = {
    'binance key (64 alphanumerics)': repeat ('vmPUZE6mv9SD5VNHk4Hl', 64),
    'kraken secret (88 base64)': repeat ('kQH5HW/8p1u+Zx9Y', 86) + '==',
    'okx api key (uuid)': [ '5b1a2c3d', '4e5f', '6789', 'abcd', 'ef0123456789' ].join ('-'),
    'okx secret (32 hex)': repeat ('A1B2C3D4E5F6', 32),
    'evm private key (64 hex)': '0x' + repeat ('4c0883a69102937d', 64),
    'openai-style key': 'sk-' + repeat ('proj', 4) + '-abcdefghij1234567890',
};

function context (): EventContext {
    return { 'sampleRate': 1, 'expectedErrorCodes': new Set (DEFAULT_EXPECTED_ERROR_CODES), 'appRoot': '/srv/app' };
}

function toolCall (name: string, args: Record<string, unknown>, extra: Record<string, unknown> = {}) {
    return { 'event': '$mcp_tool_call', 'distinct_id': 'd', 'properties': { '$mcp_tool_name': name, '$mcp_parameters': { 'request': { 'method': 'tools/call', 'params': { name, 'arguments': args } } }, ...extra } };
}

test ('credentials: every exchange key format is recognised, and ordinary values are not', () => {
    for (const [ label, value ] of Object.entries (CREDENTIALS)) {
        assert.ok (looksLikeSecret (value), label);
        assert.equal (redactSecretsInText ('x ' + value + ' y'), 'x [redacted] y', label);
    }
    for (const value of [ 'BTC/USDT', 'BTC/USDT:USDT', 'ETH/USDC:USDC-250328-3000-C', 'kraken', '1h', 'get_tickers', '0x' + 'ab'.repeat (20), '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 'the user wants a chart of bitcoin', 'symbol not found on this exchange — resolve symbols with search_markets', 'keeps API keys on their own machine' ]) {
        assert.ok (!looksLikeSecret (value), value);
    }
    assert.equal (redactSecretsInText ('my password is PASSWORD-INTENT-1212 and my api key is APIKEY-INTENT-3434'), 'my [redacted] and my [redacted]');
    assert.equal (redactSecretsInText ('apiKey=K7mPq2abcd for x'), '[redacted] for x');
});

test ('credentials: an account tool records only argument names, and no intent', () => {
    for (const value of Object.values (CREDENTIALS)) {
        const event: any = prepareEvent (toolCall ('get_balance', { 'account': value, 'exchange': 'kraken', 'note': 'harmless' }, { '$mcp_intent': 'user shared their key ' + value + ' to check balance', '$mcp_is_error': true, '$mcp_response': { 'content': [ { 'type': 'text', 'text': '{"ok":false,"error":{"code":"ACCOUNT_REQUIRED"}}' } ] } }), context ());
        const json = JSON.stringify (event);
        assert.ok (!json.includes (value), 'leaked ' + value.slice (0, 8));
        assert.equal (event.properties.$mcp_intent, undefined);
        assert.deepEqual (event.properties.$mcp_parameters.request.params.arguments, { 'account': '[redacted]', 'exchange': 'kraken', 'note': '[redacted]' });
        assert.equal (event.properties.error_code, 'ACCOUNT_REQUIRED');
    }
});

test ('credentials: a key in a public tool argument, its error echo, the exception list and the intent is redacted everywhere', () => {
    for (const value of Object.values (CREDENTIALS)) {
        const message = '{"ok":false,"error":{"code":"BAD_SYMBOL","message":"kraken does not have market symbol \\"' + value + '\\"","retryable":false}}';
        const call: any = prepareEvent (toolCall ('get_tickers', { 'exchange': 'kraken', 'symbols': [ value ], 'query': 'key ' + value }, {
            '$mcp_is_error': true,
            '$mcp_intent': 'User shared Binance API key ' + value + ' and asked for prices',
            '$mcp_error_message': message,
            '$mcp_response': { 'content': [ { 'type': 'text', 'text': message } ] },
        }), context ());
        assert.ok (!JSON.stringify (call).includes (value), 'tool call leaked ' + value.slice (0, 8));
        assert.equal (call.properties.error_code, 'BAD_SYMBOL', 'the code is still read');
        assert.match (call.properties.$mcp_intent, /^User shared Binance .*\[redacted\] and asked for prices$/);
        const exception: any = prepareEvent ({ 'event': '$exception', 'distinct_id': 'd', 'properties': { '$exception_list': [ { 'type': 'Error', 'value': 'boom while handling ' + value + ' at /home/alice/app/x.ts:1:2' } ] } }, context ());
        assert.ok (!JSON.stringify (exception).includes (value), 'exception leaked ' + value.slice (0, 8));
        assert.ok (!JSON.stringify (exception).includes ('/home/alice'));
    }
    // scrub still caps and keeps ordinary values
    assert.deepEqual (scrub ({ 'symbol': 'BTC/USDT', 'n': 1 }), { 'symbol': 'BTC/USDT', 'n': 1 });
});

test ('credentials: log values lose secret-shaped parts and absolute paths; server ids are kept', () => {
    const value = CREDENTIALS['kraken secret (88 base64)'];
    const out = sanitizeLogAttributes ({
        'error': 'Error: boom while handling apiKey=' + value + ' for /home/alice/secret-project\n    at x (/srv/app/dist/server.mjs:1:2)',
        'requestId': '3f2a9c1e-1b2c-4d5e-8f90-0123456789ab',
        'thrown': new Error ('failed in /home/alice/app/y.ts:3 with ' + value),
        'nested': { 'detail': 'at /home/alice/z.ts', 'v': value },
    });
    const json = JSON.stringify (out);
    assert.ok (!json.includes (value));
    assert.ok (!json.includes ('/home/alice'), json);
    assert.ok (!json.includes ('/srv/app'), json);
    assert.equal (out['requestId'], '3f2a9c1e-1b2c-4d5e-8f90-0123456789ab');
});
