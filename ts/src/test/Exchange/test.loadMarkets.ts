import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testMarket from './base/test.market.js';

async function testLoadMarkets (exchange: Exchange, skippedProperties: object) {
    const method = 'loadMarkets';
    const markets = await exchange.loadMarkets ();
    assert (typeof exchange.markets === 'object', '.markets is not an object');
    assert (Array.isArray (exchange.symbols), '.symbols is not an array');
    const symbolsLength = exchange.symbols.length;
    const marketKeys = Object.keys (exchange.markets);
    const marketKeysLength = marketKeys.length;
    assert (symbolsLength > 0, '.symbols count <= 0 (less than or equal to zero)');
    assert (marketKeysLength > 0, '.markets objects keys length <= 0 (less than or equal to zero)');
    assert (symbolsLength === marketKeysLength, 'number of .symbols is not equal to the number of .markets');
    const marketValues = Object.values (markets);
    for (let i = 0; i < marketValues.length; i++) {
        testMarket (exchange, skippedProperties, method, marketValues[i]);
    }
}

export default testLoadMarkets;
