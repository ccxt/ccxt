
import assert from 'assert';
import testLeverageTier from './base/test.leverageTier.js';

async function testFetchMarketLeverageTiers (exchange, skippedProperties, symbol) {
    const method = 'fetchMarketLeverageTiers';
    const tiers = await exchange.fetchMarketLeverageTiers (symbol);
    assert (Array.isArray (tiers), exchange.id + ' ' + method + ' ' + symbol + ' must return an array. ' + exchange.json (tiers));
    const arrayLength = tiers.length;
    assert (arrayLength >= 1, exchange.id + ' ' + method + ' ' + symbol + ' must return an array with at least one entry. ' + exchange.json (tiers));
    for (let j = 0; j < tiers.length; j++) {
        testLeverageTier (exchange, skippedProperties, method, tiers[j]);
    }
}

export default testFetchMarketLeverageTiers;
