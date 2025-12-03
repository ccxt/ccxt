
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

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
    const maxElapsed = sleepAmount + marginOfError;
    assert (elapsed >= sleepAmount, 'Elapsed time ' + elapsed.toString () + 'ms is less than sleep amount ' + sleepAmount.toString () + 'ms');
    assert (elapsed <= maxElapsed, 'Elapsed time ' + elapsed.toString () + 'ms exceeds sleep amount ' + maxElapsed.toString () + 'ms');
}

export default testSleep;
