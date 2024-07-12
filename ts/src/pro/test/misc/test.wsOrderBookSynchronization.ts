import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { NotSupported } from '../../../base/errors.js';
import ccxt, { Exchange } from '../../../../ccxt.js';


async function testWsOrderBookSynchronization (exchange: Exchange, skippedProperties: any, symbol: string) {
    const id = exchange.id;
    const exchange1 = exchange;
    const exchange2 = new ccxt.pro[id] ();
    const now = exchange1.milliseconds ();
    const ends = now + 30000; // run at max 30 seconds
    const promise_1 = testWsObSyncingFirstLoop (exchange1, exchange2, symbol, ends);
    await exchange1.sleep (8000); // wait several seconds before starting other instance
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
        const ob1 = await currentInstance.watchOrderBook (symbol);
        const nonce = ob1['nonce'];
        if (nonce === undefined) {
            const logText = testSharedMethods.logTemplate (currentInstance, 'watchOrderBook', ob1);
            throw new NotSupported ('nonce is undefined, test can not proceed' + logText);
        }
        const nonceString = nonce.toString ();
        currentInstance.options['tempObNonces'][nonceString] = ob1;
        // if nonce exists in second instance, then compare the orderbooks
        if (('tempObNonces' in otherInstance.options) && (nonceString in otherInstance.options['tempObNonces'])) {
            const ob2 = otherInstance.options['tempObNonces'][nonceString];
            testSharedMethods.deepEqual (ob1, ob2);
        }
        now = currentInstance.milliseconds ();
    }
}

export default testWsOrderBookSynchronization;
