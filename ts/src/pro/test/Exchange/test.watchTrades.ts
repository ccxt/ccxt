
import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import errors from '../../../base/errors.js';

async function testWatchTrades (exchange, skippedProperties, symbol) {
    const method = 'watchTrades';
    let now = exchange.milliseconds ();
    const ends = now + exchange.wsMethodsTestTimeoutMS;
    while (now < ends) {
        try {
            const trades = await exchange[method] (symbol);
            assert (Array.isArray (trades), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json (trades));
            now = exchange.milliseconds ();
            for (let i = 0; i < trades.length; i++) {
                testTrade (exchange, skippedProperties, method, trades[i], symbol, now);
            }
            testSharedMethods.assertTimestampOrder (exchange, method, symbol, trades);
        } catch (e) {
            if (!(e instanceof errors.OperationFailed)) {
                throw e;
            }
            now = exchange.milliseconds ();
        }
    }
}

export default testWatchTrades;
