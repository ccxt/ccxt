'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    const skippedExchanges = [
        'binance',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        log (exchange.id, 'found in ignored exchanges, skipping fetch all tickers...')
        return
    }

    if (exchange.has.fetchTickers) {

        // log ('fetching all tickers at once...')

        let tickers = undefined

        try {

            tickers = await exchange.fetchTickers ()
            log ('fetched all', Object.keys (tickers).length.toString ().green, 'tickers')

        } catch (e) {

            log ('failed to fetch all tickers, fetching multiple tickers at once...')
            tickers = await exchange.fetchTickers ([ symbol ])
            log ('fetched', Object.keys (tickers).length.toString ().green, 'tickers')
        }

    } else {

        log ('fetching all tickers at once not supported')
    }
}

