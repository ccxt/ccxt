'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = (exchange, trade, symbol, now) => {

    assert.isOk (trade)

    const sampleTrade = {
        'info':         { a: 1, b: 2, c: 3 },       // the original decoded JSON as is
        'id':           '12345-67890:09876/54321',  // string trade id
        'timestamp':    1502962946216,              // Unix timestamp in milliseconds
        'datetime':     '2017-08-17 12:42:48.000',  // ISO8601 datetime with milliseconds
        'symbol':       'ETH/BTC',                  // symbol
        'order':        '12345-67890:09876/54321',  // string order id or undefined/None/null
        'type':         'limit',                    // order type, 'market', 'limit' or undefined/None/null
        'side':         'buy',                      // direction of the trade, 'buy' or 'sell'
        'takerOrMaker': 'taker',                    // string, 'taker' or 'maker'
        'price':        0.06917684,                 // float price in quote currency
        'amount':       1.5,                        // amount of base currency
        'cost':         0.10376526,                 // total cost (including fees), `price * amount`
    }

    assert.containsAllKeys (trade, sampleTrade)
    assert.hasAnyKeys (trade, [ 'fee', 'fees' ])

    const feeKeys = [ 'cost', 'currency' ]

    if (trade.fee !== undefined) {
        assert (typeof trade.fee === 'object')
        assert.containsAllKeys (trade.fee, feeKeys)
    }

    if (trade.fees !== undefined) {
        assert (typeof trade.fees === 'object')
        assert (Array.isArray (trade.fees))
        trade.fees.forEach (fee => assert.containsAllKeys (fee, feeKeys))
    }

    assert (trade.id === undefined || typeof trade.id === 'string')
    assert (typeof trade.timestamp === 'number' || trade.timestamp === undefined)

    if (trade.timestamp) {
        assert (trade.timestamp > 1230940800000) // 03 Jan 2009 - first block
        assert (trade.timestamp < 2147483648000) // 19 Jan 2038 - int32 overflows
    }

    //------------------------------------------------------------------

    const adjustedNow = now + 60000

    const exchangesExcludedFromTimestampCheck = [
        'coinbasepro',
        'coinbaseprime', // ... as well, probably
        'kucoin2',
    ]

    if (trade.timestamp) {
        if (!exchangesExcludedFromTimestampCheck.includes (exchange.id)) {
            assert (trade.timestamp < adjustedNow, 'trade.timestamp is greater than or equal to current time: trade: ' + exchange.iso8601 (trade.timestamp) + ' now: ' + exchange.iso8601 (now))
        }
    }

    //------------------------------------------------------------------

    assert (trade.datetime === exchange.iso8601 (trade.timestamp))

    const isExchangeLackingFilteringTradesBySymbol = [
        'kraken', // override for kraken and possibly other exchanges as well, can't return private trades per symbol at all
    ].includes (exchange.id)

    if (!isExchangeLackingFilteringTradesBySymbol)
        assert (trade.symbol === symbol, 'trade symbol is not equal to requested symbol: trade: ' + trade.symbol + ' reqeusted: ' + symbol)

    assert (trade.type  === undefined || typeof trade.type === 'string')
    assert (trade.side  === undefined || trade.side === 'buy' || trade.side === 'sell')
    assert (trade.order === undefined || typeof trade.order === 'string')
    assert (typeof trade.price === 'number', 'trade.price is not a number')
    assert (trade.price > 0)
    assert (typeof trade.amount === 'number', 'trade.amount is not a number')
    assert (trade.amount >= 0)
    assert (trade.takerOrMaker === undefined || trade.takerOrMaker === 'taker' || trade.takerOrMaker === 'maker')
    assert.isOk (trade.info)
}
