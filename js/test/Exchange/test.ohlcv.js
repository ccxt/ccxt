'use strict';

const assert = require ('assert');
const sharedMethods = require ('./test.commonItems.js');

function testOHLCV (exchange, method, entry, symbol, now) {
    const format = [
        1638230400000,
        exchange.parseNumber ('0.123'),
        exchange.parseNumber ('0.125'),
        exchange.parseNumber ('0.121'),
        exchange.parseNumber ('0.122'),
        exchange.parseNumber ('123.456'),
    ];
    const logText = sharedMethods.logTemplate (exchange, method, market);
    assert (Array.isArray (ohlcv), 'ohlcv is not array;' + logText);
    const emptyNotAllowedFor = [ 0, 1, 2, 3, 4, 5 ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseCommonTimestamp (exchange, method, entry, format, now, 0);
    //
    const length = ohlcv.length;
    assert (length >= 6, 'ohlcv array length should be >= 6;' + logText);
    const skippedExchanges = [
        'bitmex', // BitMEX API docs: also note the open price is equal to the close price of the previous timeframe bucket.
        'delta',
        'cryptocom',
    ];
    if (!exchange.inArray (exchange.id, skippedExchanges)) {
        assert ((ohlcv[1] === undefined) || (ohlcv[2] === undefined) || (ohlcv[1] <= ohlcv[2]), 'open > high, ' + exchange.safeString (ohlcv, 1, 'undefined') + ' > ' + exchange.safeString (ohlcv, 2, 'undefined')); // open <= high
        assert ((ohlcv[3] === undefined) || (ohlcv[2] === undefined) || (ohlcv[3] <= ohlcv[2]), 'low > high, ' + exchange.safeString (ohlcv, 2, 'undefined') + ' > ' + exchange.safeString (ohlcv, 3, 'undefined')); // low <= high
        assert ((ohlcv[3] === undefined) || (ohlcv[4] === undefined) || (ohlcv[3] <= ohlcv[4]), 'low > close, ' + exchange.safeString (ohlcv, 3, 'undefined') + ' > ' + exchange.safeString (ohlcv, 4, 'undefined')); // low <= close
    }
    assert ((symbol === undefined) || (typeof symbol === 'string'), 'symbol ' + symbol + ' is incorrect' + logText);
}

module.exports = testOHLCV;
