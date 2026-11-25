import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createBrowserTradingRoute } from '../../ts/browser-trading.js';

const origin = 'https://sign.ccxt.test';
const token = 'test-only-relay-token-with-at-least-32-chars';
const body = '{"symbol":"BTCUSDT", "side":"Buy"}';

test ('browser relay preserves signed bytes and rejects unauthorized, unlisted, and duplicate requests', async (t) => {
    const upstream = t.mock.method (globalThis, 'fetch', async (url: URL, options: RequestInit) => {
        assert.equal (url.href, 'https://api-testnet.bybit.com/v5/order/create');
        assert.equal (options.body, body);
        assert.equal (options.redirect, 'error');
        const headers = new Headers (options.headers);
        assert.equal (headers.get ('x-bapi-sign'), 'mock-signature');
        assert.equal (headers.get ('authorization'), null);
        return new Response ('{"retCode":0,"result":{"orderId":"test-order"}}', { 'status': 200 });
    });
    const route = createBrowserTradingRoute ({ origin, token }, async (request) => {
        for await (const chunk of request) return chunk;
        return undefined;
    });
    const send = async (requestOrigin: string, authorization: string, url: string) => {
        const input = { 'exchange': 'bybit', 'signedPayload': { url, 'method': 'POST', 'headers': {
            'x-bapi-sign': 'mock-signature', 'authorization': 'not-for-the-exchange',
        }, body } };
        const request = Object.assign (Readable.from ([ Buffer.from (JSON.stringify (input)) ]), {
            'method': 'POST', 'headers': { 'origin': requestOrigin, authorization },
        });
        let status = 0;
        let output: any;
        const response = {
            'writeHead': (code: number) => { status = code; },
            'end': (data: string) => { output = JSON.parse (data); },
        };
        await route (request as unknown as IncomingMessage, response as unknown as ServerResponse, '/relay-order');
        return { status, output };
    };
    const bybit = 'https://api-testnet.bybit.com/v5/order/create';
    const authorization = 'Bearer ' + token;
    assert.equal ((await send ('https://other.test', authorization, bybit)).status, 403);
    assert.equal ((await send (origin, 'Bearer invalid', bybit)).status, 401);
    assert.equal ((await send (origin, authorization, 'https://api.bybit.com.invalid/v5/order/create')).status, 403);
    assert.equal ((await send (origin, authorization, 'https://api-testnet.bybit.com/v5/asset/withdraw/create')).status, 403);
    assert.deepEqual (await send (origin, authorization, bybit), {
        'status': 200, 'output': { 'status': 200, 'body': '{"retCode":0,"result":{"orderId":"test-order"}}' },
    });
    assert.equal ((await send (origin, authorization, bybit)).status, 409);
    assert.equal (upstream.mock.callCount (), 1);
});

test ('browser relay allows configured mainnet and testnet routes and rejects unrelated endpoints', async (t) => {
    const upstream = t.mock.method (globalThis, 'fetch', async () => new Response ('{}', { 'status': 200 }));
    const route = createBrowserTradingRoute ({ origin, token }, async (request) => {
        for await (const chunk of request) return chunk;
        return undefined;
    });
    const status = async (exchange: string, method: string, url: string) => {
        const input = { exchange, 'signedPayload': { url, method, 'headers': {}, 'body': null } };
        const request = Object.assign (Readable.from ([ Buffer.from (JSON.stringify (input)) ]), {
            'method': 'POST', 'headers': { origin, 'authorization': 'Bearer ' + token },
        });
        let code = 0;
        const response = { 'writeHead': (value: number) => { code = value; }, 'end': () => undefined };
        await route (request as unknown as IncomingMessage, response as unknown as ServerResponse, '/relay-order');
        return code;
    };
    const allowed: [ string, string, string ][] = [
        [ 'binance', 'GET', 'https://api.binance.com/api/v3/account' ],
        [ 'binance', 'POST', 'https://fapi.binance.com/fapi/v1/order' ],
        [ 'bybit', 'GET', 'https://api.bybit.com/v5/user/query-api' ],
        [ 'bybit', 'POST', 'https://api.bybit.com/v5/order/create' ],
        [ 'binance', 'GET', 'https://testnet.binance.vision/api/v3/account?timestamp=1' ],
        [ 'binance', 'GET', 'https://demo-fapi.binance.com/fapi/v1/exchangeInfo' ],
        [ 'binance', 'GET', 'https://demo-fapi.binance.com/fapi/v1/leverageBracket?timestamp=1' ],
        [ 'binance', 'GET', 'https://demo-fapi.binance.com/fapi/v3/positionRisk?timestamp=1' ],
        [ 'binance', 'POST', 'https://demo-fapi.binance.com/fapi/v1/order' ],
        [ 'bybit', 'GET', 'https://api-testnet.bybit.com/v5/user/query-api' ],
        [ 'bybit', 'GET', 'https://api-testnet.bybit.com/v5/position/list?category=linear' ],
    ];
    for (const [ exchange, method, url ] of allowed) {
        assert.equal (await status (exchange, method, url), 200, method + ' ' + url);
    }
    const refused: [ string, string, string ][] = [
        [ 'binance', 'POST', 'https://api.binance.com/sapi/v1/capital/withdraw/apply' ],
        [ 'bybit', 'POST', 'https://api.bybit.com/v5/asset/withdraw/create' ],
        [ 'binance', 'POST', 'https://demo-fapi.binance.com/fapi/v1/leverage' ],
        [ 'bybit', 'GET', 'https://demo-fapi.binance.com/fapi/v1/exchangeInfo' ],
    ];
    for (const [ exchange, method, url ] of refused) {
        assert.equal (await status (exchange, method, url), 403, method + ' ' + url);
    }
    assert.equal (upstream.mock.callCount (), allowed.length);
});

test ('browser relay reports why each request was refused or what the exchange answered, without secrets', async (t) => {
    t.mock.method (globalThis, 'fetch', async () => new Response ('{"code":-2014,"msg":"API-key format invalid."}', { 'status': 401 }));
    const records: any[] = [];
    const route = createBrowserTradingRoute ({ origin, token }, async (request) => {
        for await (const chunk of request) return chunk;
        return undefined;
    }, (record) => records.push (record));
    const send = async (headers: Record<string, string>, url: string) => {
        const input = { 'exchange': 'binance', 'signedPayload': { url, 'method': 'GET', 'headers': { 'x-mbx-apikey': 'key-that-must-not-be-logged' }, 'body': null } };
        const request = Object.assign (Readable.from ([ Buffer.from (JSON.stringify (input)) ]), { 'method': 'POST', headers });
        const response = { 'writeHead': () => undefined, 'end': () => undefined };
        await route (request as unknown as IncomingMessage, response as unknown as ServerResponse, '/relay-order');
        return records[records.length - 1];
    };
    const account = 'https://testnet.binance.vision/api/v3/account?timestamp=1&signature=signature-that-must-not-be-logged';
    const authorization = 'Bearer ' + token;
    let record = await send ({ 'origin': 'http://localhost:3000', authorization }, account);
    assert.equal (record.status, 403);
    assert.match (record.reason, /Origin http:\/\/localhost:3000 is not the signing origin https:\/\/sign\.ccxt\.test/);
    record = await send ({ origin, 'authorization': 'Bearer wrong' }, account);
    assert.equal (record.status, 401);
    assert.match (record.reason, /a relay token that does not match, no session cookie/);
    record = await send ({ origin }, account);
    assert.match (record.reason, /no relay token, no session cookie/);
    record = await send ({ origin, authorization }, 'https://testnet.binance.vision/sapi/v1/margin/allPairs');
    assert.equal (record.status, 403);
    assert.match (record.reason, /route is not in the allowlist for testnet\.binance\.vision/);
    record = await send ({ origin, authorization }, 'https://evil.test/api/v3/account');
    assert.match (record.reason, /host evil\.test is not an allowed binance host/);
    record = await send ({ origin, authorization }, account);
    assert.deepEqual ({ ...record, 'upstreamMs': 0 }, {
        'step': 'relay', 'path': '/relay-order', 'status': 200, 'outcome': 'forwarded', 'auth': 'token', 'exchange': 'binance',
        'target': 'GET testnet.binance.vision/api/v3/account', 'upstreamStatus': 401, 'upstreamMs': 0, 'bytes': 46,
        'exchangeCode': '-2014', 'exchangeMessage': 'API-key format invalid.',
    });
    const everything = JSON.stringify (records);
    assert.ok (!everything.includes (token) && !everything.includes ('must-not-be-logged'), 'no token, key or signature in the log');
});

test ('without a relay token the relay needs only the signing origin, and still enforces the allowlist', async (t) => {
    const upstream = t.mock.method (globalThis, 'fetch', async () => new Response ('{}', { 'status': 200 }));
    const records: any[] = [];
    const route = createBrowserTradingRoute ({ origin }, async (request) => {
        for await (const chunk of request) return chunk;
        return undefined;
    }, (record) => records.push (record));
    const send = async (headers: Record<string, string>, url: string) => {
        const input = { 'exchange': 'bybit', 'signedPayload': { url, 'method': 'GET', 'headers': {}, 'body': null } };
        const request = Object.assign (Readable.from ([ Buffer.from (JSON.stringify (input)) ]), { 'method': 'POST', headers });
        const response = { 'writeHead': () => undefined, 'end': () => undefined };
        await route (request as unknown as IncomingMessage, response as unknown as ServerResponse, '/relay-order');
        return records[records.length - 1];
    };
    const list = 'https://api-testnet.bybit.com/v5/position/list';
    assert.equal ((await send ({ origin }, list)).outcome, 'forwarded');
    assert.match ((await send ({ origin }, list)).auth, /none/);
    assert.equal ((await send ({ 'origin': 'https://other.test' }, list)).status, 403);
    assert.equal ((await send ({}, list)).status, 403);
    assert.equal ((await send ({ origin }, 'https://api-testnet.bybit.com/v5/asset/withdraw/create')).status, 403);
    assert.equal (upstream.mock.callCount (), 2);
    assert.throws (() => createBrowserTradingRoute ({ origin, 'token': 'short' }, async () => undefined));
});

test ('the signing page can be embedded only by the configured frame ancestors', async () => {
    const policy = async (frameAncestors?: string[]) => {
        const route = createBrowserTradingRoute ({ origin, frameAncestors }, async () => undefined);
        let headers: Record<string, string> = {};
        const request = { 'method': 'GET', 'headers': {}, 'socket': {} };
        const response = { 'setHeader': () => undefined, 'writeHead': (_code: number, value: Record<string, string>) => { headers = value; }, 'end': () => undefined };
        await route (request as unknown as IncomingMessage, response as unknown as ServerResponse, '/order-signing');
        return headers['Content-Security-Policy'];
    };
    assert.match (await policy (), /frame-ancestors 'none';/);
    assert.match (await policy ([]), /frame-ancestors 'none';/);
    assert.match (await policy ([ 'https://chatgpt.com', 'https://*.oaiusercontent.com' ]), /frame-ancestors https:\/\/chatgpt\.com https:\/\/\*\.oaiusercontent\.com;/);
    assert.match (await policy ([ '*' ]), /frame-ancestors \*;/);
    // an entry that could rewrite the policy is refused outright
    assert.throws (() => createBrowserTradingRoute ({ origin, 'frameAncestors': [ "https://a.test; script-src 'unsafe-inline'" ] }, async () => undefined));
});
