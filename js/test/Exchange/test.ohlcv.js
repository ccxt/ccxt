'use strict';

const assert = require ('assert');

function testOHLCV (exchange, ohlcv, symbol, now) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    const json = exchange.json (ohlcv);
    assert (ohlcv);
    assert (Array.isArray (ohlcv), json);
    const length = ohlcv.length;
    assert (length >= 6);
    for (let i = 0; i < ohlcv.length; i++) {
        assert ((ohlcv[i] === undefined) || (typeof ohlcv[i] === 'number'), msgPrefix + 'item missing; ' + json);
    }

    assert (ohlcv[0] > 1230940800000, msgPrefix + 'timestamp is impossible to be before date 03.01.2009 ' + json); // 03 Jan 2009 - first block
    assert (ohlcv[0] < 2147483648000, msgPrefix + 'timestamp more than 19.01.2038; ' + json); // 19 Jan 2038 - int32 overflows

    const skippedExchanges = [
        'bitmex', // BitMEX API docs: also note the open price is equal to the close price of the previous timeframe bucket.
        'vcc', // same as BitMEX, the open price is equal to the close price of the previous timeframe bucket.
        'delta',
        'cryptocom',
    ];

    if (!exchange.inArray (exchange.id, skippedExchanges)) {
        assert ((ohlcv[1] === undefined) || (ohlcv[2] === undefined) || (ohlcv[1] <= ohlcv[2]), msgPrefix + 'open > high, ' + exchange.safeString (ohlcv, 1, 'undefined') + ' > ' + exchange.safeString (ohlcv, 2, 'undefined')); // open <= high
        assert ((ohlcv[3] === undefined) || (ohlcv[2] === undefined) || (ohlcv[3] <= ohlcv[2]), msgPrefix + 'low > high, ' + exchange.safeString (ohlcv, 2, 'undefined') + ' > ' + exchange.safeString (ohlcv, 3, 'undefined')); // low <= high
        assert ((ohlcv[3] === undefined) || (ohlcv[4] === undefined) || (ohlcv[3] <= ohlcv[4]), msgPrefix + 'low > close, ' + exchange.safeString (ohlcv, 3, 'undefined') + ' > ' + exchange.safeString (ohlcv, 4, 'undefined')); // low <= close
    }
}

module.exports = testOHLCV;
