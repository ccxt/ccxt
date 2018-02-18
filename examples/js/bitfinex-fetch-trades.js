"use strict";

// ----------------------------------------------------------------------------

const ccxt = require ('../../ccxt.js')
    , log  = require ('ololog')
    , asTable = require ('as-table').configure ({ delimiter: ' | ' })

// ----------------------------------------------------------------------------

;(async () => {

    const exchange = new ccxt.bitfinex ({
        'verbose': process.argv.includes ('--verbose'),
        'timeout': 60000,
    })

    try {

        const response = await exchange.fetchTrades ('ETH/BTC', 1518983548636 - 2 * 24 * 60 * 60 * 1000)
        log (asTable (response))
        log (response.length.toString (), 'trades')
        log.green ('Succeeded.')

    } catch (e) {

        log.dim ('--------------------------------------------------------')
        log (e.constructor.name, e.message)
        log.dim ('--------------------------------------------------------')
        log.dim (exchange.last_http_response)
        log.error ('Failed.')
    }

}) ()