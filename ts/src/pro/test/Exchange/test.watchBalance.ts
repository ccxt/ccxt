
import testBalance from '../../../test/Exchange/base/test.balance.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchBalance (exchange, skippedProperties, code) {
    const method = 'watchBalance';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    while (now < ends) {
        let response = undefined;
        try {
            response = await exchange.watchBalance ();
        } catch (e: any) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
            continue;
        }
        testBalance (exchange, skippedProperties, method, response);
        now = exchange.milliseconds ();
    }
}

export default testWatchBalance;
