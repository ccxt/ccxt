import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// NO_AUTO_TRANSPILE
// native ts test, intentionally not transpiled - pins what the aster
// unsubscribe acknowledgement has to clean up. the static ws fixture
// (static/ws/aster.json) runs one unWatch* per case on a fresh exchange, so it
// proves the ack settles the call but cannot see what was left behind. this
// runs the full watchTrades -> unWatchTrades -> watchTrades cycle on one
// client: the ack must drop the 'trade::<symbol>' subscription (or the second
// watchTrades sends no SUBSCRIBE and waits forever) and the trades cache (or
// the second watchTrades returns the trades from before the unsubscribe)

const SYMBOL = 'BTC/USDT:USDT';

const WS_URL = 'wss://fstream.asterdex.com/stream';

const SWAP_MARKET = {
    'id': 'BTCUSDT',
    'symbol': SYMBOL,
    'base': 'BTC',
    'quote': 'USDT',
    'settle': 'USDT',
    'baseId': 'BTC',
    'quoteId': 'USDT',
    'settleId': 'USDT',
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
    'precision': { 'amount': 0.001, 'price': 0.1 },
    'limits': {},
};

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function makeOfflineAster () {
    const exchange = new ccxt.pro.aster ({});
    exchange.setMarkets ([ SWAP_MARKET ]);
    // put the client into an "already connected" state with a transport stub
    // that records the outgoing frames - everything above the socket
    // (subscriptions, futures, caches, message routing) runs unmodified
    const client: any = exchange.client (WS_URL);
    client.startedConnecting = true;
    client.isConnected = true;
    client.connectionEstablished = exchange.milliseconds ();
    client.sentFrames = [];
    client.connection = {
        'readyState': 1,
        'send': (message: any, options: any = undefined, callback: any = undefined) => {
            client.sentFrames.push (JSON.parse (message));
            if (callback !== undefined) {
                callback ();
            }
        },
        'close': () => {},
    };
    client.connected.resolve (WS_URL);
    return exchange;
}

async function waitForFrame (client: any, count: number, label: string) {
    let waited = 0;
    while ((client.sentFrames.length < count) && (waited < 2000)) {
        await sleep (5);
        waited = waited + 5;
    }
    assert (client.sentFrames.length >= count, label + ': expected ' + count.toString () + ' sent frames, got ' + JSON.stringify (client.sentFrames));
    return client.sentFrames[count - 1];
}

function aggTrade (tradeId: number, price: string) {
    return {
        'stream': 'btcusdt@aggTrade',
        'data': {
            'e': 'aggTrade',
            'E': 1754551358681 + tradeId,
            'a': tradeId,
            's': 'BTCUSDT',
            'p': price,
            'q': '0.020',
            'f': tradeId,
            'l': tradeId,
            'T': 1754551358528 + tradeId,
            'm': false,
        },
    };
}

async function testAsterUnWatchTradesCycle () {
    const exchange = makeOfflineAster ();
    const client: any = exchange.client (WS_URL);
    // 1 - subscribe and receive one trade
    const firstWatch = exchange.watchTrades (SYMBOL);
    const subscribe = await waitForFrame (client, 1, 'first watchTrades');
    assert (subscribe['method'] === 'SUBSCRIBE', 'first watchTrades must send SUBSCRIBE, got ' + JSON.stringify (subscribe));
    exchange.routeMessage (client, { 'result': null, 'id': subscribe['id'] });
    exchange.routeMessage (client, aggTrade (1, '100000.0'));
    const firstTrades = await firstWatch;
    assert (firstTrades.length === 1, 'first watchTrades must return the one injected trade, got ' + firstTrades.length.toString ());
    assert (SYMBOL in exchange.trades, 'the trades cache must hold the symbol after the first watchTrades');
    // 2 - unsubscribe, settle on the acknowledgement
    const unWatch = exchange.unWatchTrades (SYMBOL);
    const unsubscribe = await waitForFrame (client, 2, 'unWatchTrades');
    assert (unsubscribe['method'] === 'UNSUBSCRIBE', 'unWatchTrades must send UNSUBSCRIBE, got ' + JSON.stringify (unsubscribe));
    exchange.routeMessage (client, { 'result': null, 'id': unsubscribe['id'] });
    const unWatchResult = await unWatch;
    assert (unWatchResult === true, 'unWatchTrades must resolve with true on the acknowledgement');
    // 3 - the ack must leave nothing of the old stream behind
    const leftover = Object.keys (client.subscriptions);
    assert (leftover.length === 0, 'the unsubscribe ack must drop the trade subscription and the pending unsubscribe, left: ' + JSON.stringify (leftover));
    assert (!(SYMBOL in exchange.trades), 'the unsubscribe ack must clear the trades cache of the symbol');
    // 4 - a second watchTrades must subscribe again and see only fresh trades
    const secondWatch = exchange.watchTrades (SYMBOL);
    const resubscribe = await waitForFrame (client, 3, 'second watchTrades');
    assert (resubscribe['method'] === 'SUBSCRIBE', 'second watchTrades must send a fresh SUBSCRIBE, got ' + JSON.stringify (resubscribe));
    assert (resubscribe['id'] !== subscribe['id'], 'the fresh SUBSCRIBE must carry a new request id');
    exchange.routeMessage (client, aggTrade (2, '100001.0'));
    const secondTrades = await secondWatch;
    assert (secondTrades.length === 1, 'second watchTrades must return only the trade received after the resubscribe, got ' + secondTrades.length.toString ());
    assert (secondTrades[0]['id'] === '2', 'second watchTrades must return the fresh trade, got id ' + String (secondTrades[0]['id']));
    await exchange.close ();
}

export default testAsterUnWatchTradesCycle;
