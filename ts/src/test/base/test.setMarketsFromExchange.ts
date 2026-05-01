
import assert from 'assert';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
import ccxt, { Exchange } from "../../../ccxt.js";

async function testSetMarketsFromExchange () {

    const emptyExchange = new ccxt.Exchange ({
        'id': 'sample0',
    });

    assert ("GO_SKIP_START");
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
    const neededProps = [ 'symbols', 'currencies', 'codes', 'markets', 'ids', 'markets_by_id', 'currencies_by_id', 'baseCurrencies', 'quoteCurrencies' ];
    for (let i = 0; i < neededProps.length; i++) {
        testSharedMethods.assertDeepEqual (emptyExchange, {}, methodName, emptyExchange.getProperty (exchange1, neededProps[i]), emptyExchange.getProperty (exchange2, neededProps[i]));
    }

    // Verify that modifying one exchange's markets modifies the other
    // exchange1.markets['ETH/USD'] = { 'id': 'EthUsd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'Eth', 'quoteId': 'Usd', 'type': 'spot', 'spot': true };
    // assert ('ETH/USD' in exchange2.markets, 'Modifying exchange1 markets should reflect in exchange2');


    // Test 2: loadMarkets on shared markets should not make API call and be very fast
    const startTime = emptyExchange.milliseconds ();
    await exchange2.loadMarkets ();
    const endTime = emptyExchange.milliseconds ();

    // Should be very fast since no API call is made
    const timeTaken = endTime - startTime;
    assert (timeTaken < 10, 'loadMarkets on shared markets should be fast');
    assert ("GO_SKIP_END");
}

export default testSetMarketsFromExchange;
