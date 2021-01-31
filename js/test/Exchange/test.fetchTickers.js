'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testTicker = require ('./test.ticker.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    const skippedExchanges = [
        'binance',
        'digifinex',
        'currencycom',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping fetch all tickers...')
        return
    }

    if (exchange.has.fetchTickers) {

        // log ('fetching all tickers at once...')

        const method = 'fetchTickers'
        let tickers = undefined

        try {

            tickers = await exchange[method] ()
            log ('fetched all', Object.keys (tickers).length.toString ().green, 'tickers')

        } catch (e) {

            log ('failed to fetch all tickers, fetching multiple tickers at once...')
            tickers = await exchange[method] ([ symbol ])
            log ('fetched', Object.keys (tickers).length.toString ().green, 'tickers')
        }

        Object.values (tickers).forEach ((ticker) => testTicker (exchange, ticker, method, symbol))
        return tickers

    } else {

        log ('fetching all tickers at once not supported')
    }
}

