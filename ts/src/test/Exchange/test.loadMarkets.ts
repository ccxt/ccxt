import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testMarket from './base/test.market.js';

function testLoadedMarketTypes (exchange: Exchange) {
    const marketTypes = [ 'spot', 'swap', 'future', 'option', 'index' ];
    const collectedTypes = [];
    const markets = Object.values (exchange.markets);
    for (let i = 0; i < markets.length; i++) {
        const market = markets[i];
        if (!exchange.inArray (market['type'], collectedTypes)) {
            collectedTypes.push(market['type']);
        }
    }
    for (let i = 0; i < marketTypes.length; i++) {
        const mType = marketTypes[i];
        if (exchange.has[mType]) {
            assert (exchange.inArray (mType, collectedTypes), 'exchange.has[' + mType + '] is true, but no markets of type ' + mType + ' were found in exchange.markets');
        } else if (exchange.has[mType] === false) {
            assert (!exchange.inArray (mType, collectedTypes), 'exchange.has[' + mType + '] is false, but markets of type ' + mType + ' were found in exchange.markets');
        }
    }
}

async function testLoadMarkets (exchange: Exchange, skippedProperties: object) {
    const method = 'loadMarkets';
    const markets = await exchange.loadMarkets ();
    assert (exchange.isDictionary (exchange.markets), '.markets is not a dict');
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
    if (!('marketTypes' in skippedProperties)) {
        testLoadedMarketTypes (exchange);
    }
    return true;
}

export default testLoadMarkets;
