import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testMarket from './base/test.market.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchMarkets (exchange: Exchange, skippedProperties: object) {
    const method = 'fetchMarkets';
    const markets = await exchange.fetchMarkets ();
    assert (typeof markets === 'object', exchange.id + ' ' + method + ' must return an object. ' + exchange.json (markets));
    const marketValues = Object.values (markets);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, marketValues);
    for (let i = 0; i < marketValues.length; i++) {
        testMarket (exchange, skippedProperties, method, marketValues[i]);
    }
    detectMarketConflicts (exchange, markets);
    return true;
}

function detectMarketConflicts (exchange: Exchange, marketValues: any[]) {
    // detect if there are markets with different ids for the same symbol
    const ids = {};
    for (let i = 0; i < marketValues.length; i++) {
        const market = marketValues[i];
        const symbol = market['symbol'];
        if (!(symbol in ids)) {
            ids[symbol] = market['id'];
        } else {
            const isDifferent = ids[symbol] !== market['id'];
            assert (!isDifferent, exchange.id + ' fetchMarkets() has different ids for the same symbol: ' + symbol + ' ' + ids[symbol] + ' ' + market['id']);
        }
    }
    return true;
}

export default testFetchMarkets;
