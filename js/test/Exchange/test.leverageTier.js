'use strict';

const testSharedMethods = require ('./test.sharedMethods.js');

function testLeverageTier (exchange, method, entry) {
    const format = {
        'tier': exchange.parseNumber ('1'),
        'minNotional': exchange.parseNumber ('0'),
        'maxNotional': exchange.parseNumber ('5000'),
        'maintenanceMarginRate': exchange.parseNumber ('0.01'),
        'maxLeverage': exchange.parseNumber ('25'),
        'info': {},
    };
    const emptyNotAllowedFor = [ 'maxLeverage', ' info' ];
    testSharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    //
    testSharedMethods.Ge (exchange, method, entry, 'tier', '0');
    testSharedMethods.Ge (exchange, method, entry, 'minNotional', '0');
    testSharedMethods.Ge (exchange, method, entry, 'maxNotional', '0');
    testSharedMethods.Ge (exchange, method, entry, 'maxLeverage', '1');
    testSharedMethods.Le (exchange, method, entry, 'maintenanceMarginRate', '1');
}

module.exports = testLeverageTier;
