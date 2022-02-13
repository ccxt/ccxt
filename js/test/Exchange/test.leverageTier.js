'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = async (exchange, tier, method) => {
    
    const format = {
        'tier': 1,
        'notionalFloor': 0,
        'notionalCap': 5000,
        'maintenanceMarginRatio': 0.01,
        'maxLeverage': 25,
        'info': {}
    }

    const keys = Object.keys (format)
    for (let k = 0; k < keys.length; k++) {
        const key = keys[i]
        assert (key in tier)
    }
    assert (tier['tier'] >= 0)
    assert (tier['notionalFloor'] >= 0)
    assert (tier['notionalCap'] >= 0)
    assert (tier['maintenanceMarginRate'] <= 1)
    assert (tier['maxLeverage'] >= 1)

    console.log (
        exchange.id,
        method,
        tier['tier'],
        tier['notionalFloor'],
        tier['notionalCap'],
        tier['maintenanceMarginRate'],
        tier['maxLeverage']
    )

    return tier
}
