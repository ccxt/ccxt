'use strict'

const assert = require ('assert');

function testTradingFee (symbol, fee) {

    const method = 'tradingFee';
    const msgPrefix = exchange.id + ' ' + method + ' : ';

    assert (fee, msgPrefix + 'fee is undefined');
    const sampleFee = {
        'info': { 'a': 1, 'b': 2, 'c': 3 },
        'symbol': 'ETH/BTC',
        'maker': 0.002,
        'taker': 0.003,
    };
    const keys = Object.keys (sampleFee);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (key in fee, msgPrefix + key + ' is missing from structure.');
    }
    assert (fee['symbol'] === symbol, msgPrefix + 'symbol is not equal to requested symbol: trade: ' + fee['symbol'] + ' requested: ' + symbol);
    assert (typeof fee['maker'] === 'number', msgPrefix + 'maker fee is not a number');
    assert (typeof fee['taker'] === 'number', msgPrefix + 'taker fee is not a number');
    if ('percentage' in fee) {
        assert (typeof fee['percentage'] === 'boolean', msgPrefix + 'percentage is not a boolean');
    }
    if ('tierBased' in fee) {
        assert (typeof fee['tierBased'] === 'boolean', msgPrefix + 'percentage is not a boolean');
    }
    return fee;
}

module.exports = testTradingFee;
