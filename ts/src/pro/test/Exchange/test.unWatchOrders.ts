import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from '../../../../ccxt.js';

async function createOrderAfterDelay (exchange: Exchange) {
    await exchange.sleep (3000);
    await exchange.createOrder ('BTC/USDT:USDT', 'market', 'buy', 0.001);
}

async function testUnwatchOrders (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'unWatchOrders';
    exchange.setSandboxMode (true);

    // First, we need to subscribe to orders to test the unsubscribe functionality
    let ordersSubscription = undefined;
    try {
        // First call uses snapshot
        ordersSubscription = await exchange.watchOrders (symbol);
        // trigger an order update
        exchange.spawn (createOrderAfterDelay, exchange);
        // Second call uses subscription
        ordersSubscription = await exchange.watchOrders (symbol);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        // If we can't subscribe, we can't test unsubscribe, so skip this test
        return;
    }

    // Verify that we have a subscription
    assert (Array.isArray (ordersSubscription), exchange.id + ' ' + method + ' requires a valid orders subscription to test unsubscribe');

    // Test unwatching orders for a specific symbol
    let responseSymbol = undefined;
    try {
        responseSymbol = await exchange.unWatchOrders (symbol);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }

    // Verify the response for unwatching orders for a specific symbol
    assert (responseSymbol !== undefined, exchange.id + ' ' + method + ' must return a response when unwatching orders for a symbol, returned ' + exchange.json (responseSymbol));

    // Test unwatching all orders (without specific symbol)
    let responseAll = undefined;
    try {
        responseAll = await exchange.unWatchOrders ();
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }

    // Verify the response for unwatching all orders
    assert (responseAll !== undefined, exchange.id + ' ' + method + ' must return a response when unwatching all orders, returned ' + exchange.json (responseAll));

    // Test that we can resubscribe after unwatching (to ensure cleanup was proper)
    let resubscribeResponse = undefined;
    try {
        resubscribeResponse = await exchange.watchOrders (symbol);
        exchange.spawn (createOrderAfterDelay, exchange);
        resubscribeResponse = await exchange.watchOrders (symbol);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        // If resubscription fails, it might indicate the unwatch didn't work properly
        throw new Error (exchange.id + ' ' + method + ' failed to resubscribe after unwatch, indicating potential cleanup issues');
    }

    // Verify resubscription works
    assert (Array.isArray (resubscribeResponse), exchange.id + ' ' + method + ' must allow resubscription after unwatch, returned ' + exchange.json (resubscribeResponse));
}

export default testUnwatchOrders;
