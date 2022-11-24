'use strict';

const assert = require ('assert')
    , testLeverageTier = require ('./test.leverageTier.js')


module.exports = async (exchange, symbol) => {
    const method = 'fetchMarketLeverageTiers';
    if (exchange.has[method]) {

        const market = exchange.market (symbol);
        if (market.spot) {
            console.log (method + '() is not supported for spot markets');
            return;
        }

        const tiers = await exchange [method] (symbol);
        console.log (method + 'for ' + symbol);
        const arrayLength = tiers.length;
        assert (arrayLength >= 1);
        for (let j=0; j < tiers.length; j++) {
            const tier = tiers[j];
            testLeverageTier (exchange, method, tier);
        }
        return tiers;
    } else {
        console.log (method + '() is not supported');
    }
}
