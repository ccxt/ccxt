
import assert from 'assert';
import testMarket from './base/test.market.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchMarkets (exchange, skippedProperties) {
    const method = 'fetchMarkets';
    const markets = await exchange.fetchMarkets ();
    assert (typeof markets === 'object', exchange.id + ' ' + method + ' must return an object. ' + exchange.json (markets));
    const marketValues = Object.values (markets);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, marketValues);
    for (let i = 0; i < marketValues.length; i++) {
        testMarket (exchange, skippedProperties, method, marketValues[i]);
    }
}

export default testFetchMarkets;
