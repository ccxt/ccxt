
import testBalance from '../../../test/Exchange/base/test.balance.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';

async function testWatchBalance (exchange, skippedProperties, symbol) {
    const method = 'watchBalance';
    let now = exchange.milliseconds ();
    const ends = now + exchange.wsMethodsTestTimeoutMS;
    while (now < ends) {
        try {
            const response = await exchange[method] (symbol);
            testBalance (exchange, skippedProperties, method, response);
        } catch (e) {
            if (testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            now = exchange.milliseconds ();
        }
    }
}

export default testWatchBalance;
