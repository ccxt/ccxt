import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { ExchangeError, NotSupported } from '../../../base/errors.js';
import ccxt, { Exchange } from '../../../../ccxt.js';


async function testWsOrderBookSynchronization (exchange: Exchange, skippedProperties: any, symbol: string) {
    const id = exchange.id;
    const exchange1 = new ccxt.pro[id] ();
    exchange1.options['tempExchangeNum'] = 1;
    const exchange2 = new ccxt.pro[id] ();
    exchange2.options['tempExchangeNum'] = 2;
    const now = exchange1.milliseconds ();
    const ends = now + 50000; // max run milliseconds
    // approach 1
    const promise_1 = testWsObSyncingFirstLoop (exchange1, exchange2, skippedProperties, symbol, ends);
    await exchange1.sleep (8000); // wait several seconds before starting other instance
    const promise_2 = testWsObSyncingFirstLoop (exchange2, exchange1, skippedProperties, symbol, ends);
    await Promise.all ([ promise_1, promise_2 ]); // keep c# runtime until both promises are resolved
}

async function testWsObSyncingFirstLoop (instance1: Exchange, instance2: Exchange, skippedProperties: any, symbol: string, ends: number) {
    instance1.options['tempObNonces'] = {};
    let now = 0;
    while (now < ends) {
        const ob1 = await instance1.watchOrderBook (symbol);
        const nonce = ob1['nonce'];
        if (nonce === undefined) {
            const logText = testSharedMethods.logTemplate (instance1, 'watchOrderBook', ob1);
            throw new NotSupported ('nonce is undefined, test can not proceed' + logText);
        }
        const nonceString = nonce.toString ();
        instance1.options['tempObNonces'][nonceString] = ob1;
        // if nonce exists in second instance, then compare the orderbooks
        if ('tempObNonces' in instance2.options) {
            // check if this nonce is also present in 2nd instance, and if so, compare orderbooks
            if (nonceString in instance2.options['tempObNonces']) {
                const ob2 = instance2.options['tempObNonces'][nonceString];
                testSharedMethods.assertDeepEqual (instance2, skippedProperties, 'testWsOrderBookSynchronization', ob1, ob2);
            }
            //
            // now, extra safety check for exchange's behavior, if it correctly updates both instances:
            // get highest nonce from another instance (e.g. 456),
            // and if it is higher than current instance's nonce (e.g. 451)
            // then it means, in another instance there should also be current instance's nonce
            // (so, not only 456, but there should be 451 too, otherwise it means that incoming updates had  been missed in another instance)
            //
            const highestNonceInOtherInstance = getHighestNonce (instance2);
            if (highestNonceInOtherInstance !== undefined && nonce < highestNonceInOtherInstance) {
                if (nonceString in instance2.options['tempObNonces']) {
                    const logText = testSharedMethods.logTemplate (instance1, 'watchOrderBook', ob1);
                    throw new ExchangeError ('current nonce ' + nonceString + 'is not present in 2nd instance' + logText);
                }
            }
        }
        now = instance1.milliseconds ();
    }
}

function getHighestNonce (exchange: Exchange) {
    const keys = Object.keys (exchange.options['tempObNonces']);
    let highestNonce = undefined;
    for (let i = 0; i < keys.length; i++) {
        const nonce = parseInt (keys[i]);
        if (highestNonce === undefined || nonce > highestNonce) {
            highestNonce = nonce;
        }
    }
    return highestNonce;
}

export default testWsOrderBookSynchronization;
