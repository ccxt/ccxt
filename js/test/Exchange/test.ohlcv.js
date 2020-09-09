'use strict';

// ----------------------------------------------------------------------------

const assert = require ('assert');

//  ---------------------------------------------------------------------------

function testOHLCV (exchange, ohlcv, symbol, now) {
    assert (ohlcv);
    assert (Array.isArray (ohlcv));
    const length = ohlcv.length;
    assert (length >= 6);
    for (let i = 0; i < ohlcv.length; i++) {
        assert ((ohlcv[i] === undefined) || (typeof ohlcv[i] === 'number'));
    }

    assert (ohlcv[0] > 1230940800000); // 03 Jan 2009 - first block
    assert (ohlcv[0] < 2147483648000); // 19 Jan 2038 - int32 overflows

    assert ((ohlcv[1] === undefined) || (ohlcv[2] === undefined) || (ohlcv[1] <= ohlcv[2]), 'open > high, ' + exchange.safeString (ohlcv, 1, 'undefined') + ' > ' + exchange.safeString (ohlcv, 2, 'undefined')); // open <= high
    assert ((ohlcv[3] === undefined) || (ohlcv[2] === undefined) || (ohlcv[3] <= ohlcv[2]), 'low > high, ' + exchange.safeString (ohlcv, 2, 'undefined') + ' > ' + exchange.safeString (ohlcv, 3, 'undefined')); // low <= high
    assert ((ohlcv[3] === undefined) || (ohlcv[4] === undefined) || (ohlcv[3] <= ohlcv[4]), 'low > close, ' + exchange.safeString (ohlcv, 3, 'undefined') + ' > ' + exchange.safeString (ohlcv, 4, 'undefined')); // low <= close
}

module.exports = testOHLCV;
