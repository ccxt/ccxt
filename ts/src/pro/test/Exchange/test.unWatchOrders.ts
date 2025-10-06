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
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        // If we can't subscribe, we can't test unsubscribe, so skip this test
        return;
    }
}

export default testUnwatchOrders;
