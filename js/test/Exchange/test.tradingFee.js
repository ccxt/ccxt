'use strict';

// ----------------------------------------------------------------------------

const assert = require ('assert');
const { type } = require('os');

//  ---------------------------------------------------------------------------

function testTradingFee (exchange, symbol, fee) {
    assert (fee);
    assert (fee['info'])
    if (fee['maker']) {
        assert (typeof fee['maker'] === 'number');
    }
    if (fee['taker']) {
        assert (typeof fee['taker'] === 'number');
    }
    assert (fee['symbol'] === symbol, 'trade symbol is not equal to requested symbol: trade: ' + fee['symbol'] + ' requested: ' + symbol);
}

module.exports = testTradingFee;
