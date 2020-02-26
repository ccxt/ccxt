'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = (exchange, ohlcv, symbol, now) => {
    assert.isOk (ohlcv)
    assert (Array.isArray (ohlcv))
    assert (ohlcv.length >= 6)
    for (let i = 0; i < ohlcv.length; i++) {
        assert (ohlcv[i] === undefined || typeof ohlcv[i] === 'number')
    }

    assert (ohlcv[0] > 1230940800000) // 03 Jan 2009 - first block
    assert (ohlcv[0] < 2147483648000) // 19 Jan 2038 - int32 overflows

    assert (ohlcv[1] === undefined || ohlcv[2] === undefined || ohlcv[1] <= ohlcv[2], 'open > high! ' + (ohlcv[1].toString () + ' > ' + ohlcv[2].toString ())) // open <= high
    assert (ohlcv[3] === undefined || ohlcv[2] === undefined || ohlcv[3] <= ohlcv[2], 'low > high! ' + (ohlcv[3].toString () + ' > ' + ohlcv[2].toString ())) // low <= high
    assert (ohlcv[3] === undefined || ohlcv[4] === undefined || ohlcv[3] <= ohlcv[4], 'low > close! ' + (ohlcv[3].toString () + ' > ' + ohlcv[4].toString ())) // low <= close
}