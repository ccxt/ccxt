'use strict';

const sharedMethods = require ('./test.sharedMethods.js');

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
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    //
    sharedMethods.Ge (exchange, method, entry, 'tier', '0');
    sharedMethods.Ge (exchange, method, entry, 'minNotional', '0');
    sharedMethods.Ge (exchange, method, entry, 'maxNotional', '0');
    sharedMethods.Ge (exchange, method, entry, 'maxLeverage', '1');
    sharedMethods.Le (exchange, method, entry, 'maintenanceMarginRate', '1');
}

module.exports = testLeverageTier;
