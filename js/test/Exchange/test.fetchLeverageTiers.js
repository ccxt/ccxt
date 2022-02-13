'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert');

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {
    // const format = {
    //     'RAY/USDT': [
    //       {},
    //     ],
    // };
    if (exchange.has.fetchLeverageTiers) {
        const method = 'fetchLeverageTiers';
        const tiers = await exchange [ method ] (symbol);
        const tierKeys = Object.keys (tiers);
        console.log (method + 'for ' + tierKeys.length + ' markets');
        for (let i = 0; i < tierKeys.length; i++) {
            const tiersForSymbol = tiers [ tierKeys[i] ];
            const arrayLength = tiersForSymbol.length;
            assert (arrayLength >= 1);
            for (let j=0; j < tiersForSymbol.length; j++) {
                const tier = tiersForSymbol[j];
                testLeverageTier (exchange, tier, method);
            }
        }
        return tiers;
    } else {
        console.log (method + ' not supported');
    }
}
