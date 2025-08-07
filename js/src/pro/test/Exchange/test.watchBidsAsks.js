import assert from 'assert';
import testTicker from '../../../test/Exchange/base/test.ticker.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { ArgumentsRequired } from '../../../base/errors.js';
async function testWatchBidsAsks(exchange, skippedProperties, symbol) {
    const withoutSymbol = testWatchBidsAsksHelper(exchange, skippedProperties, undefined);
    const withSymbol = testWatchBidsAsksHelper(exchange, skippedProperties, [symbol]);
    await Promise.all([withSymbol, withoutSymbol]);
}
async function testWatchBidsAsksHelper(exchange, skippedProperties, argSymbols, argParams = {}) {
    const method = 'watchBidsAsks';
    let now = exchange.milliseconds();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchBidsAsks(argSymbols, argParams);
        }
        catch (e) {
            // for some exchanges, multi symbol methods might require symbols array to be present, so
            // so, if method throws "arguments-required" exception, we don't fail test, but just skip silently,
            // because tests will make a second call of this method with symbols array
            if ((e instanceof ArgumentsRequired) && (argSymbols === undefined || argSymbols.length === 0)) {
                // todo: provide random symbols to try
                return;
            }
            else if (!testSharedMethods.isTemporaryFailure(e)) {
                throw e;
            }
            now = exchange.milliseconds();
            continue;
        }
        assert(typeof response === 'object', exchange.id + ' ' + method + ' ' + exchange.json(argSymbols) + ' must return an object. ' + exchange.json(response));
        const values = Object.values(response);
        let checkedSymbol = undefined;
        if (argSymbols !== undefined && argSymbols.length === 1) {
            checkedSymbol = argSymbols[0];
        }
        testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, values, checkedSymbol);
        for (let i = 0; i < values.length; i++) {
            const ticker = values[i];
            testTicker(exchange, skippedProperties, method, ticker, checkedSymbol);
        }
        now = exchange.milliseconds();
    }
}
export default testWatchBidsAsks;
