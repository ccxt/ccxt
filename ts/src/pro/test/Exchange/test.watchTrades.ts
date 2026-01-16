
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange } from '../../../../ccxt.js';


async function testWatchTrades (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchTrades';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        let success = true;
        try {
            response = await exchange.watchTrades (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            // continue;
            success = false;
        }
        if (success === true) {
            testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, response);
            now = exchange.milliseconds ();
            for (let i = 0; i < response.length; i++) {
                testTrade (exchange, skippedProperties, method, response[i], symbol, now);
            }
            if (!('timestampSort' in skippedProperties)) {
                testSharedMethods.assertTimestampOrder (exchange, method, symbol, response);
            }
        }

    }
}

export default testWatchTrades;
