'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

//  ---------------------------------------------------------------------------

function testTradingFee (exchange = undefined, symbol, fee) {
    assert (fee, 'fee is undefined')
    assert (fee['info'], 'fee info is empty')
    assert (fee['symbol'] === symbol, 'trade symbol is not equal to requested symbol: trade: ' + fee['symbol'] + ' requested: ' + symbol)
    if (fee['maker']) {
        assert (typeof fee['maker'] === 'number', 'maker fee is not a number')
    }
    if (fee['taker']) {
        assert (typeof fee['taker'] === 'number', 'taker fee is not a number')
    }
    if (fee['percentage']) {
        assert (typeof fee['percentage'] === 'boolean', 'percentage is not a boolean')
    }
    if (fee['tierBased']) {
        assert (typeof fee['tierBased'] === 'boolean', 'tierBased is not a boolean')
    }
    return fee
}

module.exports = testTradingFee
