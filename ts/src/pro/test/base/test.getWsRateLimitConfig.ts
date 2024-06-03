import assert from 'assert';
import { Exchange } from '../../../base/Exchange';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods';


let exchange;


testSharedMethods.test ('should return default token bucket when rateLimits or rateLimit is undefined', () => {
    exchange = new Exchange ();
    const result = exchange.getWsRateLimitConfig ('url');
    assert.equal (result.cost, 1);
    assert.equal (result.refillRate, Number.MAX_SAFE_INTEGER);
});

testSharedMethods.test ('should correctly calculate cost based on urlCost for a given url', () => {
    exchange = new Exchange ();
    const wsOptions = {
        "rateLimits": {
            'default': {
                'rateLimit': 1,
                'someHash': 2,
            },
            'url': {
                'rateLimit': 10,
            }
        }
    };
    exchange['options']['ws'] = wsOptions;
    const result = exchange.getWsRateLimitConfig ('url', 'someHash');
    assert.equal (result.cost, 2);
    assert.equal (result.refillRate, 0.1);
});

testSharedMethods.test ('should correctly calculate refillRate and return correct configuration', () => {
    exchange = new Exchange ();
    const wsOptions = {
        "rateLimits": {
            'url': {
                "rateLimit": 10,
                "someHash": 3,
            }
        }
    };
    exchange['options']['ws'] = wsOptions;
    const result = exchange.getWsRateLimitConfig ('url', 'someHash');
    assert.equal (result.refillRate, 0.1);
    assert.equal (result.cost, 3);
});
