


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

    // Allow a small margin of error due to execution time and timer jitter
    // (some runtimes, e.g. .NET Task.Delay, may return a few ms early)
    const marginOfError = 20;
    const minElapsed = sleepAmount - marginOfError;
    // The ceiling is deliberately far looser than the floor. sleep () promises
    // a MINIMUM delay in every language, never a maximum: the OS is free to
    // reschedule late, so a busy machine or a parallel CI runner overshoots by
    // tens of ms with nothing wrong. The old symmetric +20ms left ~18ms of
    // headroom on a 102ms measured sleep and failed whenever the box was under
    // load. Keep a ceiling only to catch a sleep that is genuinely broken — a
    // seconds/milliseconds mix-up, or one that never returns.
    const maxOvershoot = 2000;
    const maxElapsed = sleepAmount + maxOvershoot;
    const elapsedBiggerThanSleep = elapsed >= minElapsed;
    const elapsedLessThanMax = elapsed <= maxElapsed;
    assert (elapsedBiggerThanSleep, 'Elapsed time ' + elapsed.toString () + 'ms is less than minimum ' + minElapsed.toString () + 'ms (sleep amount ' + sleepAmount.toString () + 'ms)');
    assert (elapsedLessThanMax, 'Elapsed time ' + elapsed.toString () + 'ms exceeds sleep amount ' + maxElapsed.toString () + 'ms');
    return true;
}

export default testSleep;
