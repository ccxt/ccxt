'use strict';

const assert = require ('assert');

function testLeverageTier (exchange, method, tier) {
    const format = {
        'tier': 1,
        'minNotional': 0,
        'maxNotional': 5000,
        'maintenanceMarginRate': 0.01,
        'maxLeverage': 25,
        'info': {},
    };
    const keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (key in tier, exchange.id + ' ' + method + ' ' + key + ' missing from response');
    }
    if (tier['tier'] !== undefined) {
        assert (typeof tier['tier'] === 'number');
        assert (tier['tier'] >= 0);
    }
    if (tier['minNotional'] !== undefined) {
        assert (typeof tier['minNotional'] === 'number');
        assert (tier['minNotional'] >= 0);
    }
    if (tier['maxNotional'] !== undefined) {
        assert (typeof tier['maxNotional'] === 'number');
        assert (tier['maxNotional'] >= 0);
    }
    if (tier['maxLeverage'] !== undefined) {
        assert (typeof tier['maxLeverage'] === 'number');
        assert (tier['maxLeverage'] >= 1);
    }
    if (tier['maintenanceMarginRate'] !== undefined) {
        assert (typeof tier['maintenanceMarginRate'] === 'number');
        assert (tier['maintenanceMarginRate'] <= 1);
    }
    console.log (exchange.id, method, tier['tier'], tier['minNotional'], tier['maxNotional'], tier['maintenanceMarginRate'], tier['maxLeverage']);
    return tier;
}

module.exports = testLeverageTier;
