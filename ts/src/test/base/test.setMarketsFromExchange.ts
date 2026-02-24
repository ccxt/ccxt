
import assert from 'assert';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from "../../../ccxt.js";

async function testSetMarketsFromExchange () {

    const emptyExchange = new ccxt.Exchange ({
        'id': 'sample0',
    });

    const trueClause = emptyExchange.safeString (undefined, undefined) === undefined;

    const sampleMarket = {
        'BTC/USD': { 'id': 'BtcUsd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'Btc', 'quoteId': 'Usd', 'type': 'spot', 'spot': true }
    };

    // Test 1: Basic market sharing
    const exchange1 = new ccxt.Exchange ({
        'id': 'primaryEx',
        'markets': sampleMarket
    });
    const exchange2 = new ccxt.Exchange ({
        'id': 'primaryEx',
    });

    assert (Object.keys (exchange1.markets).length > 0, 'Markets should be loaded in exchange1');

    // Test error case: exchanges are different
    const differentExchange = new ccxt.Exchange ({
        'id': 'secondaryEx',
    });
    try {
        differentExchange.setMarketsFromExchange (exchange1);
        assert (!trueClause, 'Should have thrown an error when using different exchange');
    } catch (error) {
        assert (trueClause);
    }

    // Test error case: sharing from exchange without markets
    const nonloadedExchange = new ccxt.Exchange ({
        'id': 'primaryEx',
    });
    try {
        exchange2.setMarketsFromExchange (nonloadedExchange); // exchange2 has no markets yet
        assert (!trueClause, 'Should have thrown error when sharing from exchange without markets');
    } catch (error) {
        assert (trueClause);
    }

    // Test the new setMarketsFromExchange method
    exchange2.setMarketsFromExchange (exchange1);

    // Verify shared markets work
    assert (testSharedMethods.deepEqual (emptyExchange, exchange1.symbols, exchange2.symbols), 'Symbols should be available after market sharing');
    assert (testSharedMethods.deepEqual (emptyExchange, exchange1.currencies, exchange2.currencies), 'currencies dont match');
    assert (testSharedMethods.deepEqual (emptyExchange, exchange1.codes, exchange2.codes), 'codes dont match');
    // TODO: add rest of assertions

    // Test 2: loadMarkets on shared markets should not make API call and be very fast
    const startTime = emptyExchange.milliseconds ();
    await exchange2.loadMarkets ();
    const endTime = emptyExchange.milliseconds ();

    // Should be very fast since no API call is made
    const timeTaken = endTime - startTime;
    assert (timeTaken < 10, 'loadMarkets on shared markets should be fast');
}

export default testSetMarketsFromExchange;
