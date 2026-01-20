import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
async function testWatchMyTrades(exchange, skippedProperties, symbol) {
    const method = 'watchMyTrades';
    let now = exchange.milliseconds();
    const ends = now + 15000;
    while (now < ends) {
        let success = true;
        let response = undefined;
        try {
            response = await exchange.watchMyTrades(symbol);
        }
        catch (e) {
            if (!testSharedMethods.isTemporaryFailure(e)) {
                throw e;
            }
            now = exchange.milliseconds();
            // continue;
            success = false;
        }
        if (success === true) {
            testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, response, symbol);
            now = exchange.milliseconds();
            for (let i = 0; i < response.length; i++) {
                testTrade(exchange, skippedProperties, method, response[i], symbol, now);
            }
            testSharedMethods.assertTimestampOrder(exchange, method, symbol, response);
        }
    }
    return true;
}
export default testWatchMyTrades;
