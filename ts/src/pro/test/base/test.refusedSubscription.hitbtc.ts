// NO_AUTO_TRANSPILE
import assert from 'assert';
import hitbtc from '../../hitbtc.js';
import Client from '../../../base/ws/Client.js';
import { AuthenticationError, BadRequest, BadSymbol, PermissionDenied } from '../../../base/errors.js';

// native ts test, intentionally not transpiled: it stubs the hand-written ws client. A ws
// request that hitbtc refuses must reject the future the watch* call awaits, with the error
// class mapped from the code, and drop the subscription so a retry subscribes again
// (https://github.com/ccxt/ccxt/pull/30658). Exchange-specific, so it is a standalone
// `test.<name>.<exchangeid>.ts` file and is not wired into tests.init.ts, like
// test.watchTopics.bybit.ts. Run: npx tsx ts/src/pro/test/base/test.refusedSubscription.hitbtc.ts

const BTC_USDT = {
    'id': 'BTCUSDT',
    'symbol': 'BTC/USDT',
    'base': 'BTC',
    'quote': 'USDT',
    'baseId': 'BTC',
    'quoteId': 'USDT',
    'type': 'spot',
    'spot': true,
    'margin': false,
    'swap': false,
    'future': false,
    'option': false,
    'contract': false,
    'active': true,
    'precision': { 'amount': 0.00001, 'price': 0.01 },
    'limits': {},
};

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function installClient (exchange: any, url: string) {
    // a transport-less client: connect resolves at once and send records the frame
    const noop = () => {};
    const client: any = new Client (url, noop, noop, noop, noop, {});
    client.sentMessages = [];
    client.connect = () => {
        if (client.isConnected !== true) {
            client.isConnected = true;
            client.connected.resolve (url);
        }
        return client.connected;
    };
    client.send = async (message: any) => {
        client.sentMessages.push (message);
        return message;
    };
    exchange.clients[url] = client;
    return client;
}

function createHarness () {
    const exchange: any = new hitbtc ({
        'enableRateLimit': false,
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    exchange.setMarkets ([ BTC_USDT ]);
    exchange.clients = {};
    const publicClient = installClient (exchange, exchange.urls['api']['ws']['public']);
    const privateClient = installClient (exchange, exchange.urls['api']['ws']['private']);
    return { 'exchange': exchange, 'public': publicClient, 'private': privateClient };
}

function track (promise: Promise<any>) {
    const outcome: any = { 'settled': false, 'error': undefined };
    promise.then (() => {
        outcome['settled'] = true;
    }, (e: any) => {
        outcome['settled'] = true;
        outcome['error'] = e;
    });
    return outcome;
}

async function waitForSent (client: any, count: number, label: string) {
    // the request goes out from a connected.then () callback, a few ticks after the call
    for (let i = 0; i < 50; i++) {
        if (client.sentMessages.length >= count) {
            return client.sentMessages[count - 1];
        }
        await sleep (1);
    }
    throw new Error (label + ': expected ' + count.toString () + ' sent frames, got ' + client.sentMessages.length.toString ());
}

function errorFrame (code: number, message: string, id: any = undefined) {
    // the exchange sends the code as a number and echoes the request id as it was sent
    const frame: any = {
        'jsonrpc': '2.0',
        'error': { 'code': code, 'message': message, 'description': message },
    };
    if (id !== undefined) {
        frame['id'] = id;
    }
    return frame;
}

async function testPublicSubscriptionRefused () {
    const harness = createHarness ();
    const exchange = harness['exchange'];
    const client = harness['public'];
    // an unrelated subscription, still waiting for data, must survive the refusal below
    const tickers = track (exchange.watchTickers ([ 'BTC/USDT' ]));
    const tickersRequest = await waitForSent (client, 1, 'watchTickers subscribe');
    // batch order books resolve per symbol, so the refusal must reach 'orderbooks::BTC/USDT'
    const params = { 'method': 'orderbook/{depth}/{speed}/batch', 'depth': 5, 'speed': 500 };
    const orderbook = track (exchange.watchOrderBook ('BTC/USDT', undefined, params));
    const request = await waitForSent (client, 2, 'watchOrderBook subscribe');
    assert.strictEqual (request['ch'], 'orderbook/D5/500ms/batch');
    const messageHash = 'orderbooks::BTC/USDT';
    assert.strictEqual (client.subscriptions[messageHash]['id'], request['id'], 'the subscription must keep the request id sent on the wire');
    exchange.handleMessage (client, errorFrame (2001, 'Symbol not found', request['id']));
    await sleep (1);
    assert (orderbook['settled'] === true, 'a refused subscription must reject the waiting watchOrderBook instead of hanging');
    assert (orderbook['error'] instanceof BadSymbol, 'error code 2001 must reject with BadSymbol, got ' + String (orderbook['error']));
    assert (!(messageHash in client.subscriptions), 'the refused subscription must be dropped');
    assert (tickers['settled'] !== true, 'a refusal must not reject the other subscriptions');
    assert.strictEqual (client.subscriptions['tickers::BTC/USDT']['id'], tickersRequest['id'], 'a refusal must not drop the other subscriptions');
    // a retry must send the subscribe again, with a new request id
    const retry = track (exchange.watchOrderBook ('BTC/USDT', undefined, params));
    const retryRequest = await waitForSent (client, 3, 'watchOrderBook retry');
    assert.notStrictEqual (retryRequest['id'], request['id'], 'the retry must send a new subscribe request');
    exchange.handleMessage (client, errorFrame (2003, 'Invalid request', retryRequest['id']));
    await sleep (1);
    const isBadRequest = (retry['error'] instanceof BadRequest) && !(retry['error'] instanceof BadSymbol);
    assert (isBadRequest, 'error code 2003 must reject with BadRequest, got ' + String (retry['error']));
    assert (!(messageHash in client.subscriptions), 'the refused retry must be dropped');
    client.reject (new Error ('cleanup'));
    await sleep (1);
    assert (tickers['settled'] === true, 'cleanup must settle the pending watchTickers');
}

async function testPrivateSubscriptionRefused () {
    // an api key without the access right of a channel: the login succeeds and the subscribe
    // is refused with 1003, a PermissionDenied, which is an AuthenticationError subclass
    const harness = createHarness ();
    const exchange = harness['exchange'];
    const client = harness['private'];
    const balance = track (exchange.watchBalance ());
    const loginRequest = await waitForSent (client, 1, 'login');
    assert.strictEqual (loginRequest['method'], 'login');
    exchange.handleMessage (client, { 'jsonrpc': '2.0', 'result': true });
    const request = await waitForSent (client, 2, 'watchBalance subscribe');
    assert.strictEqual (request['method'], 'spot_balance_subscribe');
    assert.strictEqual (client.subscriptions['spot_balance']['id'], request['id'], 'the subscription must keep the request id sent on the wire');
    exchange.handleMessage (client, errorFrame (1003, 'Action is forbidden for this API key', request['id']));
    await sleep (1);
    assert (balance['settled'] === true, 'a subscription refused with an authentication error must reject the waiting watchBalance instead of hanging');
    assert (balance['error'] instanceof PermissionDenied, 'error code 1003 must reject with PermissionDenied, got ' + String (balance['error']));
    assert (!('spot_balance' in client.subscriptions), 'the refused subscription must be dropped');
}

async function testLoginRefused () {
    // the login request carries no id, its error must still reject the waiting watch
    const harness = createHarness ();
    const exchange = harness['exchange'];
    const client = harness['private'];
    const balance = track (exchange.watchBalance ());
    const request = await waitForSent (client, 1, 'login');
    assert.strictEqual (request['method'], 'login');
    exchange.handleMessage (client, errorFrame (1002, 'Authorization is required or has been failed'));
    await sleep (1);
    assert (balance['error'] instanceof AuthenticationError, 'a refused login must reject the waiting watchBalance, got ' + String (balance['error']));
    assert (!('authenticated' in client.subscriptions), 'a refused login must be dropped, so the next call logs in again');
    assert.strictEqual (client.sentMessages.length, 1, 'no subscribe may be sent after a refused login');
}

async function testHitbtcRefusedSubscription () {
    await testPublicSubscriptionRefused ();
    await testPrivateSubscriptionRefused ();
    await testLoginRefused ();
}

export default testHitbtcRefusedSubscription;

const invokedDirectly = process.argv[1] !== undefined && process.argv[1].indexOf ('test.refusedSubscription.hitbtc') !== -1;
if (invokedDirectly) {
    testHitbtcRefusedSubscription ().then (() => {
        console.log ('test.refusedSubscription.hitbtc passed');
    }).catch ((e) => {
        console.error (e);
        process.exit (1);
    });
}
