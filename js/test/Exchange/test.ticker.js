'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = (exchange, ticker, method, symbol) => {

    const format = {
        'symbol':       'ETH/BTC',
        'info':          {},
        'timestamp':     1234567890,
        'datetime':     '2017-09-01T00:00:00',
        'high':          1.234, // highest price
        'low':           1.234, // lowest price
        'bid':           1.234, // current best bid (buy) price
        'bidVolume':     1.234, // current best bid (buy) amount (may be missing or undefined)
        'ask':           1.234, // current best ask (sell) price
        'askVolume':     1.234, // current best ask (sell) amount (may be missing or undefined)
        'vwap':          1.234, // volume weighed average price
        'open':          1.234, // opening price
        'close':         1.234, // price of last trade (closing price for current period)
        'last':          1.234, // same as `close`, duplicated for convenience
        'previousClose': 1.234, // closing price for the previous period
        'change':        1.234, // absolute change, `last - open`
        'percentage':    1.234, // relative change, `(change/open) * 100`
        'average':       1.234, // average price, `(last + open) / 2`
        'baseVolume':    1.234, // volume of base currency
        'quoteVolume':   1.234, // volume of quote currency
    }

    expect (ticker).to.have.all.keys (format)

    const keys = [ 'datetime', 'timestamp', 'high', 'low', 'bid', 'ask', 'baseVolume', 'quoteVolume', 'vwap' ]

    assert (!('first' in ticker), '`first` field leftover in ' + exchange.id)
    assert (ticker['last'] === ticker['close'], '`last` != `close` in ' + exchange.id)

    // log (ticker)

    keys.forEach (key => assert (key in ticker))

    const { high, low, vwap, baseVolume, quoteVolume } = ticker

    // this assert breaks QuadrigaCX sometimes... still investigating
    // if (vwap)
    //     assert (vwap >= low && vwap <= high)

    /*
    if (baseVolume && quoteVolume && high && low) {
        assert (quoteVolume >= baseVolume * low) // this assertion breaks therock
        assert (quoteVolume <= baseVolume * high)
    }
    */

    if (baseVolume && vwap)
        assert (quoteVolume)

    if (quoteVolume && vwap)
        assert (baseVolume)

    // log (symbol.green, 'ticker',
    //     ticker['datetime'],
    //     ... (keys.map (key =>
    //         key + ': ' + ticker[key])))

    if (![

        'coinmarketcap',
        'xbtce',

    ].includes (exchange.id)) {

        if (ticker['bid'] && ticker['ask'])
            assert (ticker['bid'] <= ticker['ask'])

    }

    return ticker
}