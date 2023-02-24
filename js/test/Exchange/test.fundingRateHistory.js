'use strict'

const testSharedMethods = require ('./test.sharedMethods.js');

function testFundingRateHistory (exchange, method, entry, symbol) {
    const format = {
        'info': {}, // Or []
        'symbol': 'BTC/USDT:USDT',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'fundingRate': exchange.parseNumber ('0.0006'),
    };
    const emptyNotAllowedFor = [ 'symbol', 'timestamp', 'fundingRate' ];
    testSharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.reviseSymbol (exchange, method, entry, 'symbol', symbol);
    testSharedMethods.reviseCommonTimestamp (exchange, method, entry);
}

module.exports = testFundingRateHistory;