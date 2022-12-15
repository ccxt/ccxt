'use strict'

const ccxt = require ('../../ccxt')
    , log = require ('ololog')
    , asTable = require ('as-table')

;(async function main () {

    let kraken = new ccxt.kraken ()
    await kraken.loadMarkets ()

    const markets = Object.values (kraken.markets).map (market => ({
        symbol: market.symbol,
        active: market.active,
    }))

    log.bright.green.noLocate ('Markets:')
    log.green.noLocate (asTable (markets), '\n')

    const currencies = Object.values (kraken.currencies).map (currency => ({
        code: currency.code,
        active: currency.active,
        status: currency.status,
    }))

    log.bright.yellow.noLocate ('Currencies:')
    log.yellow.noLocate (asTable (currencies))

}) ()
