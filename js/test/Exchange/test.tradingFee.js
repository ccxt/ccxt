'use strict'

const testCommonItems = require ('./test.commonItems.js');

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
    testCommonItems.testStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testCommonItems.testSymbol (exchange, method, entry, entry['symbol'], symbol);
}

module.exports = testTradingFee;
