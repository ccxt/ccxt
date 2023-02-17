'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testTradingFee (exchange, symbol, fee) {
    const method = 'tradingFee';
    const format = {
        'info': { 'a': 1, 'b': 2, 'c': 3 },
        'symbol': 'ETH/BTC',
        'maker': exchange.parseNumber ('0.002'),
        'taker': exchange.parseNumber ('0.003'),
        'percentage': false,
        'tierBased': false,
    };
    testCommonItems.testStructureKeys (exchange, method, fee, format);
    testCommonItems.testSymbol (exchange, method, fee, symbol);
    const logText = testCommonItems.logTemplate (exchange, method, transaction);
    //
    assert (typeof fee['maker'] === 'number', 'maker fee is not a number' + logText);
    assert (typeof fee['taker'] === 'number', 'taker fee is not a number' + logText);
    const percentageValue = exchange.safeValue (fee, 'percentage');
    if (percentageValue !== undefined) {
        assert ((percentageValue === true || percentageValue === false), 'percentage is not a boolean' + logText);
    }
    const tierBasedValue = exchange.safeValue (fee, 'tierBased');
    if (tierBasedValue !== undefined) {
        assert ((tierBasedValue === true || tierBasedValue === false), 'tierBased is not a boolean' + logText);
    }
    return fee;
}

module.exports = testTradingFee;
