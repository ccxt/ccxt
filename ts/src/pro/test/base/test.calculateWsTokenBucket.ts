import assert from 'assert';
import { Exchange } from '../../../base/Exchange';
import { test } from '../../../test/Exchange/base/test.sharedMethods';

let exchange;

function setupExchange () {
    exchange = new Exchange ();
    exchange.tokenBucket = { 'default': 'bucket' };
}


setupExchange ();

test ('should return default token bucket when rateLimits or rateLimit is undefined', () => {
    const wsOptions = {};
    const result = exchange.calculateWsTokenBucket (wsOptions, 'url');
    assert.equal (result, exchange.tokenBucket);
});

test ('should correctly calculate cost based on urlCost for a given url', () => {
    const wsOptions = {
        "rateLimits": {
            'url': {
                "rateLimit": 1,
                "connections": 2
            }
        }
    };
    const result = exchange.calculateWsTokenBucket (wsOptions, 'url');
    assert.equal (result.cost, 2);
});

test ('should correctly calculate refillRate and return correct configuration', () => {
    const wsOptions = {
        "rateLimits": {
            'url': {
                "rateLimit": 1,
                "connections": 2
            }
        }
    };
    const result = exchange.calculateWsTokenBucket (wsOptions, 'url');
    assert.equal (result.refillRate, 1);
    assert.equal (result.capacity, 1);
    assert.equal (result.delay, 0.001);
    assert.equal (result.maxCapacity, 1000);
});
