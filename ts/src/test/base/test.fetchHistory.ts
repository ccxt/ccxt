


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
    // try 3 times: the cache keeps only the 2 most recent calls
    const samples = [ 'sample1', 'sample2', 'sample3' ];
    const expectedLengths = [ 1, 2, 2 ];
    for (let i = 0; i < samples.length; i++) {
        try {
            await exchange.fetch2 (samples[i]);
        } catch (error) {
            assert (trueAssertion); // just skip
        }
        assert ((exchange.getFetchCache ()).length === expectedLengths[i], 'fetchHistoryCache should be an array with ' + expectedLengths[i].toString () + ' elements');
    }
    assert (1 + 1 < 3, 'sample assertion');
}


async function testFetchHistory () {
    await testFetchHistoryBase ();
}


export default testFetchHistory;
