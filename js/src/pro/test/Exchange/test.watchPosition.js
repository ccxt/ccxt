import assert from 'assert';
import testPosition from '../../../test/Exchange/base/test.position.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
async function testWatchPosition(exchange, skippedProperties, symbol) {
    const method = 'watchPosition';
    let now = exchange.milliseconds();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        let success = true;
        try {
            response = await exchange.watchPosition(symbol);
        }
        catch (e) {
            if (!testSharedMethods.isTemporaryFailure(e)) {
                throw e;
            }
            now = exchange.milliseconds();
            // continue;
            success = false;
        }
        if ((success === true) && (response !== undefined)) {
            assert(exchange.isDictionary(response), exchange.id + ' ' + method + ' ' + symbol + ' must return a dictionary. ' + exchange.json(response));
            now = exchange.milliseconds();
            testPosition(exchange, skippedProperties, method, response, symbol, now);
        }
    }
    return true;
}
export default testWatchPosition;
