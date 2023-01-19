'use strict';

const assert = require ('assert')
    , testLeverageTier = require ('./test.leverageTier.js')


module.exports = async (exchange, symbol) => {
    const method = 'fetchLeverageTiers';
    // const format = {
    //     'RAY/USDT': [
    //       {},
    //     ],
    // };
    if (exchange.has[method]) {

        const market = exchange.market (symbol);
        if (market.spot) {
            console.log (method + '() is not supported for spot markets');
            return;
        }

        const tiers = await exchange [method] ([ symbol ]);
        const tierKeys = Object.keys (tiers);
        const numTierKeys = tierKeys.length;
        assert (numTierKeys >= 1);
        console.log (method + 'for ' + numTierKeys + ' markets');
        for (let i = 0; i < numTierKeys; i++) {
            const tiersForSymbol = tiers [ tierKeys[i] ];
            const arrayLength = tiersForSymbol.length;
            assert (arrayLength >= 1);
            for (let j=0; j < tiersForSymbol.length; j++) {
                const tier = tiersForSymbol[j];
                testLeverageTier (exchange, method, tier);
            }
        }
        return tiers;
    } else {
        console.log (method + '() is not supported');
    }
}
