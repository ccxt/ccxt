import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testMarket from './base/test.market.js';

async function testLoadMarkets (exchange: Exchange, skippedProperties: object) {
    const method = 'loadMarkets';
    const markets = await exchange.loadMarkets ();
    assert (exchange.isDictionary (exchange.markets), '.markets is not a dict');
    assert (Array.isArray (exchange.symbols), '.symbols is not an array');
    const symbolsLength = exchange.symbols.length;
    assert (exchange.markets !== undefined, '.markets is undefined');
    const marketKeys = Object.keys (exchange.markets);
    const marketKeysLength = marketKeys.length;
    assert (symbolsLength > 0, '.symbols count <= 0 (less than or equal to zero)');
    assert (marketKeysLength > 0, '.markets objects keys length <= 0 (less than or equal to zero)');
    assert (symbolsLength === marketKeysLength, 'number of .symbols is not equal to the number of .markets');
    const marketValues = Object.values (markets);
    for (let i = 0; i < marketValues.length; i++) {
        testMarket (exchange, skippedProperties, method, marketValues[i]);
    }
    // market-type coverage (inlined: a nested helper breaks Java emit into a missing TestLoadedMarketTypes class)
    const marketTypes = [ 'spot', 'swap', 'future', 'option', 'index' ];
    const collectedTypes = [];
    const allMarkets = Object.values (exchange.markets);
    for (let i = 0; i < allMarkets.length; i++) {
        const market = allMarkets[i];
        if (!exchange.inArray (market['type'], collectedTypes)) {
            collectedTypes.push (market['type']);
        }
    }
    for (let i = 0; i < marketTypes.length; i++) {
        const mType = marketTypes[i];
        if (exchange.has[mType]) {
            const skipMarketTypes = ('optionsNotLoadedByDefault' in skippedProperties) && mType === 'option';
            assert (exchange.inArray (mType, collectedTypes) || skipMarketTypes, 'exchange.has[' + mType + '] is true, but no markets of type ' + mType + ' were found in exchange.markets');
        } else if (exchange.has[mType] === false) {
            // some exchanges might have a couple of markets of a certain type loaded even though 'has[type]' is
            // marked as false (e.g. a legacy/edge-case market); such known exceptions can be whitelisted per-exchange
            // in skip-tests.json by adding a key matching the market type (e.g. "swap") under that method's skips
            const isKnownException = (mType in skippedProperties);
            assert (!exchange.inArray (mType, collectedTypes) || isKnownException, 'exchange.has[' + mType + '] is false, but markets of type ' + mType + ' were found in exchange.markets');
        }
    }
    return true;
}

export default testLoadMarkets;
