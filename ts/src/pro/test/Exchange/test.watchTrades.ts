
import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchTrades (exchange, skippedProperties, symbol) {
    const method = 'watchTrades';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchTrades (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        assert (Array.isArray (response), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json (response));
        if (!('emptyResponse' in skippedProperties)) {
            assert (response.length > 0, exchange.id + ' ' + method + ' ' + symbol + ' must return at least one trade');
        }
        now = exchange.milliseconds ();
        for (let i = 0; i < response.length; i++) {
            testTrade (exchange, skippedProperties, method, response[i], symbol, now);
        }
        testSharedMethods.assertTimestampOrder (exchange, method, symbol, response);
    }
}

export default testWatchTrades;
