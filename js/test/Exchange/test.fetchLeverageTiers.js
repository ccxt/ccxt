'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const format = {
        // 'RAY/USDT': [
        //   {
            'tier': 1,
            'notionalFloor': 0,
            'notionalCap': 5000,
            'maintenanceMarginRate': 0.01,
            'maxLeverage': 25,
            'info': {}
        //   },
        // ],
    }

    if (exchange.has.fetchLeverageTiers) {

        const method = 'fetchLeverageTiers'
        const tiers = await exchange[method] (symbol)
        const tierKeys = Object.keys(tiers)
        console.log ('fetched leverage tiers for ', tierKeys.length, ' markets')

        for (let i = 0; i < tierKeys.length; i++) {
            const tiersForSymbol = tiers[tierKeys[i]]
            for (let j=0; j < tiersForSymbol.length; j++) {
                const tier = tiersForSymbol[j]
                const keys = Object.keys (format)
                for (let k = 0; k < keys.length; k++) {
                    const key = keys[i]
                    assert (key in tier)
                }
                assert (tier['tier'] >= 0)
                assert (tier['notionalFloor'] >= 0)
                assert (tier['notionalCap'] >= 0)
                assert (tier['maintenanceMarginRate'] >= 0)
                assert (tier['maintenanceMarginRate'] <= 1)
                assert (tier['maxLeverage'] >= 1)
            }
        }
        return tiers

    } else {
        console.log ('fetchLeverageTiers not supported')
    }
}
