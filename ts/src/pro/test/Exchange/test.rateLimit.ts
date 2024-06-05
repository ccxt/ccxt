

import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testRateLimit (exchange, skippedProperties) {
    const symbols = exchange.symbols;
    // Test without rate limit
    exchange.enableRateLimit = false;
    try {
        for (let i = 0; i < symbols.length; i++) {
            exchange.watchOHLCV (symbols[i], '1m');
        }
    } catch (e) {
        assert.equal (e.constructor.name, 'RateLimitExceeded', "Expected RateLimitExceeded error");
    }

    // Test with rate limit
    exchange.enableRateLimit = true;
    const ends = exchange.milliseconds () + 10000; // Stop after 10 seconds
    while (exchange.milliseconds () < ends) {
        for (let i = 0; i < symbols.length; i++) {
            exchange.watchOHLCV (symbols[i], '1m');
        }
    }
}

export default testRateLimit;
