'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');
const Precise = require ('../../base/Precise');

function testLeverageTier (exchange, method, tier) {
    const format = {
        'tier': exchange.parseNumber ('1'),
        'minNotional': exchange.parseNumber ('0'),
        'maxNotional': exchange.parseNumber ('5000'),
        'maintenanceMarginRate': exchange.parseNumber ('0.01'),
        'maxLeverage': exchange.parseNumber ('25'),
        'info': {},
    };
    testCommonItems.testStructureKeys (exchange, method, tier, format);
    const logText = testCommonItems.logTemplate (exchange, method, borrowRate);
    //
    if (tier['tier'] !== undefined) {
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
