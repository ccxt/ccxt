import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from '../../../../ccxt.js';

async function createOrderAfterDelay (exchange: Exchange) {
    await exchange.sleep (3000);
    await exchange.createOrder ('BTC/USDT:USDT', 'market', 'buy', 0.001);
}

async function testUnwatchBalance (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'unWatchBalance';
    exchange.setSandboxMode (true);

    // First, we need to subscribe to balance to test the unsubscribe functionality
    let balanceSubscription = undefined;
    try {
        // First call uses snapshot
        balanceSubscription = await exchange.watchBalance ();
        // trigger a balance update
        exchange.spawn (createOrderAfterDelay, exchange);
        // Second call uses subscription
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
    try {
        response = await exchange.unWatchBalance ();
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }

    // Verify the response for unwatching balance
    assert (response !== undefined, exchange.id + ' ' + method + ' must return a response when unwatching balance, returned ' + exchange.json (response));

    // Test that we can resubscribe after unwatching (to ensure cleanup was proper)
    let resubscribeResponse = undefined;
    try {
        resubscribeResponse = await exchange.watchBalance ();
        exchange.spawn (createOrderAfterDelay, exchange);
        resubscribeResponse = await exchange.watchBalance ();
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        // If resubscription fails, it might indicate the unwatch didn't work properly
        throw new Error (exchange.id + ' ' + method + ' failed to resubscribe after unwatch, indicating potential cleanup issues');
    }

    // Verify resubscription works
    assert (resubscribeResponse !== undefined, exchange.id + ' ' + method + ' must allow resubscription after unwatch, returned ' + exchange.json (resubscribeResponse));
}

export default testUnwatchBalance;
