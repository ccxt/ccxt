import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from '../../../../ccxt.js';
import createOrderAfterDelay from './utils.js';



async function testUnwatchBalance (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'unWatchBalance';

    // First, we need to subscribe to balance to test the unsubscribe functionality
    let balanceSubscription = undefined;
    try {
        // First call uses snapshot
        await exchange.loadMarkets ();
        exchange.spawn (createOrderAfterDelay, exchange);
        balanceSubscription = await exchange.watchBalance ();
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        // If we can't subscribe, we can't test unsubscribe, so skip this test
        return;
    }

    // Verify that we have a subscription
    assert (balanceSubscription !== undefined, exchange.id + ' ' + method + ' requires a valid balance subscription to test unsubscribe');

    // Test unwatching balance
    let response = undefined;
    await exchange.sleep (1000);
    try {
        response = await exchange.unWatchBalance ();
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }
}

export default testUnwatchBalance;
