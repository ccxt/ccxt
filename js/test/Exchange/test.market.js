'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = (exchange, market, method) => {

    const format = {
        'id':      'btcusd',   // string literal for referencing within an exchange
        'symbol':  'BTC/USD',  // uppercase string literal of a pair of currencies
        'base':    'BTC',      // unified uppercase string, base currency, 3 or more letters
        'quote':   'USD',      // unified uppercase string, quote currency, 3 or more letters
        'taker':   0.0011,     // taker fee, for example, 0.0011 = 0.11%
        'maker':   0.0009,     // maker fee, for example, 0.0009 = 0.09%
        //---------------------------------------------------------------------
        // commented temporarily to bring markets to consistency first
        // 'baseId':  'btc',      // exchange-specific base currency id
        // 'quoteId': 'usd',      // exchange-specific quote currency id
        // 'active': true,       // boolean, market status
        // 'precision': {        // number of decimal digits "after the dot"
        //     'price': 8,       // integer
        //     'amount': 8,      // integer
        //     'cost': 8,        // integer
        // },
        // 'limits': {           // value limits when placing orders on this market
        //     'amount': {
        //         'min': 0.01,  // order amount should be > min
        //         'max': 1000,  // order amount should be < max
        //     },
        //     'price': {
        //         'min': 0.01,  // order price should be > min
        //         'max': 1000,  // order price should be < max
        //     },
        //     'cost':  { // order cost = price * amount
        //         'min': 0.01,  // order cost should be > min
        //         'max': 1000,  // order cost should be < max
        //     },
        // },
        // 'info': {}, // the original unparsed market info from the exchange
        //---------------------------------------------------------------------
    }

    const keys = Object.keys (format)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        assert (key in market)
    }

    // assert ((market['baseId'] === undefined) || (typeof market['baseId'] === 'string'))
    // assert ((market['quoteId'] === undefined) || (typeof market['quoteId'] === 'string'))

    assert ((market['taker'] === undefined) || (typeof market['taker'] === 'number'))
    assert ((market['maker'] === undefined) || (typeof market['maker'] === 'number'))

    // expect (market['precision']['amount']).to.not.be.undefined
    // expect (market['precision']['price']).to.not.be.undefined

    // expect (market['limits']['amount']['min']).to.not.be.undefined
    // expect (market['limits']['price']['min']).to.not.be.undefined
    // expect (market['limits']['cost']['min']).to.not.be.undefined
}
