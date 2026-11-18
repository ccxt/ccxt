// NO_AUTO_TRANSPILE
import assert from 'assert';
import mexc from '../../mexc.js';
import Client from '../../../base/ws/Client.js';

// native ts test, intentionally not transpiled: pins the frame order of the
// mexc unWatch* methods that build a single-channel unsubscribe (order book,
// ticker, trades, ohlcv, funding rate). The static ws fixture runs one method
// per case on a fresh exchange, so it cannot see the order of frames across
// calls. Two regressions are covered:
// - the unsubscribe frame must be on the wire before a watch* that the caller
//   makes right after unWatch* returns, otherwise mexc applies the unsubscribe
//   last and the new stream stays silent
// - unWatch* must not leave its 'unsubscribe:...' entry in client.subscriptions
//   (a deferred send used to register it after the cleanup had already run)

const SPOT_MARKET = {
    'id': 'BTCUSDT',
    'symbol': 'BTC/USDT',
    'base': 'BTC',
    'quote': 'USDT',
    'baseId': 'BTC',
    'quoteId': 'USDT',
    'type': 'spot',
    'spot': true,
    'swap': false,
    'future': false,
    'option': false,
    'contract': false,
    'active': true,
    'precision': { 'amount': 0.000001, 'price': 0.01 },
    'limits': {},
};

const SWAP_MARKET = {
    'id': 'BTC_USDT',
    'symbol': 'BTC/USDT:USDT',
    'base': 'BTC',
    'quote': 'USDT',
    'settle': 'USDT',
    'baseId': 'BTC',
    'quoteId': 'USDT',
    'settleId': 'USDT',
    'type': 'swap',
    'spot': false,
    'swap': true,
    'future': false,
    'option': false,
    'contract': true,
    'linear': true,
    'inverse': false,
    'contractSize': 0.0001,
    'active': true,
    'precision': { 'amount': 1, 'price': 0.1 },
    'limits': {},
};

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function stubClient (url: string, sent: any[]) {
    const noop = () => {};
    const client = new Client (url, noop, noop, noop, noop, {});
    client.connect = () => {
        if (client.isConnected !== true) {
            client.isConnected = true;
            (client.connected as any).resolve (url);
        }
        return client.connected;
    };
    client.send = async (message: any) => {
        sent.push (message);
        return message;
    };
    return client;
}

function createHarness () {
    const exchange = new mexc ({
        'enableRateLimit': false,
    });
    exchange.setMarkets ([ SPOT_MARKET, SWAP_MARKET ]);
    const sent: any[] = [];
    exchange.clients = {};
    // the transport-less base Client (connect/send stubbed above) stands in for
    // WsClient, so the structural mismatch is cast away
    exchange.clients[exchange.urls['api']['ws']['spot']] = stubClient (exchange.urls['api']['ws']['spot'], sent) as any;
    exchange.clients[exchange.urls['api']['ws']['swap']] = stubClient (exchange.urls['api']['ws']['swap'], sent) as any;
    return { 'exchange': exchange, 'sent': sent };
}

function frameKind (frame: any) {
    const method = String (frame['method']);
    if (method === 'UNSUBSCRIPTION' || method.startsWith ('unsub.')) {
        return 'unsub';
    }
    if (method === 'SUBSCRIPTION' || method.startsWith ('sub.')) {
        return 'sub';
    }
    return method;
}

function fireAndForget (promise: any) {
    // the watch futures never settle here (no data is fed), or are rejected
    // with UnsubscribeError by the next unWatch* - neither matters to the test
    promise.catch (() => {});
}

async function testCycle (label: string, watchCall: any, unWatchCall: any) {
    const harness = createHarness ();
    const exchange = harness.exchange;
    const sent = harness.sent;
    fireAndForget (watchCall (exchange));
    await sleep (0);
    await unWatchCall (exchange);
    fireAndForget (watchCall (exchange));
    await sleep (0);
    await unWatchCall (exchange);
    await sleep (0);
    const kinds = sent.map (frameKind);
    assert.deepStrictEqual (kinds, [ 'sub', 'unsub', 'sub', 'unsub' ], label + ': watch → unWatch → watch → unWatch must put sub, unsub, sub, unsub on the wire in that order, got ' + JSON.stringify (sent));
    const urls = Object.keys (exchange.clients);
    for (let i = 0; i < urls.length; i++) {
        const leftover = Object.keys (exchange.clients[urls[i]].subscriptions);
        assert.deepStrictEqual (leftover, [], label + ': unWatch must leave no subscription entries behind, got ' + JSON.stringify (leftover));
    }
}

async function testMexcUnWatchOrdering () {
    await testCycle ('swap orderBook', (ex: any) => ex.watchOrderBook ('BTC/USDT:USDT'), (ex: any) => ex.unWatchOrderBook ('BTC/USDT:USDT'));
    await testCycle ('spot orderBook', (ex: any) => ex.watchOrderBook ('BTC/USDT'), (ex: any) => ex.unWatchOrderBook ('BTC/USDT'));
    await testCycle ('swap ticker', (ex: any) => ex.watchTicker ('BTC/USDT:USDT'), (ex: any) => ex.unWatchTicker ('BTC/USDT:USDT'));
    await testCycle ('spot ticker', (ex: any) => ex.watchTicker ('BTC/USDT'), (ex: any) => ex.unWatchTicker ('BTC/USDT'));
    await testCycle ('swap trades', (ex: any) => ex.watchTrades ('BTC/USDT:USDT'), (ex: any) => ex.unWatchTrades ('BTC/USDT:USDT'));
    await testCycle ('spot trades', (ex: any) => ex.watchTrades ('BTC/USDT'), (ex: any) => ex.unWatchTrades ('BTC/USDT'));
    await testCycle ('swap ohlcv', (ex: any) => ex.watchOHLCV ('BTC/USDT:USDT', '1m'), (ex: any) => ex.unWatchOHLCV ('BTC/USDT:USDT', '1m'));
    await testCycle ('spot ohlcv', (ex: any) => ex.watchOHLCV ('BTC/USDT', '1m'), (ex: any) => ex.unWatchOHLCV ('BTC/USDT', '1m'));
    await testCycle ('swap fundingRate', (ex: any) => ex.watchFundingRate ('BTC/USDT:USDT'), (ex: any) => ex.unWatchFundingRate ('BTC/USDT:USDT'));
}

export default testMexcUnWatchOrdering;

const invokedDirectly = process.argv[1] !== undefined && process.argv[1].indexOf ('test.unWatchOrdering.mexc') !== -1;
if (invokedDirectly) {
    testMexcUnWatchOrdering ().then (() => {
        console.log ('test.unWatchOrdering.mexc passed');
    }).catch ((e) => {
        console.error (e);
        process.exit (1);
    });
}
