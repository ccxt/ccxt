import assert from 'assert';
import { Exchange } from '../../../base/Exchange';


// 'should correctly calculate cost based on urlCost for a given url'
const exchange = new Exchange ();
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
