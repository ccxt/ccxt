import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// NO_AUTO_TRANSPILE
// native ts test, intentionally not transpiled - pins the paradex subscription
// bookkeeping that a static ws fixture cannot reach, since a fixture calls one
// watch method with one input: a second watchTickers call adds its markets to
// the scoped markets_summary subscription with modify_subscription, a failed
// modify forgets only the markets it carried, a market on the snapshot order
// book feed is unsubscribed from it, and the reply awaited, before its deltas
// feed is subscribed, an error reply to the unsubscribe of a resync rejects no
// watcher, and a markets summary frame of a market nobody subscribed to is
// dropped before it is decoded, and the subscribes of a call watching several
// markets go one at a time, each once the previous one is acknowledged, a failed
// request rejects the watchers of its own markets only, an all-markets summary
// subscribe drops the scoped one first, and liquidations are kept between calls

const WS_URL = 'wss://ws.api.prod.paradex.trade/v1?sbeSchemaId=1&sbeSchemaVersion=3';

function perp (base: string) {
    return {
        'id': base + '-USD-PERP',
        'symbol': base + '/USD:USDC',
        'base': base,
        'quote': 'USD',
        'settle': 'USDC',
        'baseId': base,
        'quoteId': 'USD',
        'settleId': 'USDC',
        'type': 'swap',
        'spot': false,
        'swap': true,
        'future': false,
        'option': false,
        'contract': true,
        'linear': true,
        'inverse': false,
        'active': true,
        'contractSize': 1,
        'precision': { 'amount': 0.001, 'price': 0.1 },
        'limits': { 'amount': {}, 'price': {}, 'cost': {}, 'leverage': {} },
        'info': {},
    };
}

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function createHarness () {
    const exchange = new (ccxt.pro as any).paradex ({
        'enableRateLimit': false,
        'markets': {
            'BTC/USD:USDC': perp ('BTC'),
            'ETH/USD:USDC': perp ('ETH'),
            'SOL/USD:USDC': perp ('SOL'),
        },
    });
    const client = exchange.client (WS_URL);
    const sent: any[] = [];
    client.startedConnecting = true;
    client.isConnected = true;
    client.connection = {
        'readyState': 1,
        'send': (message: any, options: any = undefined, callback: any = undefined) => {
            sent.push (JSON.parse (message));
            if (callback !== undefined) {
                callback ();
            }
        },
        'close': () => {},
    };
    client.connected.resolve (WS_URL);
    return { 'exchange': exchange, 'client': client, 'sent': sent };
}

function reply (id: number, result: any) {
    return { 'jsonrpc': '2.0', 'id': id, 'result': result };
}

// a captured MarketSummaryEvent frame of BTC-USD-PERP (schema 1:3)
const BTC_SUMMARY = 'f8000400010003008028cba1bd5d06000000000000000000f4d179b98f070000ea20e9ae8e070000805c6ab2900700002462df31de2e0100f093dfdb01000000581f00000000000080a200a58f070000803143d88f070000ffffffffffffff7f54150f000000000000000000000000800000000000000080000000000000008000000000000000803db3f605000000000000000000000000000000000000000000000000000000800000000000000080000000000000008000000000000000800000000000000080858472d18d070000c8dc310100000000d8b96d000000000000000000000000800000000000000000ba7ac8040000000000000000000000800c4254432d5553442d50455250';

// a captured TradeEvent frame of BTC-USD-PERP, its trade type set to LIQUIDATION
const BTC_LIQUIDATION = '320001000100020098c258a6ba5d060080876aca01000000327a5c24817a3b21018049d7fa93070000b87603000000000098c258a6ba5d0600020c4254432d5553442d504552501c31373931393036303936333930323031373039323333343730303032';

async function testParadexScopedTickers () {
    const { exchange, client, sent } = createHarness ();
    const first = exchange.watchTickers ([ 'BTC/USD:USDC' ]);
    first.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 1, 'the first watchTickers call must send one subscribe');
    assert.deepStrictEqual (sent[0]['params'], { 'channel': 'markets_summary', 'markets': [ 'BTC-USD-PERP' ] }, 'the subscribe must carry the market filter');
    // a second call adds only its new markets, in place
    const second = exchange.watchTickers ([ 'BTC/USD:USDC', 'ETH/USD:USDC' ]);
    second.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 2, 'a call with a new market must send one more request');
    assert.equal (sent[1]['method'], 'modify_subscription', 'a new market joins the scoped subscription');
    assert.deepStrictEqual (sent[1]['params'], { 'channel': 'markets_summary', 'add': [ 'ETH-USD-PERP' ] }, 'only the new market is added');
    // the markets already in the filter send nothing
    const third = exchange.watchTicker ('ETH/USD:USDC');
    third.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 2, 'a market already in the filter must not send a request');
    // a failed modify forgets the markets it carried, the scoped subscription stays
    exchange.handleMessage (client, { 'jsonrpc': '2.0', 'id': sent[1]['id'], 'error': { 'code': -32600, 'message': 'invalid modify_subscription request', 'data': 'unknown market in add' }});
    assert (!('markets_summary.ETH-USD-PERP' in client.subscriptions), 'a failed modify must forget its market');
    assert ('markets_summary.BTC-USD-PERP' in client.subscriptions, 'a failed modify must keep the markets added before');
    assert ('markets_summary:scoped' in client.subscriptions, 'a failed modify must keep the scoped subscription');
    let rejected = false;
    try {
        await second;
    } catch (e) {
        rejected = true;
    }
    assert (rejected, 'the watch that sent the failed modify must reject');
    let firstError: any = undefined;
    first.catch ((e: any) => {
        firstError = e;
    });
    await sleep (0);
    assert.equal (firstError, undefined, 'a failed modify must not reject the watchers of the markets subscribed before');
    const retry = exchange.watchTickers ([ 'ETH/USD:USDC' ]);
    retry.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 3, 'the next watch must add the forgotten market again');
    assert.equal (sent[2]['method'], 'modify_subscription', 'the forgotten market is added in place again');
    client.reject (new Error ('cleanup'));
}

async function testParadexAllMarketsSummary () {
    const { exchange, sent } = createHarness ();
    const all = exchange.watchTickers ();
    all.catch (() => {});
    await sleep (0);
    assert.deepStrictEqual (sent[0]['params'], { 'channel': 'markets_summary' }, 'watchTickers without symbols takes the all-markets channel');
    const one = exchange.watchTicker ('BTC/USD:USDC');
    one.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 1, 'the all-markets subscription already carries every market');
    exchange.client (WS_URL).reject (new Error ('cleanup'));
}

async function testParadexSummaryDroppedUnlessSubscribed () {
    const { exchange, client } = createHarness ();
    const frame = exchange.base16ToBinary (BTC_SUMMARY);
    assert.equal (exchange.parseSbeMessage (client, frame), undefined, 'a summary of a market nobody subscribed to must be dropped');
    client.subscriptions['markets_summary.BTC-USD-PERP'] = { 'id': 1 };
    const parsed = exchange.parseSbeMessage (client, frame);
    assert.equal (parsed['params']['data']['symbol'], 'BTC-USD-PERP', 'a summary of a subscribed market must be decoded');
    delete client.subscriptions['markets_summary.BTC-USD-PERP'];
    client.subscriptions['markets_summary'] = { 'id': 2 };
    assert (exchange.parseSbeMessage (client, frame) !== undefined, 'the all-markets subscription takes every summary');
}

async function testParadexSnapshotToDeltas () {
    const { exchange, client, sent } = createHarness ();
    const snapshotChannel = 'order_book.BTC-USD-PERP.snapshot@15@100ms';
    const deltasChannel = 'order_book.BTC-USD-PERP.deltas';
    const snapshotWatch = exchange.watchOrderBook ('BTC/USD:USDC');
    snapshotWatch.catch (() => {});
    await sleep (0);
    assert.deepStrictEqual (sent[0]['params'], { 'channel': snapshotChannel }, 'a book without a limit takes the snapshot feed');
    exchange.handleMessage (client, reply (sent[0]['id'], { 'channel': snapshotChannel }));
    const deltasWatch = exchange.watchOrderBook ('BTC/USD:USDC', 100);
    deltasWatch.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 2, 'the snapshot feed is unsubscribed first');
    assert.equal (sent[1]['method'], 'unsubscribe', 'the snapshot feed is unsubscribed first');
    assert.deepStrictEqual (sent[1]['params'], { 'channel': snapshotChannel }, 'the snapshot feed is unsubscribed first');
    assert (!(snapshotChannel in client.subscriptions), 'the snapshot feed subscription is forgotten');
    // a snapshot watcher calling again while the unsubscribe is in flight stays on the deltas feed
    const againWatch = exchange.watchOrderBook ('BTC/USD:USDC');
    againWatch.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 3, 'a call during the switch takes the deltas feed');
    assert.deepStrictEqual (sent[2]['params'], { 'channel': deltasChannel }, 'a call during the switch takes the deltas feed');
    exchange.handleMessage (client, reply (sent[1]['id'], { 'channel': snapshotChannel }));
    await sleep (0);
    assert.equal (sent.length, 3, 'the deltas feed is subscribed once');
    assert (!(snapshotChannel in client.subscriptions), 'the snapshot feed is not subscribed again');
    // the deltas feed is a superset, a later call without a limit keeps it
    const laterWatch = exchange.watchOrderBook ('BTC/USD:USDC');
    laterWatch.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 3, 'a market on the deltas feed stays on it');
    client.reject (new Error ('cleanup'));
}

async function testParadexResyncUnsubscribeError () {
    const { exchange, client, sent } = createHarness ();
    const deltasChannel = 'order_book.BTC-USD-PERP.deltas';
    client.subscriptions[deltasChannel] = { 'id': 1, 'messageHashes': [ 'orderbook:BTC/USD:USDC' ] };
    await exchange.resubscribeOrderBook (client, deltasChannel, 'orderbook:BTC/USD:USDC');
    assert.equal (sent.length, 2, 'a resync sends an unsubscribe and a subscribe');
    assert.equal (sent[0]['method'], 'unsubscribe', 'a resync unsubscribes first');
    assert.equal (sent[1]['method'], 'subscribe', 'a resync subscribes again');
    assert.equal (client.subscriptions[deltasChannel]['id'], sent[1]['id'], 'the subscription keeps the id of the new subscribe');
    const pending = exchange.watchOrderBook ('BTC/USD:USDC', 100);
    let error: any = undefined;
    pending.catch ((e: any) => {
        error = e;
    });
    await sleep (0);
    exchange.handleMessage (client, { 'jsonrpc': '2.0', 'id': sent[0]['id'], 'error': { 'code': -32600, 'message': 'invalid unsubscribe request' }});
    await sleep (0);
    assert.equal (error, undefined, 'an error reply to the unsubscribe of a resync must not reject the book watcher');
    assert (deltasChannel in client.subscriptions, 'an error reply to the unsubscribe of a resync must keep the feed subscription');
    client.reject (new Error ('cleanup'));
}

async function testParadexSubscribePerMarket () {
    const { exchange, client, sent } = createHarness ();
    const pending = exchange.watchTradesForSymbols ([ 'BTC/USD:USDC', 'ETH/USD:USDC' ]);
    pending.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 1, 'the second subscribe waits for the first to be acknowledged');
    assert.deepStrictEqual (sent[0]['params'], { 'channel': 'trades.BTC-USD-PERP' }, 'one channel per subscribe');
    exchange.handleMessage (client, reply (sent[0]['id'], { 'channel': 'trades.BTC-USD-PERP' }));
    await sleep (0);
    assert.equal (sent.length, 2, 'the second subscribe goes once the first is acknowledged');
    assert.deepStrictEqual (sent[1]['params'], { 'channel': 'trades.ETH-USD-PERP' }, 'one channel per subscribe');
    // an error reply to a subscribe rejects the watch and forgets the channel, so the next watch sends it again
    const failing = exchange.watchTradesForSymbols ([ 'SOL/USD:USDC', 'BTC/USD:USDC' ]);
    let error: any = undefined;
    failing.catch ((e: any) => {
        error = e;
    });
    await sleep (0);
    assert.equal (sent.length, 3, 'only the channel not subscribed yet is sent');
    exchange.handleMessage (client, { 'jsonrpc': '2.0', 'id': sent[2]['id'], 'error': { 'code': -32600, 'message': 'invalid subscribe request' }});
    await sleep (0);
    assert (error !== undefined, 'an error reply to the subscribe rejects the watch');
    assert (!('trades.SOL-USD-PERP' in client.subscriptions), 'the failed channel is forgotten');
    let pendingError: any = undefined;
    pending.catch ((e: any) => {
        pendingError = e;
    });
    await sleep (0);
    assert.equal (pendingError, undefined, 'an error reply to a subscribe must not reject the watchers of other channels');
    client.reject (new Error ('cleanup'));
}

async function testParadexThreeChannels () {
    // every channel is subscribed, each once the previous one is acknowledged
    const { exchange, client, sent } = createHarness ();
    const pending = exchange.watchTradesForSymbols ([ 'BTC/USD:USDC', 'ETH/USD:USDC', 'SOL/USD:USDC' ]);
    pending.catch (() => {});
    await sleep (0);
    exchange.handleMessage (client, reply (sent[0]['id'], { 'channel': 'trades.BTC-USD-PERP' }));
    await sleep (0);
    assert.equal (sent.length, 2, 'the second subscribe goes once the first is acknowledged');
    exchange.handleMessage (client, reply (sent[1]['id'], { 'channel': 'trades.ETH-USD-PERP' }));
    await sleep (0);
    assert.equal (sent.length, 3, 'the third subscribe goes once the second is acknowledged');
    assert.deepStrictEqual (sent[2]['params'], { 'channel': 'trades.SOL-USD-PERP' }, 'the third channel is subscribed');
    client.reject (new Error ('cleanup'));
}

async function testParadexOverlappingSubscribes () {
    // a channel subscribed by another watch while a call waits on an earlier acknowledgement is skipped, not awaited
    const { exchange, client, sent } = createHarness ();
    const many = exchange.watchTradesForSymbols ([ 'BTC/USD:USDC', 'ETH/USD:USDC', 'SOL/USD:USDC' ]);
    many.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 1, 'the first subscribe goes alone');
    const one = exchange.watchTrades ('ETH/USD:USDC');
    one.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 2, 'the other watch subscribes its channel');
    assert.deepStrictEqual (sent[1]['params'], { 'channel': 'trades.ETH-USD-PERP' }, 'the other watch subscribes its channel');
    exchange.handleMessage (client, reply (sent[0]['id'], { 'channel': 'trades.BTC-USD-PERP' }));
    await sleep (0);
    assert.equal (sent.length, 3, 'the call goes on with the channels still missing');
    assert.deepStrictEqual (sent[2]['params'], { 'channel': 'trades.SOL-USD-PERP' }, 'a channel subscribed meanwhile is not sent again');
    client.reject (new Error ('cleanup'));
}

async function testParadexAllMarketsAfterScoped () {
    // a plain subscribe keeps the market filter of a scoped subscription, so the scoped one is unsubscribed first
    const { exchange, client, sent } = createHarness ();
    const one = exchange.watchTicker ('BTC/USD:USDC');
    one.catch (() => {});
    await sleep (0);
    const all = exchange.watchTickers ();
    all.catch (() => {});
    await sleep (0);
    assert.equal (sent.length, 2, 'the scoped subscription is unsubscribed before the all-markets subscribe');
    assert.equal (sent[1]['method'], 'unsubscribe', 'the scoped subscription is unsubscribed first');
    assert (!('markets_summary.BTC-USD-PERP' in client.subscriptions), 'the scoped markets are forgotten');
    exchange.handleMessage (client, reply (sent[1]['id'], { 'channel': 'markets_summary' }));
    await sleep (0);
    assert.equal (sent.length, 3, 'the all-markets subscribe goes once the unsubscribe is acknowledged');
    assert.deepStrictEqual (sent[2]['params'], { 'channel': 'markets_summary' }, 'the all-markets subscribe has no filter');
    client.reject (new Error ('cleanup'));
}

async function testParadexLiquidationsKept () {
    // liquidations that arrive while nobody waits are returned by the next call
    const { exchange, client, sent } = createHarness ();
    const first = exchange.watchLiquidations ('BTC/USD:USDC');
    first.catch (() => {});
    await sleep (0);
    exchange.handleMessage (client, reply (sent[0]['id'], { 'channel': 'trades.BTC-USD-PERP' }));
    exchange.handleMessage (client, exchange.base16ToBinary (BTC_LIQUIDATION));
    const firstResult = await first;
    assert.equal (firstResult.length, 1, 'the first call returns the first liquidation');
    assert.equal (firstResult[0]['contractSize'], 1, 'the contract size comes from the market');
    exchange.handleMessage (client, exchange.base16ToBinary (BTC_LIQUIDATION));
    exchange.handleMessage (client, exchange.base16ToBinary (BTC_LIQUIDATION));
    const next = exchange.watchLiquidations ('BTC/USD:USDC');
    next.catch (() => {});
    await sleep (0);
    exchange.handleMessage (client, exchange.base16ToBinary (BTC_LIQUIDATION));
    const nextResult = await next;
    assert.equal (nextResult.length, 3, 'liquidations received between two calls are not dropped');
    client.reject (new Error ('cleanup'));
}

async function testParadexSubscriptions () {
    await testParadexScopedTickers ();
    await testParadexAllMarketsSummary ();
    await testParadexSummaryDroppedUnlessSubscribed ();
    await testParadexSnapshotToDeltas ();
    await testParadexResyncUnsubscribeError ();
    await testParadexSubscribePerMarket ();
    await testParadexThreeChannels ();
    await testParadexOverlappingSubscribes ();
    await testParadexAllMarketsAfterScoped ();
    await testParadexLiquidationsKept ();
}

export default testParadexSubscriptions;
