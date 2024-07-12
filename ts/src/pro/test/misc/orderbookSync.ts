import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
// import errors, { ArgumentsRequired } from '../../../base/errors.js';
import { Exchange, Tickers } from '../../../../ccxt.js';


async function testWsObSyncing (exchange1: Exchange, exchange2: Exchange, symbol: string) {
    const now = exchange1.milliseconds ();
    const ends = now + 30000; // run at max 30 seconds
    const promise_1 = testWsObSyncingFirstLoop (exchange1, exchange2, symbol, ends);
    await exchange1.sleep (8000);
    const promise_2 = testWsObSyncingFirstLoop (exchange2, exchange1, symbol, ends);
    while (true) {
        const p1 = exchange1.watchOrderBook (symbol);
        const p2 = exchange2.watchOrderBook (symbol);
        const results = await Promise.all ([ p1, p2 ]);
        const [ ob1, ob2 ] = results;
        const nonce1 = ob1['nonce'];
        const nonce2 = ob2['nonce'];

    }
}

async function testWsObSyncingFirstLoop (currentInstance: Exchange, otherInstance: Exchange, symbol: string, ends: number) {
    currentInstance.options['tempObNonces'] = {};
    let now = 0;
    while (now < ends) {
        if ('stopObSyncTests' in currentInstance.options) {
            break;
        }
        const ob = await currentInstance.watchOrderBook (symbol);
        const nonce = (ob['nonce']).toString ();
        currentInstance.options['tempObNonces'][nonce] = ob;
        if (!('tempObNonce' in otherInstance.options)) {
            // if seoncd loop hasn't yet started
            break;
        }
        now = currentInstance.milliseconds ();
    }
}
