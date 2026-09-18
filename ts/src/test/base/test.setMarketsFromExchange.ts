
import assert from 'assert';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
import ccxt from "../../../ccxt.js";

async function testSetMarketsFromExchange () {

    const emptyExchange = new ccxt.Exchange ({
        'id': 'sample0',
    });

    // @SKIP_START_GO
    const methodName = 'setMarketsFromExchange';
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

    assert ((exchange1.markets !== undefined) && (Object.keys (exchange1.markets).length > 0), 'Markets should be loaded in exchange1');

    // Test error cases: a different exchange id, and a source without markets
    const errorCases = [
        [ new ccxt.Exchange ({ 'id': 'secondaryEx' }), exchange1 ], // different exchange id
        [ exchange2, new ccxt.Exchange ({ 'id': 'primaryEx' }) ], // source has no markets yet
    ];
    for (let i = 0; i < errorCases.length; i++) {
        try {
            errorCases[i][0].setMarketsFromExchange (errorCases[i][1]);
            assert (!trueClause, 'Should have thrown an error for the case ' + i.toString ());
        } catch (error) {
            assert (trueClause);
        }
    }

    // Test the new setMarketsFromExchange method
    exchange2.setMarketsFromExchange (exchange1);

    // Verify shared markets work
    const neededProps = [ 'symbols', 'currencies', 'codes', 'markets', 'ids', 'markets_by_id', 'currencies_by_id', 'baseCurrencies', 'quoteCurrencies' ];
    for (let i = 0; i < neededProps.length; i++) {
        testSharedMethods.assertDeepEqual (emptyExchange, {}, methodName, emptyExchange.getProperty (exchange1, neededProps[i]), emptyExchange.getProperty (exchange2, neededProps[i]));
    }

    // Test 2: loadMarkets on shared markets should not make API call and be very fast
    const startTime = emptyExchange.milliseconds ();
    await exchange2.loadMarkets ();
    const endTime = emptyExchange.milliseconds ();

    // Should be very fast since no API call is made
    const timeTaken = endTime - startTime;
    assert (timeTaken < 10, 'loadMarkets on shared markets should be fast');
    // @SKIP_END_GO

    emptyExchange.describe (); // avoid unused var
}

export default testSetMarketsFromExchange;
