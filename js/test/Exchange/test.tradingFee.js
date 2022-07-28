'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

//  ---------------------------------------------------------------------------

function testTradingFee (symbol, fee) {
    assert (fee, 'fee is undefined')
    const sampleFee = {
        'info': { 'a': 1, 'b': 2, 'c': 3 },
        'symbol': 'ETH/BTC',
        'maker': 0.002,
        'taker': 0.003,
    }
    const keys = Object.keys (sampleFee)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        assert (key in fee, 'fee key ' + key + ' not found')
    }
    assert (fee['symbol'] === symbol, 'trade symbol is not equal to requested symbol: trade: ' + fee['symbol'] + ' requested: ' + symbol)
    assert (typeof fee['maker'] === 'number', 'maker fee is not a number')
    assert (typeof fee['taker'] === 'number', 'taker fee is not a number')
    if ('percentage' in fee) {
        assert (typeof fee['percentage'] === 'boolean', 'percentage is not a boolean')
    }
    if ('tierBased' in fee) {
        assert (typeof fee['tierBased'] === 'boolean', 'percentage is not a boolean')
    }
    return fee
}

module.exports = testTradingFee
