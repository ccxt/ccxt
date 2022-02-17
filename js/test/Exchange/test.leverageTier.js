'use strict';

const assert = require ('assert');

function testLeverageTier (exchange, method, tier) {
    const format = {
        'tier': 1,
        'notionalFloor': 0,
        'notionalCap': 5000,
        'maintenanceMarginRate': 0.01,
        'maxLeverage': 25,
        'info': {},
    };
    const keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (key in tier);
    }
    assert (typeof tier['tier'] === 'number');
    assert (typeof tier['notionalFloor'] === 'number');
    assert (typeof tier['notionalCap'] === 'number');
    assert (typeof tier['maintenanceMarginRate'] === 'number');
    assert (typeof tier['maxLeverage'] === 'number');
    assert (tier['tier'] >= 0);
    assert (tier['notionalFloor'] >= 0);
    assert (tier['notionalCap'] >= 0);
    assert (tier['maintenanceMarginRate'] <= 1);
    assert (tier['maxLeverage'] >= 1);
    console.log (exchange.id, method, tier['tier'], tier['notionalFloor'], tier['notionalCap'], tier['maintenanceMarginRate'], tier['maxLeverage']);
    return tier;
}

module.exports = testLeverageTier;
