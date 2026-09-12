import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the price-aggregation
// suffix ccxt.pro.deepcoin puts in the 25-level book FilterValue. the venue
// publishes one book per aggregation level and only serves the levels a market
// has (its tick size and a few coarser steps): a fixed '_0.1' was rejected
// with 'orderbook does not exist: XRP/USDT_0.1, no available orderbook data'
// on every market whose tick is finer than a step or two below 0.1 (live probe:
// 97 of the first 120 spot markets, 68 of 120 swaps). nothing here dials a
// socket: markets are set from a fixture and the request is built through
// createPublicRequest / orderBookSuffix directly

function fixtureMarket (exchange: any, symbol: string, id: string, type: string, tickSize: string, baseId: string, quoteId: string) {
    return exchange.safeMarketStructure ({
        'id': id,
        'symbol': symbol,
        'base': baseId,
        'quote': quoteId,
        'baseId': baseId,
        'quoteId': quoteId,
        'type': type,
        'spot': type === 'spot',
        'swap': type === 'swap',
        'settle': (type === 'swap') ? quoteId : undefined,
        'settleId': (type === 'swap') ? quoteId : undefined,
        'contract': type === 'swap',
        'linear': (type === 'swap') ? true : undefined,
        'active': true,
        'precision': {
            'price': exchange.parseNumber (tickSize),
            'amount': exchange.parseNumber ('1'),
        },
    });
}

function filterValue (exchange: any, market: any, methodName: string, params: any = {}) {
    let suffix = undefined;
    [ suffix, params ] = exchange.orderBookSuffix (market, methodName, params);
    const request = exchange.createPublicRequest (market, 1, '25', suffix);
    return [ request['sendTopicAction']['FilterValue'], params ];
}

async function testDeepcoinOrderBookSuffixFollowsTheTickSize () {
    const exchange = new ccxt.pro.deepcoin ({});
    exchange.setMarkets ([
        fixtureMarket (exchange, 'XRP/USDT', 'XRP-USDT', 'spot', '0.0001', 'XRP', 'USDT'),
        fixtureMarket (exchange, 'BTC/USDT', 'BTC-USDT', 'spot', '0.1', 'BTC', 'USDT'),
        fixtureMarket (exchange, 'DOGE/USDT', 'DOGE-USDT', 'spot', '0.00001', 'DOGE', 'USDT'),
        fixtureMarket (exchange, 'XRP/USDT:USDT', 'XRP-USDT-SWAP', 'swap', '0.0001', 'XRP', 'USDT'),
    ]);
    // the tick size is the default level, formatted as the venue spells it
    let [ value, params ] = filterValue (exchange, exchange.market ('XRP/USDT'), 'watchOrderBook');
    assert (value === 'DeepCoin_XRP/USDT_0.0001', 'spot XRP/USDT with tick 0.0001 must subscribe to _0.0001, got ' + value);
    assert (Object.keys (params).length === 0, 'no params must leak into the request');
    [ value, params ] = filterValue (exchange, exchange.market ('BTC/USDT'), 'watchOrderBook');
    assert (value === 'DeepCoin_BTC/USDT_0.1', 'spot BTC/USDT with tick 0.1 must keep _0.1, got ' + value);
    // a sub-1e-6 tick must not be rendered in scientific notation
    [ value, params ] = filterValue (exchange, exchange.market ('DOGE/USDT'), 'watchOrderBook');
    assert (value === 'DeepCoin_DOGE/USDT_0.00001', 'spot DOGE/USDT with tick 0.00001 must subscribe to _0.00001, got ' + value);
    // swaps use the slash-less instrument id with the same suffix rule
    [ value, params ] = filterValue (exchange, exchange.market ('XRP/USDT:USDT'), 'watchOrderBook');
    assert (value === 'DeepCoin_XRPUSDT_0.0001', 'swap XRP/USDT:USDT with tick 0.0001 must subscribe to _0.0001, got ' + value);
    // params.aggregation overrides the tick and is consumed
    [ value, params ] = filterValue (exchange, exchange.market ('XRP/USDT'), 'watchOrderBook', { 'aggregation': '0.01' });
    assert (value === 'DeepCoin_XRP/USDT_0.01', 'params.aggregation must select the level, got ' + value);
    assert (!('aggregation' in params), 'params.aggregation must be consumed and not forwarded to the venue');
    // options.watchOrderBook.aggregation is honoured the same way
    exchange.options['watchOrderBook'] = { 'aggregation': '0.001' };
    [ value, params ] = filterValue (exchange, exchange.market ('XRP/USDT'), 'watchOrderBook');
    assert (value === 'DeepCoin_XRP/USDT_0.001', 'options.watchOrderBook.aggregation must select the level, got ' + value);
    // unWatch must compute the same FilterValue as watch, otherwise the
    // unsubscribe never matches the live subscription
    [ value, params ] = filterValue (exchange, exchange.market ('XRP/USDT'), 'unWatchOrderBook');
    assert (value === 'DeepCoin_XRP/USDT_0.0001', 'unWatchOrderBook must default to the tick size like watchOrderBook, got ' + value);
    assert (Object.keys (exchange.clients).length === 0, 'the test must never dial a socket');
    await exchange.close ();
}

async function testDeepcoinOrderBookSuffixWiring () {
    await testDeepcoinOrderBookSuffixFollowsTheTickSize ();
}

export default testDeepcoinOrderBookSuffixWiring;
