// NO_AUTO_TRANSPILE
import assert from 'assert';
import paradex from '../../paradex.js';
import Client from '../../../base/ws/Client.js';
import { AuthenticationError, BadRequest, ExchangeError, NetworkError, NotSupported, OperationRejected, PermissionDenied, RateLimitExceeded } from '../../../base/errors.js';

// native ts test, intentionally not transpiled: it stubs the hand-written ws client. Every
// paradex request carries a json-rpc id, so an error reply rejects only the watchers of that
// request and a failed subscribe or auth is forgotten (a retry sends it again), an error code
// maps to its own error class, and only the reply to the auth request resolves the auth.
// Exchange-specific, so it is a standalone `test.<name>.<exchangeid>.ts` file, run from tests.init.ts
// like test.pendingUnsubscribe.hyperliquid.ts.
// Run: npx tsx ts/src/pro/test/base/test.errorFrame.paradex.ts

const BTC_PERP = {
    'id': 'BTC-USD-PERP',
    'symbol': 'BTC/USD:USDC',
    'base': 'BTC',
    'quote': 'USD',
    'settle': 'USDC',
    'baseId': 'BTC',
    'quoteId': 'USD',
    'settleId': 'USDC',
    'type': 'swap',
    'spot': false,
    'margin': false,
    'swap': true,
    'future': false,
    'option': false,
    'contract': true,
    'linear': true,
    'inverse': false,
    'contractSize': 1,
    'active': true,
    'precision': { 'amount': 0.00001, 'price': 0.1 },
    'limits': {},
};

const ETH_PERP = Object.assign ({}, BTC_PERP, {
    'id': 'ETH-USD-PERP',
    'symbol': 'ETH/USD:USDC',
    'base': 'ETH',
    'baseId': 'ETH',
});

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
    const exchange: any = new paradex ({
        'enableRateLimit': false,
        'options': {
            // a cached rest token, so authenticate () sends the ws auth without any http call
            'authToken': 'test-token',
            'expires': 99999999999,
        },
    });
    exchange.setMarkets ([ BTC_PERP, ETH_PERP ]);
    exchange.clients = {};
    const client = installClient (exchange, exchange.getWsUrl ());
    return { 'exchange': exchange, 'client': client };
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

function deliver (exchange: any, client: any, frame: any) {
    // like Client.onMessage: an error escaping handleMessage rejects every future on the connection
    try {
        exchange.handleMessage (client, frame);
    } catch (e) {
        client.reject (e);
    }
}

function errorFrame (code: number, message: string, id: any = undefined) {
    const frame: any = {
        'jsonrpc': '2.0',
        'error': { 'code': code, 'message': message },
    };
    if (id !== undefined) {
        frame['id'] = id;
    }
    return frame;
}

function authReply (id: any) {
    return { 'jsonrpc': '2.0', 'id': id, 'result': { 'node_id': '73cf456f7cb78d59' } };
}

function subscribeAck (id: any, channel: string) {
    return { 'jsonrpc': '2.0', 'id': id, 'result': { 'channel': channel } };
}

async function authenticatedOrdersWatch (exchange: any, client: any, symbol: string) {
    const orders = track (exchange.watchOrders (symbol));
    const auth = await waitForSent (client, 1, 'auth');
    assert.strictEqual (auth['method'], 'auth');
    deliver (exchange, client, authReply (auth['id']));
    const subscribe = await waitForSent (client, 2, 'watchOrders subscribe');
    assert.strictEqual (subscribe['method'], 'subscribe');
    deliver (exchange, client, subscribeAck (subscribe['id'], subscribe['params']['channel']));
    return orders;
}

async function testRefusedSubscribeRejectsOnlyItsWatchers () {
    // e.g. the 42900 max subscriptions per connection: the refused watchTrades rejects, the live
    // watchOrders keeps waiting, and a later private watch reuses the auth instead of hanging
    const harness = createHarness ();
    const exchange = harness['exchange'];
    const client = harness['client'];
    const orders = await authenticatedOrdersWatch (exchange, client, 'BTC/USD:USDC');
    const trades = track (exchange.watchTrades ('BTC/USD:USDC'));
    const tradesRequest = await waitForSent (client, 3, 'watchTrades subscribe');
    assert.strictEqual (tradesRequest['params']['channel'], 'trades.BTC-USD-PERP');
    deliver (exchange, client, errorFrame (42900, 'max subscriptions per connection reached', tradesRequest['id']));
    await sleep (1);
    assert (trades['error'] instanceof OperationRejected, 'error code 42900 must reject with OperationRejected, got ' + String (trades['error']));
    assert (orders['settled'] !== true, 'a refused subscribe must not reject the other watchers');
    assert (!('trades.BTC-USD-PERP' in client.subscriptions), 'the refused subscribe must be dropped');
    // a retry sends the subscribe again
    const retry = track (exchange.watchTrades ('BTC/USD:USDC'));
    const retryRequest = await waitForSent (client, 4, 'watchTrades retry');
    assert.strictEqual (retryRequest['method'], 'subscribe');
    assert.notStrictEqual (retryRequest['id'], tradesRequest['id'], 'the retry must send a new subscribe request');
    // a private watch on another channel must not wait for an auth reply that never comes
    const ethOrders = track (exchange.watchOrders ('ETH/USD:USDC'));
    const ethRequest = await waitForSent (client, 5, 'second watchOrders subscribe');
    assert.strictEqual (ethRequest['method'], 'subscribe', 'the connection is still authenticated, no new auth request is expected');
    assert.strictEqual (ethRequest['params']['channel'], 'orders.ETH-USD-PERP');
    client.reject (new Error ('cleanup'));
    await sleep (1);
    assert ((retry['settled'] === true) && (ethOrders['settled'] === true) && (orders['settled'] === true), 'cleanup must settle every pending watch');
}

async function testUnknownErrorReAuthenticates () {
    // an error frame that answers no known request rejects every watcher, the next private watch
    // must send the auth again rather than wait on an auth future that was rejected
    const harness = createHarness ();
    const exchange = harness['exchange'];
    const client = harness['client'];
    const orders = await authenticatedOrdersWatch (exchange, client, 'BTC/USD:USDC');
    deliver (exchange, client, errorFrame (-32603, 'internal error'));
    await sleep (1);
    assert (orders['error'] instanceof ExchangeError, 'an error frame without a known id must reject every watcher, got ' + String (orders['error']));
    assert (!('authenticated' in client.subscriptions), 'the auth must be dropped, so the next private watch authenticates again');
    const next = track (exchange.watchOrders ('ETH/USD:USDC'));
    const auth = await waitForSent (client, 3, 'second auth');
    assert.strictEqual (auth['method'], 'auth', 'the next private watch must authenticate again instead of hanging');
    deliver (exchange, client, authReply (auth['id']));
    const subscribe = await waitForSent (client, 4, 'second watchOrders subscribe');
    assert.strictEqual (subscribe['params']['channel'], 'orders.ETH-USD-PERP');
    client.reject (new Error ('cleanup'));
    await sleep (1);
    assert (next['settled'] === true, 'cleanup must settle the pending watch');
}

async function testRefusedAuth () {
    const harness = createHarness ();
    const exchange = harness['exchange'];
    const client = harness['client'];
    const orders = track (exchange.watchOrders ('BTC/USD:USDC'));
    const auth = await waitForSent (client, 1, 'auth');
    deliver (exchange, client, errorFrame (40111, 'invalid bearer token', auth['id']));
    await sleep (1);
    assert (orders['error'] instanceof AuthenticationError, 'error code 40111 must reject with AuthenticationError, got ' + String (orders['error']));
    assert (!('authenticated' in client.subscriptions), 'a refused auth must be dropped, so the next call authenticates again');
    assert.strictEqual (client.sentMessages.length, 1, 'no subscribe may be sent after a refused auth');
    const retry = track (exchange.watchOrders ('BTC/USD:USDC'));
    const retryAuth = await waitForSent (client, 2, 'auth retry');
    assert.strictEqual (retryAuth['method'], 'auth');
    client.reject (new Error ('cleanup'));
    await sleep (1);
    assert (retry['settled'] === true, 'cleanup must settle the pending watch');
}

async function testSubscribeAckIsNotTheAuthReply () {
    // a subscribe ack arriving while the auth is in flight must not let the private subscribe go out
    const harness = createHarness ();
    const exchange = harness['exchange'];
    const client = harness['client'];
    const trades = track (exchange.watchTrades ('BTC/USD:USDC'));
    const tradesRequest = await waitForSent (client, 1, 'watchTrades subscribe');
    const orders = track (exchange.watchOrders ('BTC/USD:USDC'));
    const auth = await waitForSent (client, 2, 'auth');
    assert.strictEqual (auth['method'], 'auth');
    deliver (exchange, client, subscribeAck (tradesRequest['id'], 'trades.BTC-USD-PERP'));
    // an ack without an id, as older servers sent, must not resolve the auth either
    deliver (exchange, client, { 'jsonrpc': '2.0', 'result': { 'channel': 'trades.BTC-USD-PERP' }});
    await sleep (5);
    assert.strictEqual (client.sentMessages.length, 2, 'a subscribe ack must not be taken for the auth reply');
    deliver (exchange, client, authReply (auth['id']));
    const subscribe = await waitForSent (client, 3, 'watchOrders subscribe');
    assert.strictEqual (subscribe['params']['channel'], 'orders.BTC-USD-PERP');
    client.reject (new Error ('cleanup'));
    await sleep (1);
    assert ((trades['settled'] === true) && (orders['settled'] === true), 'cleanup must settle every pending watch');
}

async function testFirstWatchCountsAsADial () {
    // building the request must not create the client: watch counts a missing client as a new
    // dial and applies the reconnect backoff to it
    const exchange: any = new paradex ({ 'enableRateLimit': false });
    exchange.setMarkets ([ BTC_PERP, ETH_PERP ]);
    exchange.clients = {};
    const url = exchange.getWsUrl ();
    const createClient = exchange.client.bind (exchange);
    exchange.client = (clientUrl: string) => {
        if (!(clientUrl in exchange.clients)) {
            installClient (exchange, clientUrl);
        }
        return createClient (clientUrl);
    };
    let dials = 0;
    exchange.calculateWsBackoffDelay = () => {
        dials = dials + 1;
        return 0;
    };
    const trades = track (exchange.watchTrades ('BTC/USD:USDC'));
    const client = exchange.clients[url];
    await waitForSent (client, 1, 'watchTrades subscribe');
    assert.strictEqual (dials, 1, 'the first watch on a new connection must go through the reconnect backoff');
    client.reject (new Error ('cleanup'));
    await sleep (1);
    assert (trades['settled'] === true, 'cleanup must settle the pending watch');
}

async function testRefusedWatchMultipleKeepsLiveHashes () {
    // watchTickers ([ BTC ]) is live, watchTickers ([ BTC, ETH ]) subscribes again for ETH and is
    // refused: only ETH is dropped, the BTC subscription and its watcher are untouched
    const harness = createHarness ();
    const exchange = harness['exchange'];
    const client = harness['client'];
    const btcHash = 'markets_summary.BTC/USD:USDC';
    const ethHash = 'markets_summary.ETH/USD:USDC';
    const btc = track (exchange.watchTickers ([ 'BTC/USD:USDC' ]));
    const first = await waitForSent (client, 1, 'first watchTickers subscribe');
    deliver (exchange, client, subscribeAck (first['id'], 'markets_summary'));
    const both = track (exchange.watchTickers ([ 'BTC/USD:USDC', 'ETH/USD:USDC' ]));
    const second = await waitForSent (client, 2, 'second watchTickers subscribe');
    deliver (exchange, client, errorFrame (42900, 'max subscriptions per connection reached', second['id']));
    await sleep (1);
    assert (btcHash in client.subscriptions, 'a refused request must not drop the subscriptions it did not add');
    assert (!(ethHash in client.subscriptions), 'the subscription the refused request added must be dropped');
    assert (btc['settled'] !== true, 'a refused request must not reject the watchers of a live subscription');
    client.reject (new Error ('cleanup'));
    await sleep (1);
    assert ((btc['settled'] === true) && (both['settled'] === true), 'cleanup must settle every pending watch');
}

async function testErrorCodeMapping () {
    const cases = [
        [ -32600, 'invalid subscribe request', BadRequest ],
        [ 40111, 'invalid bearer token', AuthenticationError ],
        [ 40300, 'permission denied', PermissionDenied ],
        [ 40301, 'sbe required', NotSupported ],
        [ 42900, 'max subscriptions per connection reached', OperationRejected ],
        [ 42901, 'rate limited', RateLimitExceeded ],
        [ 12345, 'an unknown error', ExchangeError ],
    ];
    for (let i = 0; i < cases.length; i++) {
        const [ code, message, errorClass ] = cases[i] as any;
        const harness = createHarness ();
        const exchange = harness['exchange'];
        const client = harness['client'];
        const trades = track (exchange.watchTrades ('BTC/USD:USDC'));
        const request = await waitForSent (client, 1, 'watchTrades subscribe');
        deliver (exchange, client, errorFrame (code, message, request['id']));
        await sleep (1);
        const error = trades['error'];
        assert (error instanceof errorClass, 'error code ' + code.toString () + ' must reject with ' + errorClass.name + ', got ' + String (error));
        if (code === 42900) {
            // the subscription cap holds until a channel is unsubscribed, a caller must not retry it as a network error
            assert (!(error instanceof NetworkError), 'error code 42900 must not be a retryable NetworkError');
        }
        if (errorClass === ExchangeError) {
            assert (!(error instanceof BadRequest), 'an unknown code must not be reported as BadRequest');
        }
    }
}

async function testParadexErrorFrame () {
    await testRefusedSubscribeRejectsOnlyItsWatchers ();
    await testUnknownErrorReAuthenticates ();
    await testRefusedAuth ();
    await testSubscribeAckIsNotTheAuthReply ();
    await testErrorCodeMapping ();
    await testFirstWatchCountsAsADial ();
    await testRefusedWatchMultipleKeepsLiveHashes ();
}

export default testParadexErrorFrame;

const invokedDirectly = process.argv[1] !== undefined && process.argv[1].indexOf ('test.errorFrame.paradex') !== -1;
if (invokedDirectly) {
    testParadexErrorFrame ().then (() => {
        console.log ('test.errorFrame.paradex passed');
    }).catch ((e) => {
        console.error (e);
        process.exit (1);
    });
}
