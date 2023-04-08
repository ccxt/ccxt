
import assert from 'assert';
import testMarket from './base/test.market.js';

async function testFetchMarkets (exchange) {
    const method = 'fetchMarkets';
    const markets = await exchange.fetchMarkets ();
    assert (typeof markets === 'object', exchange.id + ' ' + method + ' must return an object. ' + exchange.json (markets));
    const marketValues = Object.values (markets);
    for (let i = 0; i < marketValues.length; i++) {
        testMarket (exchange, method, marketValues[i]);
    }
}

export default testFetchMarkets;
