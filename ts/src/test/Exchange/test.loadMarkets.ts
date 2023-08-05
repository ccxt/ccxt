
import testMarket from './base/test.market.js';

async function testLoadMarkets (exchange, skippedProperties) {
    const method = 'loadMarkets';
    const markets = await exchange.loadMarkets ();
    const marketValues = Object.values (markets);
    for (let i = 0; i < marketValues.length; i++) {
        testMarket (exchange, skippedProperties, method, marketValues[i]);
    }
}

export default testLoadMarkets;
