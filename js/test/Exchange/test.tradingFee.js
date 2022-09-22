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
    };
    testCommonItems.testStructureKeys (exchange, method, fee, format);
    testCommonItems.testInfo (exchange, method, fee, 'object');

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (fee) + ' >>> ';

    assert (fee['symbol'] === symbol, 'symbol is not equal to requested symbol; returned: ' + fee['symbol'] + ' requested: ' + symbol + logText);
    assert (typeof fee['maker'] === 'number', 'maker fee is not a number' + logText);
    assert (typeof fee['taker'] === 'number', 'taker fee is not a number' + logText);
    if ('percentage' in fee) {
        assert (typeof fee['percentage'] === 'boolean', 'percentage is not a boolean' + logText);
    }
    if ('tierBased' in fee) {
        assert (typeof fee['tierBased'] === 'boolean', 'percentage is not a boolean' + logText);
    }
    return fee;
}

module.exports = testTradingFee;
