// @ts-nocheck

import assert, { strictEqual } from 'assert';
import ccxt from '../../../../ccxt.js';

const equal = strictEqual;

export default async function testSetRateLimit () {
    const exchange1 = new ccxt.Exchange ({ 'id': 'test', 'rateLimit': 100 });
    equal (exchange1.rateLimit, 100);

    exchange1.setRateLimit (50);

    equal (exchange1.rateLimit, 50);
    equal (exchange1.throttler.config['rateLimit'], 50);
    equal (exchange1.throttler.config['refillRate'], 1 / 50);

    const exchange2 = new ccxt.Exchange ({ 'id': 'test', 'rateLimit': 1000 });
    const originalThrottler = exchange2.throttler;

    exchange2.setRateLimit (100);

    equal (exchange2.throttler, originalThrottler);

    const exchange3 = new ccxt.Exchange ({ 'id': 'test', 'rateLimit': 1 });
    exchange3.setRateLimit (40);

    const start = exchange3.milliseconds ();
    for (let i = 0; i < 5; i++) {
        await exchange3.throttle (1);
    }
    const elapsed = exchange3.milliseconds () - start;

    assert (elapsed >= 100, 'expected throttling delay, got only ' + elapsed.toString () + 'ms');
    assert (elapsed < 800, 'throttling took too long: ' + elapsed.toString () + 'ms');
}
