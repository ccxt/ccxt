import assert from 'assert';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from '../../../../ccxt.js';

async function createOrderAfterDelay (exchange: Exchange) {
    await exchange.sleep (3000);
    await exchange.createOrder ('BTC/USDT:USDT', 'market', 'buy', 0.001);
}

async function testUnwatchMyTrades (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'unWatchMyTrades';
    exchange.setSandboxMode (true);

    // First, we need to subscribe to my trades to test the unsubscribe functionality
    let myTradesSubscription = undefined;
    try {
        // First call uses snapshot
        myTradesSubscription = await exchange.watchMyTrades (symbol);
        // trigger a trade update
        exchange.spawn (createOrderAfterDelay, exchange);
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
    try {
        responseSymbol = await exchange.unWatchMyTradesForSymbols ([ symbol ]);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }

    // Verify the response for unwatching my trades for a specific symbol
    assert (responseSymbol !== undefined, exchange.id + ' ' + method + ' must return a response when unwatching my trades for a symbol, returned ' + exchange.json (responseSymbol));

    // Test unwatching all my trades (without specific symbol)
    let responseAll = undefined;
    try {
        responseAll = await exchange.unWatchTradesForSymbols ([ symbol ]);
    } catch (e) {
        if (!testSharedMethods.isTemporaryFailure (e)) {
            throw e;
        }
        throw e;
    }

    // Verify the response for unwatching all my trades
    assert (responseAll !== undefined, exchange.id + ' ' + method + ' must return a response when unwatching all my trades, returned ' + exchange.json (responseAll));

    // Test that we can resubscribe after unwatching (to ensure cleanup was proper)
    let resubscribeResponse = undefined;
    try {
        resubscribeResponse = await exchange.watchMyTrades (symbol);
        exchange.spawn (createOrderAfterDelay, exchange);
        resubscribeResponse = await exchange.watchMyTrades (symbol);
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

export default testUnwatchMyTrades;
