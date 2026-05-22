



import assert from 'assert';
import ccxt from '../../../ccxt.js';

async function testSetRateLimit () {

    const exchange = new ccxt.Exchange ({
        'id': 'test',
        'rateLimit': 100,
    });
    assert (exchange.rateLimit === 100, 'initial rateLimit should be 100');

    exchange.setRateLimit (50);

    assert (exchange.rateLimit === 50, 'rateLimit should be updated to 50');

    const exchange2 = new ccxt.Exchange ({
        'id': 'test',
        'rateLimit': 1,
    });
    exchange2.setRateLimit (40);

    const start = exchange2.milliseconds ();
    const numRequests = 5;
    for (let i = 0; i < numRequests; i++) {
        await exchange2.throttle (1);
    }
    const elapsed = exchange2.milliseconds () - start;

    assert (elapsed >= 100, 'expected throttling delay, got only ' + elapsed.toString () + 'ms');
    assert (elapsed < 800, 'throttling took too long: ' + elapsed.toString () + 'ms');
}

export default testSetRateLimit;
