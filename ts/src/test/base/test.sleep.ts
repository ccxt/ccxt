
// AUTO_TRANSPILE_ENABLED

import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

async function testSleep () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const start = exchange.milliseconds ();
    const sleepAmount = 100; // milliseconds
    await exchange.sleep (sleepAmount);
    const end = exchange.milliseconds ();
    const elapsed = end - start;

    // Allow a small margin of error due to execution time
    const marginOfError = 20;
    const obj = { 'elapsed': elapsed };
    testSharedMethods.assertGreaterOrEqual (exchange, {}, 'testSleep', obj, 'elapsed', exchange.numberToString (sleepAmount));
    testSharedMethods.assertLessOrEqual (exchange, {}, 'testSleep', obj, 'elapsed', exchange.numberToString (sleepAmount + marginOfError));
}

export default testSleep;
