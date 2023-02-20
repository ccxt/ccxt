'use strict';

const testCommonItems = require ('./test.commonItems.js');

function testLeverageTier (exchange, method, entry) {
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
    testCommonItems.Ge (exchange, method, entry, 'tier', '0');
    testCommonItems.Ge (exchange, method, entry, 'minNotional', '0');
    testCommonItems.Ge (exchange, method, entry, 'maxNotional', '0');
    testCommonItems.Ge (exchange, method, entry, 'maxLeverage', '1');
    testCommonItems.Le (exchange, method, entry, 'maintenanceMarginRate', '1');
}

module.exports = testLeverageTier;
