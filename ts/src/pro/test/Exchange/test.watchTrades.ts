
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange, Trade } from '../../../../ccxt.js';


async function testWatchTrades (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchTrades';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    const maxIdleTime = 5000;
    let idle = false;
    while ((now < ends) && !idle) {
        let response: Trade[] = [];
        let success = true;
        const startTime = exchange.milliseconds ();
        try {
            response = await exchange.watchTrades (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            success = false;
        }
        now = exchange.milliseconds ();
        if (success === true) {
            testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, response);
            for (let i = 0; i < response.length; i++) {
                testTrade (exchange, skippedProperties, method, response[i], symbol, now, true);
            }
            if ((now - startTime) > maxIdleTime) {
                idle = true;
            }
        }
    }
    return true;
}

export default testWatchTrades;
