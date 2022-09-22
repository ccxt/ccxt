'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testLeverageTier (exchange, method, tier) {
    const method = 'leverageTier';
    const format = {
        'tier': 1,
        'minNotional': 0,
        'maxNotional': 5000,
        'maintenanceMarginRate': 0.01,
        'maxLeverage': 25,
        'info': {},
    };
    testCommonItems.testStructureKeys (exchange, method, tier, format);
    testCommonItems.testInfo (exchange, method, tier, 'object');

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (tier) + ' >>> ';

    if (tier['tier'] !== undefined) {
        assert (typeof tier['tier'] === 'number');
        assert (tier['tier'] >= 0, 'tier is expected to be >= 0' + logText);
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
        assert (tier['maxLeverage'] >= 1, 'maxLeverage must be >= 1' + logText);
    }
    if (tier['maintenanceMarginRate'] !== undefined) {
        assert (typeof tier['maintenanceMarginRate'] === 'number');
        assert (tier['maintenanceMarginRate'] <= 1);
    }
    return tier;
}

module.exports = testLeverageTier;
