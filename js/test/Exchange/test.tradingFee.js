'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testTradingFee (exchange, method, symbol, entry) {
    const format = {
        'info': { 'a': 1, 'b': 2, 'c': 3 },
        'symbol': 'ETH/BTC',
        'maker': exchange.parseNumber ('0.002'),
        'taker': exchange.parseNumber ('0.003'),
        'percentage': false,
        'tierBased': false,
    };
    const emptyNotAllowedFor = [ 'maker', 'taker' ];
    testCommonItems.testStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testCommonItems.testSymbol (exchange, method, entry, symbol);
    const logText = testCommonItems.logTemplate (exchange, method, transaction);
    //
    assert (typeof entry['maker'] === 'number', 'maker fee is not a number' + logText);
    assert (typeof entry['taker'] === 'number', 'taker fee is not a number' + logText);
    const percentageValue = exchange.safeValue (entry, 'percentage');
    if (percentageValue !== undefined) {
        assert ((percentageValue === true || percentageValue === false), 'percentage is not a boolean' + logText);
    }
    const tierBasedValue = exchange.safeValue (entry, 'tierBased');
    if (tierBasedValue !== undefined) {
        assert ((tierBasedValue === true || tierBasedValue === false), 'tierBased is not a boolean' + logText);
    }
}

module.exports = testTradingFee;
