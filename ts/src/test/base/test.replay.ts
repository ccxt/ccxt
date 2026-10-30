// NO_AUTO_TRANSPILE
//  Record/replay offline tests.
//  Run:  npx tsx --test ts/src/test/base/test.replay.ts
//  A local HTTP fixture server stands in for binance; recording captures the real
//  transport boundary and replay runs with every network path blocked.

import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { test } from 'node:test';
import ccxt from '../../../ccxt.js';

const { Recorder, Replay, ReplayMismatch, ReplayExhausted, ReplayDeadlock, ReplayIncomplete, ReplayUnsupported, RecorderError, RequestTimeout, OperationFailed } = ccxt as any;

const API_KEY = 'canary-api-key-ABCDEF123456';
const SECRET = 'canary-secret-0123456789abcdef';

const EXCHANGE_INFO = JSON.stringify ({
    'timezone': 'UTC',
    'serverTime': 1700000000000,
    'rateLimits': [],
    'exchangeFilters': [],
    'symbols': [
        {
            'symbol': 'BTCUSDT',
            'status': 'TRADING',
            'baseAsset': 'BTC',
            'baseAssetPrecision': 8,
            'quoteAsset': 'USDT',
            'quotePrecision': 8,
            'quoteAssetPrecision': 8,
            'orderTypes': [ 'LIMIT', 'MARKET' ],
            'icebergAllowed': true,
            'ocoAllowed': true,
            'isSpotTradingAllowed': true,
            'isMarginTradingAllowed': false,
            'filters': [
                { 'filterType': 'PRICE_FILTER', 'minPrice': '0.01000000', 'maxPrice': '1000000.00000000', 'tickSize': '0.01000000' },
                { 'filterType': 'LOT_SIZE', 'minQty': '0.00001000', 'maxQty': '9000.00000000', 'stepSize': '0.00001000' },
                { 'filterType': 'NOTIONAL', 'minNotional': '5.00000000' },
            ],
            'permissions': [ 'SPOT' ],
            'permissionSets': [ [ 'SPOT' ] ],
        },
    ],
});
const DEPTH = '{"lastUpdateId":10001,"bids":[["65000.00000000","1.25000000"],["64999.99000000","0.10000000"]],"asks":[["65001.00000000","0.80000000"],["65002.50000000","2.00000000"]]}';
const ACCOUNT = '{"makerCommission":10,"takerCommission":10,"canTrade":true,"updateTime":1700000000000,"accountType":"SPOT","apiKeyEcho":"' + API_KEY + '","balances":[{"asset":"BTC","free":"1.50000000","locked":"0.50000000"},{"asset":"USDT","free":"12345.67890000","locked":"0.00000000"}],"permissions":["SPOT"]}';

function orderBody (clientOrderId: string): string {
    return JSON.stringify ({
        'symbol': 'BTCUSDT',
        'orderId': 987654321,
        'orderListId': -1,
        'clientOrderId': clientOrderId,
        'transactTime': 1700000001000,
        'price': '65000.00000000',
        'origQty': '0.00100000',
        'executedQty': '0.00000000',
        'cummulativeQuoteQty': '0.00000000',
        'status': 'NEW',
        'timeInForce': 'GTC',
        'type': 'LIMIT',
        'side': 'BUY',
        'workingTime': 1700000001000,
        'fills': [],
        'selfTradePreventionMode': 'EXPIRE_MAKER',
    });
}

interface Scripted {
    status: number;
    body: string;
    headers?: any;
}

interface FixtureServer {
    url: string;
    requests: { method: string, path: string, query: any, body: string, headers: any }[];
    delays: { [path: string]: number };
    scripted: { [path: string]: Scripted[] };
    timeCounter: number;
    close: () => Promise<void>;
}

async function startServer (): Promise<FixtureServer> {
    const server: FixtureServer = { 'url': '', 'requests': [], 'delays': {}, 'scripted': {}, 'timeCounter': 0, 'close': async () => {} };
    const httpServer = http.createServer ((req, res) => {
        const parsed = new URL (req.url || '/', 'http://localhost');
        const requestPath = parsed.pathname;
        const query: any = {};
        parsed.searchParams.forEach ((value, key) => {
            query[key] = value;
        });
        const chunks: Buffer[] = [];
        req.on ('data', (chunk) => chunks.push (chunk));
        req.on ('end', () => {
            const body = Buffer.concat (chunks).toString ('utf8');
            server.requests.push ({ 'method': req.method || 'GET', 'path': requestPath, query, body, 'headers': req.headers });
            const respond = (status: number, payload: string, headers: any = { 'content-type': 'application/json' }) => {
                res.writeHead (status, headers);
                res.end (payload);
            };
            const send = () => {
                const script = server.scripted[requestPath];
                if (script !== undefined && script.length > 0) {
                    const next = script.shift () as Scripted;
                    respond (next.status, next.body, next.headers);
                    return;
                }
                if (requestPath.indexOf ('/private/') === 0) {
                    const signed = ('signature' in query) || (body.indexOf ('signature=') !== -1);
                    if (req.headers['x-mbx-apikey'] !== API_KEY || !signed) {
                        respond (401, '{"code":-2014,"msg":"API-key format invalid."}');
                        return;
                    }
                }
                if (requestPath === '/public/time') {
                    server.timeCounter += 1;
                    respond (200, '{"serverTime":' + (1700000000000 + server.timeCounter * 1000) + '}');
                } else if (requestPath === '/public/exchangeInfo') {
                    respond (200, EXCHANGE_INFO);
                } else if (requestPath === '/public/depth') {
                    respond (200, DEPTH);
                } else if (requestPath.indexOf ('/public/ticker') === 0) {
                    respond (400, '{"code":-1121,"msg":"Invalid symbol."}');
                } else if (requestPath === '/private/account') {
                    respond (200, ACCOUNT);
                } else if (requestPath === '/private/order') {
                    const form = new URLSearchParams (body);
                    respond (200, orderBody (form.get ('newClientOrderId') || 'none'));
                } else {
                    respond (404, '{"code":-1100,"msg":"not found"}');
                }
            };
            const delay = server.delays[requestPath];
            if (delay !== undefined && delay > 0) {
                setTimeout (send, delay);
            } else {
                send ();
            }
        });
    });
    await new Promise<void> ((resolve) => httpServer.listen (0, '127.0.0.1', () => resolve ()));
    const address = httpServer.address () as any;
    server.url = 'http://127.0.0.1:' + address.port;
    server.close = () => new Promise<void> ((resolve) => {
        httpServer.closeAllConnections ();
        httpServer.close (() => resolve ());
    });
    return server;
}

function newBinance (baseUrl: string, withCredentials: boolean, extra: any = {}): any {
    const config: any = {
        'enableRateLimit': false,
        'timeout': 2000,
        'options': { 'fetchMarkets': [ 'spot' ], 'fetchCurrencies': false, 'fetchMargins': false },
        ...extra,
    };
    if (withCredentials) {
        config['apiKey'] = API_KEY;
        config['secret'] = SECRET;
    }
    const exchange = new ccxt.binance (config);
    const api = exchange.urls['api'];
    const keys = Object.keys (api);
    for (let i = 0; i < keys.length; i++) {
        api[keys[i]] = baseUrl + '/' + keys[i];
    }
    return exchange;
}

function tempDir (): string {
    return fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-replay-'));
}

async function outcome (fn: () => Promise<any>): Promise<{ value?: any, error?: any }> {
    try {
        return { 'value': await fn () };
    } catch (error) {
        return { error };
    }
}

function readLines (file: string): any[] {
    return fs.readFileSync (file, 'utf8').split ('\n').filter ((line) => line.length > 0).map ((line) => JSON.parse (line));
}

test ('record then replay: public and private methods give identical results without credentials', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, true);
        recorder.attach (live, { 'instanceId': 'binance-spot' });
        await live.loadMarkets ();
        const recordedBook = await live.fetchOrderBook ('BTC/USDT', 5);
        const recordedTime = await live.fetchTime ();
        const recordedBalance = await live.fetchBalance ();
        const recordedOrder = await live.createOrder ('BTC/USDT', 'limit', 'buy', 0.001, 65000, { 'clientOrderId': 'client-1' });
        await recorder.close ();
        assert.strictEqual (recorder.status.complete, true);
        assert.strictEqual (recorder.status.eventCount, 10);
        const text = fs.readFileSync (file, 'utf8');
        assert.strictEqual (text.indexOf (SECRET), -1, 'secret leaked into the recording');
        assert.strictEqual (text.indexOf (API_KEY), -1, 'api key leaked into the recording');
        assert.strictEqual (text.indexOf ('signature'), -1, 'signature leaked into the recording');
        assert.ok (text.indexOf ('[REDACTED]') !== -1, 'echoed api key was not redacted');
        const inspected = await Replay.inspect (file);
        assert.strictEqual (inspected.requests, 5);
        assert.strictEqual (inspected.sanitizedEvents, 1);
        assert.strictEqual (inspected.replayable, true);
        const requestsBefore = server.requests.length;
        const replay = await Replay.open ({ file });
        const offline = newBinance ('http://blocked.invalid', false);
        replay.attach (offline, { 'instanceId': 'binance-spot' });
        await offline.loadMarkets ();
        assert.deepStrictEqual (await offline.fetchOrderBook ('BTC/USDT', 5), recordedBook);
        assert.deepStrictEqual (await offline.fetchTime (), recordedTime);
        const replayedBalance = await offline.fetchBalance ();
        assert.deepStrictEqual (replayedBalance['total'], recordedBalance['total']);
        assert.strictEqual (replayedBalance['info']['apiKeyEcho'], '[REDACTED]');
        assert.deepStrictEqual (await offline.createOrder ('BTC/USDT', 'limit', 'buy', 0.001, 65000, { 'clientOrderId': 'client-1' }), recordedOrder);
        await replay.assertConsumed ();
        const report = replay.report ();
        assert.strictEqual (report.consumed, 5);
        assert.strictEqual (report.remaining, 0);
        assert.strictEqual (report.networkBlocked, true);
        assert.strictEqual (server.requests.length, requestsBefore, 'replay reached the fixture server');
        await replay.close ();
        await offline.close ();
        await live.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('non-2xx bodies and malformed JSON replay through the real error handler', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    server.scripted['/public/depth'] = [
        { 'status': 429, 'body': '{"code":-1003,"msg":"Too many requests."}', 'headers': { 'content-type': 'application/json', 'retry-after': '2' } },
        { 'status': 200, 'body': '<html>maintenance</html>', 'headers': { 'content-type': 'text/html' } },
    ];
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, false);
        recorder.attach (live, { 'instanceId': 'ex1' });
        await live.loadMarkets ();
        const recorded = [
            await outcome (() => live.fetchOrderBook ('BTC/USDT', 5)),
            await outcome (() => live.fetchOrderBook ('BTC/USDT', 5)),
            await outcome (() => live.fetchTicker ('BTC/USDT')),
        ];
        await recorder.close ();
        assert.ok (recorded[0].error instanceof ccxt.RateLimitExceeded || recorded[0].error instanceof ccxt.DDoSProtection);
        assert.ok (recorded[2].error instanceof ccxt.BadSymbol);
        const events = readLines (file);
        const rateLimited = events.filter ((event) => event['type'] === 'http.response' && event['status'] === 429);
        assert.strictEqual (rateLimited.length, 1);
        assert.strictEqual (rateLimited[0]['headers']['retry-after'], '2');
        const replay = await Replay.open ({ file });
        const offline = newBinance ('http://blocked.invalid', false);
        replay.attach (offline, { 'instanceId': 'ex1' });
        await offline.loadMarkets ();
        const replayed = [
            await outcome (() => offline.fetchOrderBook ('BTC/USDT', 5)),
            await outcome (() => offline.fetchOrderBook ('BTC/USDT', 5)),
            await outcome (() => offline.fetchTicker ('BTC/USDT')),
        ];
        for (let i = 0; i < recorded.length; i++) {
            if (recorded[i].error !== undefined) {
                assert.ok (replayed[i].error !== undefined, 'call ' + i + ' should have failed on replay');
                assert.strictEqual (replayed[i].error.constructor, recorded[i].error.constructor);
                assert.strictEqual (replayed[i].error.message, recorded[i].error.message);
            } else {
                assert.deepStrictEqual (replayed[i].value, recorded[i].value);
            }
        }
        await replay.assertConsumed ();
        await replay.close ();
        await live.close ();
        await offline.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('transport timeout is recorded as http.error and replayed without waiting', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    server.delays['/public/time'] = 1500;
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, false, { 'timeout': 300 });
        recorder.attach (live, { 'instanceId': 'ex1' });
        const recorded = await outcome (() => live.fetchTime ());
        await recorder.close ();
        assert.ok (recorded.error instanceof RequestTimeout);
        const events = readLines (file);
        const errors = events.filter ((event) => event['type'] === 'http.error');
        assert.strictEqual (errors.length, 1);
        assert.strictEqual (errors[0]['kind'], 'timeout');
        const replay = await Replay.open ({ file });
        const offline = newBinance ('http://blocked.invalid', false);
        replay.attach (offline, { 'instanceId': 'ex1' });
        const started = Date.now ();
        const replayed = await outcome (() => offline.fetchTime ());
        assert.ok (Date.now () - started < 500, 'virtual clock should not wait for the recorded delay');
        assert.ok (replayed.error instanceof RequestTimeout);
        assert.strictEqual (replayed.error.message, recorded.error.message);
        assert.ok (replay.report ().virtualElapsedUs >= 300 * 1000);
        await replay.close ();
        await live.close ();
        await offline.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('concurrent requests keep the recorded completion order and bind identical requests FIFO', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    server.delays['/public/depth'] = 200;
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, false);
        recorder.attach (live, { 'instanceId': 'ex1' });
        await live.loadMarkets ();
        const recorded = await Promise.all ([ live.fetchOrderBook ('BTC/USDT', 5), live.fetchTime (), live.fetchTime () ]);
        await recorder.close ();
        const events = readLines (file).filter ((event) => event['type'].indexOf ('http.') === 0);
        const order = events.slice (2).map ((event) => event['type'] + ':' + event['requestId']);
        assert.deepStrictEqual (order, [ 'http.request:ex1-r2', 'http.request:ex1-r3', 'http.request:ex1-r4', 'http.response:ex1-r3', 'http.response:ex1-r4', 'http.response:ex1-r2' ]);
        assert.notStrictEqual (recorded[1], recorded[2]);
        const replay = await Replay.open ({ file });
        const offline = newBinance ('http://blocked.invalid', false);
        replay.attach (offline, { 'instanceId': 'ex1' });
        await offline.loadMarkets ();
        const replayed = await Promise.all ([ offline.fetchOrderBook ('BTC/USDT', 5), offline.fetchTime (), offline.fetchTime () ]);
        assert.deepStrictEqual (replayed, recorded);
        await replay.assertConsumed ();
        await replay.close ();
        await live.close ();
        await offline.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('exhaustion, unconsumed interactions and mismatches are explicit', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, false);
        recorder.attach (live, { 'instanceId': 'ex1' });
        await live.loadMarkets ();
        await live.fetchOrderBook ('BTC/USDT', 5);
        await recorder.close ();
        const first = await Replay.open ({ file });
        const offline = newBinance ('http://blocked.invalid', false);
        first.attach (offline, { 'instanceId': 'ex1' });
        await offline.loadMarkets ();
        await offline.fetchOrderBook ('BTC/USDT', 5);
        const exhausted = await outcome (() => offline.fetchOrderBook ('BTC/USDT', 5));
        assert.ok (exhausted.error instanceof ReplayExhausted);
        assert.ok (exhausted.error.message.indexOf ('matched occurrences: 1') !== -1);
        assert.ok (exhausted.error.message.indexOf ('received occurrences: 2') !== -1);
        await first.close ();
        const second = await Replay.open ({ file });
        const offline2 = newBinance ('http://blocked.invalid', false);
        second.attach (offline2, { 'instanceId': 'ex1' });
        await offline2.loadMarkets ();
        const unconsumed = await outcome (() => second.assertConsumed ());
        assert.ok (unconsumed.error !== undefined);
        assert.ok (unconsumed.error.message.indexOf ('depth') !== -1);
        const mismatch = await outcome (() => offline2.fetchOrderBook ('BTC/USDT', 10));
        assert.ok (mismatch.error instanceof ReplayMismatch);
        assert.strictEqual (mismatch.error.field, 'params.limit');
        assert.strictEqual (mismatch.error.expected['params']['limit'], 5);
        assert.strictEqual (mismatch.error.actual['params']['limit'], 10);
        assert.strictEqual (second.report ().mismatches.length, 1);
        await second.close ();
        await live.close ();
        await offline.close ();
        await offline2.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('auto-generated client order ids need an explicit ignoreParams declaration', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, true);
        recorder.attach (live, { 'instanceId': 'ex1' });
        await live.loadMarkets ();
        const recorded = await live.createOrder ('BTC/USDT', 'limit', 'buy', 0.001, 65000);
        await recorder.close ();
        const strict = await Replay.open ({ file });
        const offline = newBinance ('http://blocked.invalid', false);
        strict.attach (offline, { 'instanceId': 'ex1' });
        await offline.loadMarkets ();
        const mismatch = await outcome (() => offline.createOrder ('BTC/USDT', 'limit', 'buy', 0.001, 65000));
        assert.ok (mismatch.error instanceof ReplayMismatch);
        assert.strictEqual (mismatch.error.field, 'params.newClientOrderId');
        await strict.close ();
        const relaxed = await Replay.open ({ file });
        const offline2 = newBinance ('http://blocked.invalid', false);
        relaxed.attach (offline2, { 'instanceId': 'ex1', 'ignoreParams': [ 'newClientOrderId' ] });
        await offline2.loadMarkets ();
        assert.deepStrictEqual (await offline2.createOrder ('BTC/USDT', 'limit', 'buy', 0.001, 65000), recorded);
        await relaxed.assertConsumed ();
        await relaxed.close ();
        await live.close ();
        await offline.close ();
        await offline2.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('a request the application never issues produces ReplayDeadlock', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    server.delays['/public/depth'] = 150;
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, false);
        recorder.attach (live, { 'instanceId': 'ex1' });
        await live.loadMarkets ();
        await Promise.all ([ live.fetchOrderBook ('BTC/USDT', 5), live.fetchTime () ]);
        await recorder.close ();
        const replay = await Replay.open ({ file, 'deadlockTimeoutMs': 200 });
        const offline = newBinance ('http://blocked.invalid', false);
        replay.attach (offline, { 'instanceId': 'ex1' });
        await offline.loadMarkets ();
        const deadlock = await outcome (() => offline.fetchOrderBook ('BTC/USDT', 5));
        assert.ok (deadlock.error instanceof ReplayDeadlock, String (deadlock.error));
        assert.ok (deadlock.error.message.indexOf ('awaiting: http.request ex1-r3') !== -1);
        assert.ok (deadlock.error.message.indexOf ('ex1-r2') !== -1);
        await replay.close ();
        await live.close ();
        await offline.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('a retry inside fetch2 consumes a second recorded attempt and sleeps on the virtual clock', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    server.scripted['/public/time'] = [ { 'status': 503, 'body': '{"code":-1001,"msg":"Internal error; unable to process your request. Please try again."}' } ];
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, false, { 'options': { 'fetchMarkets': [ 'spot' ], 'fetchCurrencies': false, 'maxRetriesOnFailure': 1, 'maxRetriesOnFailureDelay': 400 } });
        recorder.attach (live, { 'instanceId': 'ex1' });
        const recorded = await live.fetchTime ();
        await recorder.close ();
        const inspected = await Replay.inspect (file);
        assert.strictEqual (inspected.requests, 2);
        const replay = await Replay.open ({ file });
        const offline = newBinance ('http://blocked.invalid', false, { 'options': { 'fetchMarkets': [ 'spot' ], 'fetchCurrencies': false, 'maxRetriesOnFailure': 1, 'maxRetriesOnFailureDelay': 400 } });
        replay.attach (offline, { 'instanceId': 'ex1' });
        const started = Date.now ();
        const replayed = await offline.fetchTime ();
        assert.ok (Date.now () - started < 300, 'retry delay should run on the virtual clock');
        assert.strictEqual (replayed, recorded);
        await replay.assertConsumed ();
        assert.strictEqual (replay.report ().consumed, 2);
        const noRetry = await Replay.open ({ file });
        const offline2 = newBinance ('http://blocked.invalid', false);
        noRetry.attach (offline2, { 'instanceId': 'ex1' });
        const failed = await outcome (() => offline2.fetchTime ());
        assert.ok (failed.error instanceof OperationFailed);
        await replay.close ();
        await noRetry.close ();
        await live.close ();
        await offline.close ();
        await offline2.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('truncated or unfinished sessions are rejected unless allowIncomplete is set', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    try {
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, false);
        recorder.attach (live, { 'instanceId': 'ex1' });
        await live.fetchTime ();
        await recorder.close ();
        const lines = fs.readFileSync (file, 'utf8').split ('\n');
        const noFooter = path.join (dir, 'no-footer.jsonl');
        fs.writeFileSync (noFooter, lines.slice (0, lines.length - 2).join ('\n') + '\n');
        const rejected = await outcome (() => Replay.open ({ 'file': noFooter }));
        assert.ok (rejected.error instanceof ReplayIncomplete);
        assert.ok (rejected.error.message.indexOf ('footer') !== -1);
        const tolerated = await Replay.open ({ 'file': noFooter, 'allowIncomplete': true });
        assert.ok (tolerated.report ().warnings.some ((warning: string) => warning.indexOf ('footer') !== -1));
        await tolerated.close ();
        const cut = path.join (dir, 'cut.jsonl');
        const content = fs.readFileSync (file, 'utf8');
        fs.writeFileSync (cut, content.slice (0, content.length - 10));
        const truncated = await outcome (() => Replay.open ({ 'file': cut }));
        assert.ok (truncated.error instanceof ReplayIncomplete);
        assert.ok (truncated.error.message.indexOf ('truncated') !== -1);
        const validation = await Replay.validate (cut);
        assert.strictEqual (validation.valid, false);
        await live.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('writer limits and disk failures are surfaced, never silently dropped', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    try {
        const missing = await outcome (() => Recorder.open ({ 'file': path.join (dir, 'no-such-dir', 'x.jsonl') }));
        assert.ok (missing.error instanceof RecorderError);
        const failures: any[] = [];
        const recorder = await Recorder.open ({ file, 'maxEvents': 1, 'onError': (error: any) => failures.push (error) });
        const live = newBinance (server.url, false);
        recorder.attach (live, { 'instanceId': 'ex1' });
        const value = await live.fetchTime ();
        assert.ok (typeof value === 'number', 'the exchange result must not depend on recorder health');
        await recorder.close ();
        assert.strictEqual (failures.length, 1);
        assert.ok (failures[0] instanceof RecorderError);
        assert.strictEqual (recorder.status.complete, false);
        assert.strictEqual (recorder.status.failed, failures[0]);
        const rejected = await outcome (() => Replay.open ({ file }));
        assert.ok (rejected.error instanceof ReplayIncomplete);
        await live.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('shareable profile redacts private routes and the result is not replayable', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    try {
        const recorder = await Recorder.open ({ file, 'privacy': 'shareable' });
        const live = newBinance (server.url, true);
        recorder.attach (live, { 'instanceId': 'ex1' });
        await live.loadMarkets ();
        const time = await live.fetchTime ();
        const balance = await live.fetchBalance ();
        assert.strictEqual (balance['total']['BTC'], 2);
        await recorder.close ();
        const text = fs.readFileSync (file, 'utf8');
        assert.strictEqual (text.indexOf (API_KEY), -1);
        assert.strictEqual (text.indexOf ('balances'), -1, 'private body leaked under the shareable profile');
        const inspected = await Replay.inspect (file);
        assert.strictEqual (inspected.redactedRequests, 1);
        assert.strictEqual (inspected.replayable, false);
        const rejected = await outcome (() => Replay.open ({ file }));
        assert.ok (rejected.error instanceof ReplayIncomplete);
        const replay = await Replay.open ({ file, 'allowIncomplete': true });
        const offline = newBinance ('http://blocked.invalid', false);
        replay.attach (offline, { 'instanceId': 'ex1' });
        await offline.loadMarkets ();
        assert.strictEqual (await offline.fetchTime (), time);
        const unsupported = await outcome (() => offline.fetchBalance ());
        assert.ok (unsupported.error instanceof ReplayUnsupported);
        await replay.close ();
        await live.close ();
        await offline.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('unattached instances are untouched and detaching restores the originals', async () => {
    const server = await startServer ();
    const dir = tempDir ();
    const file = path.join (dir, 'session.jsonl');
    try {
        const plain = newBinance (server.url, false);
        assert.strictEqual (Object.prototype.hasOwnProperty.call (plain, 'fetch'), false);
        await plain.loadMarkets ();
        const plainBook = await plain.fetchOrderBook ('BTC/USDT', 5);
        const requestsBefore = server.requests.length;
        const recorder = await Recorder.open ({ file });
        const live = newBinance (server.url, false);
        recorder.attach (live, { 'instanceId': 'ex1' });
        assert.strictEqual (Object.prototype.hasOwnProperty.call (live, 'fetch'), true);
        await live.loadMarkets ();
        const recordedBook = await live.fetchOrderBook ('BTC/USDT', 5);
        assert.deepStrictEqual (recordedBook, plainBook);
        assert.strictEqual (server.requests.length - requestsBefore, 2, 'recording must not add requests');
        await recorder.close ();
        assert.strictEqual (Object.prototype.hasOwnProperty.call (live, 'fetch'), false);
        assert.strictEqual (Object.prototype.hasOwnProperty.call (live, 'sign'), false);
        assert.strictEqual (live.fetch, plain.fetch);
        const replay = await Replay.open ({ file });
        const offline = newBinance ('http://blocked.invalid', false);
        replay.attach (offline, { 'instanceId': 'ex1' });
        const wsBlocked = await outcome (async () => offline.client ('wss://stream.binance.com:9443/ws'));
        assert.ok (wsBlocked.error instanceof ReplayUnsupported);
        await replay.close ();
        assert.strictEqual (Object.prototype.hasOwnProperty.call (offline, 'fetch'), false);
        assert.strictEqual (Object.prototype.hasOwnProperty.call (offline, 'fetchImplementation'), true);
        assert.strictEqual (offline.fetchImplementation, undefined);
        await plain.close ();
        await live.close ();
        await offline.close ();
    } finally {
        await server.close ();
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('the shipped example session replays through the installed parser', async () => {
    const here = path.dirname (fileURLToPath (import.meta.url));
    const repoRoot = path.resolve (here, '..', '..', '..', '..');
    const file = path.join (repoRoot, 'ts', 'src', 'test', 'base', 'fixtures', 'replay', 'binance-orderbook.jsonl');
    const replay = await Replay.open ({ file });
    const exchange = new ccxt.binance ({ 'enableRateLimit': false, 'options': { 'fetchMarkets': [ 'spot' ], 'fetchCurrencies': false } });
    replay.attach (exchange, { 'instanceId': 'binance-spot' });
    await exchange.loadMarkets ();
    const book = await exchange.fetchOrderBook ('BTC/USDT', 5);
    assert.strictEqual (book['symbol'], 'BTC/USDT');
    assert.deepStrictEqual (book['bids'][0], [ 65000, 1.25 ]);
    assert.deepStrictEqual (book['asks'][0], [ 65001, 0.8 ]);
    assert.strictEqual (book['nonce'], 10001);
    await replay.assertConsumed ();
    await replay.close ();
    await exchange.close ();
});
