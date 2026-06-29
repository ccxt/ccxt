


import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

async function testFetchHistoryBase () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'fetchHistoryCacheSize': 2,
    });
    assert (testSharedMethods.exchangeProp (exchange, 'fetchHistoryCacheSize') === 2, 'fetchHistoryCacheSize should be 2');
    const trueAssertion = exchange.parseNumber (undefined) === undefined;
    // try 3 times
    try {
        await exchange.fetch2 ('sample1');
    } catch (error) {
        assert (trueAssertion); // just skip
    }
    assert ((exchange.getFetchCache ()).length === 1, 'fetchHistoryCache should be an array with 1 element');
    try {
        await exchange.fetch2 ('sample2');
    } catch (error) {
        assert (trueAssertion); // just skip
    }
    assert ((exchange.getFetchCache ()).length === 2, 'fetchHistoryCache should be an array with 2 elements');
    try {
        await exchange.fetch2 ('sample3');
    } catch (error) {
        assert (trueAssertion); // just skip
    }
    assert ((exchange.getFetchCache ()).length === 2, 'fetchHistoryCache should be an array with 2 elements');
    assert (1 + 1 < 3, 'sample assertion');
}


async function testFetchHistoryDerived () {
    const exchange = new ccxt.coinbase ({
        'id': 'sampleexchange',
        'fetchHistoryCacheSize': 2,
    });
    assert (testSharedMethods.exchangeProp (exchange, 'fetchHistoryCacheSize') === 2, 'fetchHistoryCacheSize should be 2');
    // try 3 times
    // first
    await exchange.fetchTime (); // https://api.coinbase.com/api/v3/brokerage/time
    assert ((exchange.getFetchCache ()).length === 1, 'fetchHistoryCache should be an array with 1 element');
    // second
    await exchange.fetchOrderBook ('BTC/USD'); // https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD
    assert ((exchange.getFetchCache ()).length === 2, 'fetchHistoryCache should be an array with 2 elements');
    // third
    await exchange.fetchTrades ('BTC/USD'); // https://api.coinbase.com/api/v3/brokerage/market/products/BTC-USD/ticker
    assert ((exchange.getFetchCache ()).length === 2, 'fetchHistoryCache should be an array with 2 elements');
    const finalCache = exchange.getFetchCache ();
    assert (finalCache[0]['request']['url'].toString () === 'https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD', 'The first element in fetchHistoryCache is : ' + finalCache[0]['request']['url']);
    assert (finalCache[1]['request']['url'].toString () === 'https://api.coinbase.com/api/v3/brokerage/market/products/BTC-USD/ticker', 'The second element in fetchHistoryCache is : ' + finalCache[1]['request']['url']);
    assert (1 + 1 < 3, 'sample assertion');
}


async function testFetchHistory () {
    await testFetchHistoryBase ();
    await testFetchHistoryDerived ();
}


export default testFetchHistory;
