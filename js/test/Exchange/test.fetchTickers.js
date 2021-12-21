'use strict'

// ----------------------------------------------------------------------------

const testTicker = require ('./test.ticker.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const skippedExchanges = [
        'binance',
        'digifinex',
        'currencycom',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetch all tickers...')
        return
    }

    if (exchange.has.fetchTickers) {

        // log ('fetching all tickers at once...')

        const method = 'fetchTickers'
        let tickers = undefined

        try {

            tickers = await exchange[method] ()
            console.log ('fetched all', Object.keys (tickers).length, 'tickers')

        } catch (e) {

            console.log ('failed to fetch all tickers, fetching multiple tickers at once...')
            tickers = await exchange[method] ([ symbol ])
            console.log ('fetched', Object.keys (tickers).length, 'tickers')
        }

        Object.values (tickers).forEach ((ticker) => testTicker (exchange, ticker, method, symbol))
        return tickers

    } else {

        console.log ('fetching all tickers at once not supported')
    }
}

