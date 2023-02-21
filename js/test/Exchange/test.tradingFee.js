'use strict'

const sharedMethods = require ('./test.sharedMethods.js');

function testTradingFee (exchange, method, symbol, entry) {
    const format = {
        'info': { },
        'symbol': 'ETH/BTC',
        'maker': exchange.parseNumber ('0.002'),
        'taker': exchange.parseNumber ('0.003'),
        'percentage': false,
        'tierBased': false,
    };
    const emptyNotAllowedFor = [ 'maker', 'taker', 'percentage', 'tierBased' ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseSymbol (exchange, method, entry, 'symbol', symbol);
}

module.exports = testTradingFee;
