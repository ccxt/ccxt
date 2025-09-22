import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from '../../../../ccxt.js';

async function createOrderAfterDelay (exchange: Exchange) {
    await exchange.sleep (3000);
    await exchange.createOrder ('BTC/USDT', 'market', 'buy', 0.001);
}

async function testUnwatchMyTrades (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'unWatchMyTrades';

    // First, we need to subscribe to my trades to test the unsubscribe functionality
    let myTradesSubscription = undefined;
    try {
        // First call uses snapshot
        await exchange.loadMarkets ();
        exchange.spawn (createOrderAfterDelay, exchange);
        myTradesSubscription = await exchange.watchMyTrades (symbol);
        // trigger a trade update
        // Second call uses subscription
        myTradesSubscription = await exchange.watchMyTrades (symbol);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        // If we can't subscribe, we can't test unsubscribe, so skip this test
        return;
    }

    // Verify that we have a subscription
    assert (Array.isArray (myTradesSubscription), exchange.id + ' ' + method + ' requires a valid my trades subscription to test unsubscribe');

    // Test unwatching my trades for a specific symbol
    let responseSymbol = undefined;
    await exchange.sleep (1000);
    try {
        responseSymbol = await exchange.unWatchMyTrades (symbol);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }

    // Test unwatching all my trades (without specific symbol)
    let responseAll = undefined;
    try {
        responseAll = await exchange.unWatchMyTrades ();
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }
}

export default testUnwatchMyTrades;
