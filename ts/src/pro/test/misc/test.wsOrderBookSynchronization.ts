import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { ExchangeError, ArgumentsRequired } from '../../../base/errors.js';
import { Exchange, Tickers } from '../../../../ccxt.js';


async function testWsOrderBookSynchronization (exchange1: Exchange, exchange2: Exchange, symbol: string) {
    const now = exchange1.milliseconds ();
    const ends = now + 30000; // run at max 30 seconds
    const promise_1 = testWsObSyncingFirstLoop (exchange1, exchange2, symbol, ends);
    await exchange1.sleep (8000);
    const promise_2 = testWsObSyncingFirstLoop (exchange2, exchange1, symbol, ends);
    await Promise.all ([ promise_1, promise_2 ]); // keep c# runtime until both promises are resolved
}

async function testWsObSyncingFirstLoop (currentInstance: Exchange, otherInstance: Exchange, symbol: string, ends: number) {
    currentInstance.options['tempObNonces'] = {};
    let now = 0;
    while (now < ends) {
        if ('stopObSyncTests' in currentInstance.options) {
            break;
        }
        const ob = await currentInstance.watchOrderBook (symbol);
        const nonce = ob['nonce'];
        if (nonce === undefined) {
            const logText = testSharedMethods.logTemplate (currentInstance, 'watchOrderBook', ob);
            throw new ExchangeError ('nonce is undefined, tests can not proceed' + logText);
        }
        const nonceString = (ob['nonce']).toString ();
        currentInstance.options['tempObNonces'][nonce] = ob;
        if (!('tempObNonce' in otherInstance.options)) {
            // if seoncd loop hasn't yet started
            break;
        } else {
            // if second loop has started, but this nonce does not exist there, then continue
            if (!(nonceString in otherInstance.options['tempObNonces'])) {
                continue;
            }
            // if nonce exits, then compare the orderbooks
            const ob2 = otherInstance.options['tempObNonces'][nonceString];
            testSharedMethods.deepEqual (ob, ob2);
        }
        now = currentInstance.milliseconds ();
    }
}

export default testWsOrderBookSynchronization;
