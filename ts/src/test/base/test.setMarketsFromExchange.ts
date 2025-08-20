
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from "../../../ccxt.js";
import { sleep } from '../../base/functions.js';

async function testSetMarketsFromExchange (exchange: Exchange) {
    const method = 'marketSharing';

    console.log (exchange.id, 'test', method);

    // Test 1: Basic market sharing
    let exchange1 = new ccxt.binance ({});
    const exchange2 = new ccxt.binance ({});

    // Load markets in first exchange
    const markets1 = await exchange1.loadMarkets ();
    assert (Object.keys (markets1).length > 0, 'Markets should be loaded in exchange1');

    // Test error case: exchanges are different
    const differentExchange = new ccxt.coinbase ({});
    try {
        differentExchange.setMarketsFromExchange (differentExchange);
        assert (false, "Should have thrown an error when using different exchange");
    } catch (error) {
        assert (error.message.includes ('exchanges of the same type'), 'Should have thrown an error');
    }


    // Test error case: sharing from exchange without markets
    const emptyExchange = new ccxt.binance ({});
    try {
        exchange2.setMarketsFromExchange (emptyExchange); // exchange2 has no markets yet
        assert (false, 'Should have thrown error when sharing from exchange without markets');
    } catch (error) {
        assert (error.message.includes ('must have loaded markets first'), 'Should throw appropriate error message');
    }

    // Test the new setMarketsFromExchange method
    exchange2.setMarketsFromExchange (exchange1);

    // Verify shared markets work
    assert (testSharedMethods.deepEqual (exchange1.symbols, exchange2.symbols), 'Symbols should be available after market sharing');
    assert (testSharedMethods.deepEqual (exchange1.currencies, exchange2.currencies), 'currencies dont match');
    assert (testSharedMethods.deepEqual (exchange1.codes, exchange2.codes), 'codes dont match');
    // TODO: add rest of assertions

    // Test 2: loadMarkets on shared markets should not make API call and be very fast
    const startTime = Date.now ();
    const sharedMarkets = await exchange2.loadMarkets ();
    const endTime = Date.now ();

    // Should be very fast since no API call is made
    const timeTaken = endTime - startTime;
    assert (timeTaken < 100, `loadMarkets on shared markets should be fast, took ${timeTaken}ms`);

    // Test 4: Memory persistence after sourceExchange is deleted
    exchange1 = undefined;
    global.gc ();
    await sleep (1000);
    assert (exchange2.markets_by_id)

    // Test 7: Performance test - ensure multiple instances don't increase memory significantly
    const initialMemory = process.memoryUsage ? process.memoryUsage ().heapUsed : 0;

    // Create multiple instances sharing the same markets
    const instances = [];
    for (let i = 0; i < 100; i++) {
        const instance = new ccxt.binance ({});
        instance.setMarketsFromExchange (exchange2);
        instances.push (instance);
    }

    const finalMemory = process.memoryUsage ? process.memoryUsage ().heapUsed : 0;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal since markets are shared
    if (process.memoryUsage) {
        const maxExpectedIncrease = 5 * 1024 * 1024; // 5MB max reasonable increase for 100 instances
        assert (memoryIncrease < maxExpectedIncrease, `Memory increase ${memoryIncrease} bytes should be minimal with shared markets`);
    }

    console.log (exchange.id, 'test', method, 'passed');
}

export default testSetMarketsFromExchange;
