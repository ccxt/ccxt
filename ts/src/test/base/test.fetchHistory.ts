


import assert from 'assert';
import ccxt from '../../../ccxt.js';

async function testFetchHistory () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'fetchHistoryCacheSize': 2,
    });
    const trueClause = exchange.fetchHistoryCacheSize === 2;
    assert (trueClause);
    // try 3 times
    try {
        const promise1 = exchange.fetch2 ('sample1'); // todo: full urls needed
        await promise1;
    } catch (error) {
        const fetchHistoryCache = exchange.getFetchCache ();
        assert (fetchHistoryCache.length === 1, 'fetchHistoryCache should be an array with 1 element');
    }
    try {
        const promise2 = exchange.fetch2 ('sample2');
        await promise2;
    } catch (error) {
        const fetchHistoryCache = exchange.getFetchCache ();
        assert (fetchHistoryCache.length === 2, 'fetchHistoryCache should be an array with 2 elements');
    }
    try {
        const promise3 = exchange.fetch2 ('sample3');
        await promise3;
    } catch (error) {
        const fetchHistoryCache = exchange.getFetchCache ();
        assert (fetchHistoryCache.length === 2, 'fetchHistoryCache should be an array with 2 elements');
    }
}

export default testFetchHistory;
