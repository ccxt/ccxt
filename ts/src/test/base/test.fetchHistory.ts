


import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

async function testFetchHistoryBase () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'fetchHistoryCacheSize': 2,
    });
    const trueClause = testSharedMethods.exchangeProp (exchange, 'fetchHistoryCacheSize') === 2;
    assert (trueClause);
    // try 3 times
    try {
        await exchange.fetch2 ('sample1');
    } catch (error) {
        const fetchHistoryCache = exchange.getFetchCache ();
        assert (fetchHistoryCache.length === 1, 'fetchHistoryCache should be an array with 1 element');
    }
    try {
        await exchange.fetch2 ('sample2');
    } catch (error) {
        const fetchHistoryCache = exchange.getFetchCache ();
        assert (fetchHistoryCache.length === 2, 'fetchHistoryCache should be an array with 2 elements');
    }
    try {
        await exchange.fetch2 ('sample3');
    } catch (error) {
        const fetchHistoryCache = exchange.getFetchCache ();
        assert (fetchHistoryCache.length === 2, 'fetchHistoryCache should be an array with 2 elements');
    }
}


async function testFetchHistoryDerived () {
    const exchange = new ccxt.binance ({
        'id': 'sampleexchange',
        'fetchHistoryCacheSize': 2,
    });
    const trueClause = testSharedMethods.exchangeProp (exchange, 'fetchHistoryCacheSize') === 2;
    assert (trueClause);
    // try 3 times
    // first
    await exchange.fetchTime (); // https://api.binance.com/api/v3/time
    assert ((exchange.getFetchCache ()).length === 1, 'fetchHistoryCache should be an array with 1 element');
    // second
    await exchange.fetchOHLCV ('BTC/USDT', '1d', 1780000000000, 5); // https://api.binance.com/api/v3/klines?interval=1m&limit=5&symbol=BTCUSDT
    assert ((exchange.getFetchCache ()).length === 2, 'fetchHistoryCache should be an array with 2 elements');
    // third
    await exchange.fetchStatus (); // https://api.binance.com/sapi/v1/system/status
    assert ((exchange.getFetchCache ()).length === 2, 'fetchHistoryCache should be an array with 2 elements');
    const finalCache = exchange.getFetchCache ();
    assert (finalCache[0]['request']['url'].toString () === 'https://api.binance.com/api/v3/klines?interval=1d&limit=5&symbol=BTCUSDT&startTime=1780000000000', 'The first element in fetchHistoryCache should be fetchOHLCV: ' + finalCache[0]['request']['url']);
    assert (finalCache[1]['request']['url'].toString () === 'https://api.binance.com/sapi/v1/system/status', 'The second element in fetchHistoryCache should be fetchStatus: ' + finalCache[1]['request']['url']);
}


async function testFetchHistory () {
    await testFetchHistoryBase ();
    await testFetchHistoryDerived ();
}


export default testFetchHistory;
