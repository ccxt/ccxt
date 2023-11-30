
import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchMyTrades (exchange, skippedProperties, symbol) {
    const method = 'watchMyTrades';
    let now = exchange.milliseconds ();
    const ends = now + exchange.wsMethodsTestTimeoutMS;
    while (now < ends) {
        try {
            const response = await exchange[method] (symbol);
            assert (Array.isArray (response), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json (response));
            now = exchange.milliseconds ();
            for (let i = 0; i < response.length; i++) {
                testTrade (exchange, skippedProperties, method, response[i], symbol, now);
            }
            testSharedMethods.assertTimestampOrder (exchange, method, symbol, response);
        } catch (e) {
            if (testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
        }
    }
}

export default testWatchMyTrades;
