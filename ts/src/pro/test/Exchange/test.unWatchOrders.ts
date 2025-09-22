import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from '../../../../ccxt.js';

async function createOrderAfterDelay (exchange: Exchange) {
    await exchange.sleep (3000);
    await exchange.createOrder ('BTC/USDT', 'market', 'buy', 0.001);
}

async function testUnwatchOrders (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'unWatchOrders';

    // First, we need to subscribe to orders to test the unsubscribe functionality
    let ordersSubscription = undefined;
    try {
        // First call uses snapshot
        await exchange.loadMarkets ();
        exchange.spawn (createOrderAfterDelay, exchange);
        ordersSubscription = await exchange.watchOrders (symbol);
        // trigger an order update
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
    await exchange.sleep (1000);
    try {
        responseSymbol = await exchange.unWatchOrders (symbol);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }

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
}

export default testUnwatchOrders;
