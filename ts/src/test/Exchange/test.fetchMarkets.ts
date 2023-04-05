
import assert from 'assert';
import testMarket from './test.market.js';

async function testFetchMarkets (exchange) {
    const method = 'fetchMarkets';
    const markets = await exchange[method] ();
    assert (typeof markets === 'object', exchange.id + ' ' + method + ' must return an object. ' + exchange.json (markets));
    const marketValues = Object.values (markets);
    console.log (exchange.id, method, 'fetched', marketValues.length, 'entries, asserting each ...');
    for (let i = 0; i < marketValues.length; i++) {
        testMarket (exchange, method, marketValues[i]);
    }
}

export default testFetchMarkets;
