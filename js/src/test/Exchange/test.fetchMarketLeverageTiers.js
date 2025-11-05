import testLeverageTier from './base/test.leverageTier.js';
import testSharedMethods from './base/test.sharedMethods.js';
async function testFetchMarketLeverageTiers(exchange, skippedProperties, symbol) {
    const method = 'fetchMarketLeverageTiers';
    const tiers = await exchange.fetchMarketLeverageTiers(symbol);
    testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, tiers, symbol);
    for (let j = 0; j < tiers.length; j++) {
        testLeverageTier(exchange, skippedProperties, method, tiers[j]);
    }
    return true;
}
export default testFetchMarketLeverageTiers;
