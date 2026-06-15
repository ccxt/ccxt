


import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

async function testFetchHistory () {

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

export default testFetchHistory;
