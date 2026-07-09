// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// tests that fetch2 throttles before the request for GET requests,
// after the request for all other http methods, and never on the error path

function createExchange (calls, fetchImplementation) {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'enableRateLimit': true,
    });
    exchange.throttle = async (cost = undefined) => {
        calls.push ('throttle');
    };
    exchange.fetch = async (url, method = 'GET', headers = undefined, body = undefined) => {
        calls.push ('fetch');
        return fetchImplementation ();
    };
    return exchange;
}

async function testFetchThrottleOrder () {
    // GET requests should throttle before the request
    let calls = [];
    let exchange = createExchange (calls, () => ({}));
    await exchange.fetch2 ('path', 'public', 'GET');
    assert.deepEqual (calls, [ 'throttle', 'fetch' ], 'GET request should throttle before the request, got: ' + calls.join (','));
    // non-GET requests should throttle after the request
    for (const method of [ 'POST', 'PUT', 'PATCH', 'DELETE' ]) {
        calls = [];
        exchange = createExchange (calls, () => ({}));
        await exchange.fetch2 ('path', 'public', method);
        assert.deepEqual (calls, [ 'fetch', 'throttle' ], method + ' request should throttle after the request, got: ' + calls.join (','));
    }
    // failed non-GET requests should not throttle at all
    calls = [];
    exchange = createExchange (calls, () => {
        throw new ccxt.ExchangeError ('simulated failure');
    });
    try {
        await exchange.fetch2 ('path', 'public', 'POST');
        assert (false, 'POST request should have thrown');
    } catch (e) {
        assert (e instanceof ccxt.ExchangeError, 'unexpected error type: ' + e.toString ());
    }
    assert.deepEqual (calls, [ 'fetch' ], 'failed POST request should not throttle, got: ' + calls.join (','));
    // failed GET requests still throttle before the request only
    calls = [];
    exchange = createExchange (calls, () => {
        throw new ccxt.ExchangeError ('simulated failure');
    });
    try {
        await exchange.fetch2 ('path', 'public', 'GET');
        assert (false, 'GET request should have thrown');
    } catch (e) {
        assert (e instanceof ccxt.ExchangeError, 'unexpected error type: ' + e.toString ());
    }
    assert.deepEqual (calls, [ 'throttle', 'fetch' ], 'failed GET request should only throttle before the request, got: ' + calls.join (','));
    // disabled rate limit should never throttle
    calls = [];
    exchange = createExchange (calls, () => ({}));
    exchange.enableRateLimit = false;
    await exchange.fetch2 ('path', 'public', 'POST');
    assert.deepEqual (calls, [ 'fetch' ], 'disabled rate limit should not throttle, got: ' + calls.join (','));
}

export default testFetchThrottleOrder;
