// @ts-nocheck

import assert from 'assert';
import { Exchange } from '../../../../ccxt.js';

async function testDelay () {
    const exchange = new Exchange ({ 'id': 'mock' });
    const activeTimeouts = () => process.getActiveResourcesInfo ().filter ((resource) => resource === 'Timeout').length;
    const before = activeTimeouts ();
    const ran = new Promise ((resolve) => {
        exchange.delay (50, async () => {
            resolve (true);
        });
    });
    assert (activeTimeouts () === before, 'a pending delay () should not keep the process alive');
    // this timer keeps the process alive, as an open connection would
    let timer = undefined;
    const timedOut = new Promise ((resolve) => {
        timer = setTimeout (() => resolve (false), 1000);
    });
    const result = await Promise.race ([ ran, timedOut ]);
    clearTimeout (timer);
    assert (result, 'delay () should still run its method while the process is alive');
    await exchange.close ();
}

export default testDelay;
