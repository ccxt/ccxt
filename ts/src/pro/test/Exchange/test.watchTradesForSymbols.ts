
import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function watchTradesForSymbols (exchange, skippedProperties, symbols) {
    const method = 'watchTradesForSymbols';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchTradesForSymbols (symbols);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        assert (Array.isArray (response), exchange.id + ' ' + method + ' ' + exchange.json (symbols) + ' must return an array. ' + exchange.json (response));
        now = exchange.milliseconds ();
        let symbol = undefined;
        for (let i = 0; i < response.length; i++) {
            const trade = response[i];
            symbol = trade['symbol'];
            testTrade (exchange, skippedProperties, method, trade, symbol, now);
            testSharedMethods.assertInArray (exchange, skippedProperties, method, trade, 'symbol', symbols);
        }
        testSharedMethods.assertTimestampOrder (exchange, method, symbol, response);
    }
}

export default watchTradesForSymbols;
