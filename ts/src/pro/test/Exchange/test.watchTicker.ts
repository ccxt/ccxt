
import assert from 'assert';
import testTicker from '../../../test/Exchange/base/test.ticker.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange } from '../../../../ccxt.js';

async function testWatchTicker (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'watchTicker';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    const maxIdleTime = 5000;
    let idle = false;
    while ((now < ends) && !idle) {
        let response: any = undefined;
        let success = true;
        const startTime = exchange.milliseconds ();
        try {
            response = await exchange.watchTicker (symbol);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            success = false;
        }
        now = exchange.milliseconds ();
        if ((success === true) && (response !== undefined)) {
            assert (exchange.isDictionary (response), exchange.id + ' ' + method + ' ' + symbol + ' must return a dictionary. ' + exchange.json (response));
            testTicker (exchange, skippedProperties, method, response, symbol);
            if ((now - startTime) > maxIdleTime) {
                idle = true;
            }
        }
    }
    return true;
}

export default testWatchTicker;
