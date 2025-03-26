
// NO-AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../../ccxt.js';
import testSharedMethods from '../../Exchange/base/test.sharedMethods.js';

async function testFetchRetry () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    exchange.options['maxRetriesOnFailure'] = 3;
    // exchange.options['maxRetriesOnFailureDelay'] = 1000; // todo later
    let counter = 0;
    const originalFetch = exchange.fetch;
    exchange.fetch = async (url) => {
        counter += 1;
        return await originalFetch.call (exchange, url);
    };
    exchange.sign = () => ({
        'url': 'https://example.com/api-endpoint',
        'method': 'GET',
        'params': {},
        'headers': {},
        'body': undefined,
    });
    exchange.timeout = 100;
    exchange.httpsProxy = 'http://127.0.0.1:1234';
    try {
        const result = await exchange.fetch2 ('none');
        console.log (result);
    } catch (error) {
        console.log (error);
    }
    // first call counts
    assert (counter === exchange.options['maxRetriesOnFailure'] + 1);
}

export default testFetchRetry;
