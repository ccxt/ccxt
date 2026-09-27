import assert from 'assert';
import { NetworkError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// NO_AUTO_TRANSPILE
// native ts test, intentionally not transpiled - pins the pending-unsubscribe
// serialization from https://github.com/ccxt/ccxt/issues/30419 on hyperliquid:
// a watch armed while the matching unWatch* ack is still in flight must wait
// for that ack and then send a fresh subscribe, instead of being silently
// deduplicated against the stale subscription entry (no subscribe sent) and
// having its future rejected by the ack. the pending hashes are deliberately
// different per method ('tickers', 'myTrades', 'order', the balance/positions
// topic), so each pairing below derives the hash from the real unWatch* call
// instead of hardcoding it - when an unWatch* implementation changes its hash,
// the pairing breaks here first

const WALLET = '0x1234567890abcdef1234567890abcdef12345678';

const SWAP_MARKET = {
    'id': 'XRP',
    'symbol': 'XRP/USDC:USDC',
    'base': 'XRP',
    'quote': 'USDC',
    'settle': 'USDC',
    'baseId': 'XRP',
    'quoteId': 'USDC',
    'settleId': 'USDC',
    'type': 'swap',
    'spot': false,
    'swap': true,
    'future': false,
    'option': false,
    'contract': true,
    'linear': true,
    'inverse': false,
    'contractSize': 1,
    'active': true,
    'baseName': 'XRP',
    'precision': { 'amount': 1, 'price': 5 },
    'limits': {},
};

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function makeOfflineHyperliquid () {
    const exchange = new ccxt.pro.hyperliquid ({
        'walletAddress': WALLET,
        // enableUnifiedMargin pinned so isUnifiedEnabled () takes the option
        // path and watchBalance/unWatchBalance stay offline
        'options': { 'defaultType': 'swap', 'enableUnifiedMargin': false },
    });
    exchange.setMarkets ([ SWAP_MARKET ]);
    // transport-level stub: capture the subscribe hash and return a result
    // shaped well enough for every watch* post-processing path
    (exchange as any).lastSubscribeHash = undefined;
    (exchange as any).watch = async (url: any, messageHash: any, message: any, subscribeHash: any) => {
        (exchange as any).lastSubscribeHash = subscribeHash;
        const stub: any = [];
        stub.limit = () => stub; // watchOrderBook calls orderbook.limit ()
        stub.getLimit = () => undefined; // trades/ohlcv/orders call cache.getLimit ()
        return stub;
    };
    return exchange;
}

async function testPairing (label: string, unWatchCall: any, watchCall: any) {
    const exchange = makeOfflineHyperliquid ();
    const url = exchange.urls['api']['ws']['public'];
    // 1 - the hash the unWatch* registers is the ground truth for the guard
    await unWatchCall (exchange);
    const pendingHash = (exchange as any).lastSubscribeHash;
    assert (typeof pendingHash === 'string' && pendingHash.startsWith ('unsubscribe:'), label + ': unWatch must register an unsubscribe:<subHash> subscription, got ' + String (pendingHash));
    // 2 - plant the in-flight unsubscribe on a real (never-dialed) client: the
    // bookkeeping entry plus the future the unWatch caller is awaiting
    const client: any = exchange.client (url);
    client.subscriptions[pendingHash] = true;
    client.future (pendingHash);
    // 3 - the paired watch must wait on that future - no throw, no subscribe
    (exchange as any).lastSubscribeHash = undefined;
    const outcome: any = { 'settled': false, 'error': undefined };
    const watching = watchCall (exchange).then (() => {
        outcome['settled'] = true;
    }, (e: any) => {
        outcome['settled'] = true;
        outcome['error'] = e;
    });
    await sleep (10);
    assert (outcome['settled'] === false, label + ': watch must wait while the unsubscribe ack is pending');
    assert ((exchange as any).lastSubscribeHash === undefined, label + ': watch must not subscribe before the pending ack lands');
    // 4 - simulate the ack the way cleanUnsubscription runs it: sweep the
    // bookkeeping, then resolve the shared future
    delete client.subscriptions[pendingHash];
    client.resolve (true, pendingHash);
    await watching;
    assert (outcome['error'] === undefined, label + ': watch must resolve once the ack lands, got ' + String (outcome['error']));
    assert ((exchange as any).lastSubscribeHash !== undefined, label + ': watch must send a fresh subscribe after the ack');
}

async function testDisconnectWhileWaiting () {
    // a dropped connection rejects every client future (client.reset), so a
    // watch parked on the pending unsubscribe must fail with that transport
    // error instead of hanging forever
    const exchange = makeOfflineHyperliquid ();
    const url = exchange.urls['api']['ws']['public'];
    const pendingHash = 'unsubscribe:candles:5m:XRP/USDC:USDC';
    const client: any = exchange.client (url);
    client.subscriptions[pendingHash] = true;
    client.future (pendingHash);
    const outcome: any = { 'settled': false, 'error': undefined };
    const watching = exchange.watchOHLCV ('XRP/USDC:USDC', '5m').then (() => {
        outcome['settled'] = true;
    }, (e: any) => {
        outcome['settled'] = true;
        outcome['error'] = e;
    });
    await sleep (10);
    assert (outcome['settled'] === false, 'disconnect: watch must be waiting before the rejection');
    delete client.subscriptions[pendingHash];
    client.reject (new NetworkError ('connection dropped'), pendingHash);
    await watching;
    assert (outcome['error'] instanceof NetworkError, 'disconnect: the waiting watch must surface the transport error, got ' + String (outcome['error']));
}

async function testPositionsUnsubscribeAckRouting () {
    // pins the 'clearinghoustState' -> 'clearinghouseState' routing typo fix:
    // the unsubscribe ack echoes the type we send, so with the typo the
    // positions handler never ran, the pending entry was never swept and the
    // unWatch future never resolved - with the serialization in place that
    // would have parked every later watch forever
    const exchange = makeOfflineHyperliquid ();
    const url = exchange.urls['api']['ws']['public'];
    const client: any = exchange.client (url);
    client.subscriptions['unsubscribe:clearinghouseState'] = true;
    client.subscriptions['clearinghouseState'] = true;
    const ack = {
        'channel': 'subscriptionResponse',
        'data': {
            'method': 'unsubscribe',
            'subscription': { 'type': 'clearinghouseState', 'user': WALLET },
        },
    };
    exchange.handleSubscriptionResponse (client, ack);
    assert (!('unsubscribe:clearinghouseState' in client.subscriptions), 'the positions unsubscribe ack must sweep the pending unsubscribe entry');
    assert (!('clearinghouseState' in client.subscriptions), 'the positions unsubscribe ack must sweep the subscription entry');
    // and a later watch passes straight through the guard
    (exchange as any).lastSubscribeHash = undefined;
    await exchange.watchPositions ();
    assert ((exchange as any).lastSubscribeHash !== undefined, 'watchPositions must subscribe after the unsubscribe ack is routed');
}

async function testHyperliquidPendingUnsubscribe () {
    await testPairing ('orderBook', (ex: any) => ex.unWatchOrderBook ('XRP/USDC:USDC'), (ex: any) => ex.watchOrderBook ('XRP/USDC:USDC'));
    await testPairing ('ticker', (ex: any) => ex.unWatchTicker ('XRP/USDC:USDC'), (ex: any) => ex.watchTicker ('XRP/USDC:USDC'));
    await testPairing ('tickers', (ex: any) => ex.unWatchTickers (), (ex: any) => ex.watchTickers ());
    await testPairing ('trades', (ex: any) => ex.unWatchTrades ('XRP/USDC:USDC'), (ex: any) => ex.watchTrades ('XRP/USDC:USDC'));
    await testPairing ('ohlcv', (ex: any) => ex.unWatchOHLCV ('XRP/USDC:USDC', '5m'), (ex: any) => ex.watchOHLCV ('XRP/USDC:USDC', '5m'));
    await testPairing ('myTrades', (ex: any) => ex.unWatchMyTrades (), (ex: any) => ex.watchMyTrades ());
    await testPairing ('orders', (ex: any) => ex.unWatchOrders (), (ex: any) => ex.watchOrders ());
    await testPairing ('positions', (ex: any) => ex.unWatchPositions (), (ex: any) => ex.watchPositions ());
    await testPairing ('balance', (ex: any) => ex.unWatchBalance (), (ex: any) => ex.watchBalance ());
    // the swap balance and positions share the 'clearinghouseState' server
    // subscription, so a pending unWatchPositions delays watchBalance too -
    // intended: the pending unsubscribe tears the shared stream down for both
    await testPairing ('positions delays balance (shared topic)', (ex: any) => ex.unWatchPositions (), (ex: any) => ex.watchBalance ());
    await testDisconnectWhileWaiting ();
    await testPositionsUnsubscribeAckRouting ();
}

export default testHyperliquidPendingUnsubscribe;
