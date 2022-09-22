'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testOHLCV (exchange, ohlcv, symbol, now) {
    const method = 'ohlcv';
    const format = [
        1638230400000,
        0.123,
        0.125,
        0.121,
        0.122,
        123.456,
    ];
    testCommonItems.testStructureKeys (exchange, method, ohlcv, format);

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (ohlcv) + ' >>> ';

    assert (Array.isArray (ohlcv), 'ohlcv is not array;' + logText);
    const length = ohlcv.length;
    assert (length >= 6);

    assert (ohlcv[0] > 1230940800000, 'timestamp is impossible to be before date 03.01.2009;' + logText); // 03 Jan 2009 - first block
    assert (ohlcv[0] < 2147483648000, 'timestamp more than 19.01.2038;' + logText); // 19 Jan 2038 - int32 overflows

    const skippedExchanges = [
        'bitmex', // BitMEX API docs: also note the open price is equal to the close price of the previous timeframe bucket.
        'vcc', // same as BitMEX, the open price is equal to the close price of the previous timeframe bucket.
        'delta',
        'cryptocom',
    ];

    if (!exchange.inArray (exchange.id, skippedExchanges)) {
        assert ((ohlcv[1] === undefined) || (ohlcv[2] === undefined) || (ohlcv[1] <= ohlcv[2]), 'open > high, ' + exchange.safeString (ohlcv, 1, 'undefined') + ' > ' + exchange.safeString (ohlcv, 2, 'undefined')); // open <= high
        assert ((ohlcv[3] === undefined) || (ohlcv[2] === undefined) || (ohlcv[3] <= ohlcv[2]), 'low > high, ' + exchange.safeString (ohlcv, 2, 'undefined') + ' > ' + exchange.safeString (ohlcv, 3, 'undefined')); // low <= high
        assert ((ohlcv[3] === undefined) || (ohlcv[4] === undefined) || (ohlcv[3] <= ohlcv[4]), 'low > close, ' + exchange.safeString (ohlcv, 3, 'undefined') + ' > ' + exchange.safeString (ohlcv, 4, 'undefined')); // low <= close
    }
}

module.exports = testOHLCV;
