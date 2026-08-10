
import testBalance from '../../../test/Exchange/base/test.balance.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange } from '../../../../ccxt.js';
import testExchangeSpecificWatchBalance from './test.exchangeSpecific.js';

async function testWatchBalance (exchange: Exchange, skippedProperties: object, code: string) {
    await testExchangeSpecificWatchBalance (exchange);
    const method = 'watchBalance';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = {};
        let success = true;
        try {
            response = await exchange.watchBalance ();
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            // continue;
            success = false;
        }
        if (success === false) {
            continue; // retry
        }
        testBalance (exchange, skippedProperties, method, response);
        now = exchange.milliseconds ();
    }
}

export default testWatchBalance;
