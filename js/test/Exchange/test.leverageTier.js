'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testLeverageTier (exchange, method, item) {
    const format = {
        'tier': exchange.parseNumber ('1'),
        'minNotional': exchange.parseNumber ('0'),
        'maxNotional': exchange.parseNumber ('5000'),
        'maintenanceMarginRate': exchange.parseNumber ('0.01'),
        'maxLeverage': exchange.parseNumber ('25'),
        'info': {},
    };
    testCommonItems.testStructureKeys (exchange, method, tier, format);
    //
    testCommonItems.Ge (exchange, method, item, 'tier', '0');
    testCommonItems.Ge (exchange, method, item, 'minNotional', '0');
    testCommonItems.Ge (exchange, method, item, 'maxNotional', '0');
    testCommonItems.Ge (exchange, method, item, 'maxLeverage', '1');
    testCommonItems.Le (exchange, method, item, 'maintenanceMarginRate', '1');
}

module.exports = testLeverageTier;
