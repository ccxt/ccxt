"use strict"

const asTable = require ('as-table')
const ansi      = require ('ansicolor').nice
const log = require('ololog').noLocate
const ccxt = require('../../ccxt.js')
const exchange = new ccxt.coinone({
    'verbose': process.argv.includes('-v'),
})

async function main() {
    const tickers = await exchange.fetchTickers()
    log(tickers)
    log ('--------------------------------------------------------')
    log (exchange.id.green, exchange.iso8601 (exchange.milliseconds ()))
    log ('Fetched', Object.values (tickers).length.toString ().green, 'tickers:')
    log (asTable.configure ({ delimiter: ' | '.dim, right: true }) (
            ccxt.sortBy (Object.values (tickers), 'symbol', false)
                                .map (ticker => ({
                                    symbol: ticker['symbol'],
                                    high: ticker['high'].toFixed (4),
                                    low: ticker['low'].toFixed (4),
                                    prevClose: ticker['previousClose'].toFixed (4),
                                    price: ticker['close'].toFixed (4),
                                    baseVolume: ticker['baseVolume'],
                                    change: ticker['change'].toFixed(4),
                                    percentage: ticker['percentage'].toFixed(2),
                                    average: ticker['average'].toFixed(4),
                                }))))
}

main()