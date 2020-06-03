"use strict"

const asTable = require ('as-table')
const ansi      = require ('ansicolor').nice
const log = require('ololog').noLocate
const ccxt = require('../../ccxt.js')
const exchange = new ccxt.coinone({
    "enableRateLimit": true,
    'verbose': process.argv.includes('-v'),
})

let printTickersAsTable = function (exchange, tickers) {
    log (exchange.id.green, exchange.iso8601 (exchange.milliseconds ()))
    log ('Fetched', Object.values (tickers).length.toString ().green, 'tickers:')
    log (asTable.configure ({ delimiter: ' | '.dim, right: true }) (
            ccxt.sortBy (Object.values (tickers), 'symbol', false)
                                .map (ticker => ({
                                    timestamp: ticker['timestamp'],
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

async function fetchAllAndPrint() {
    const tickers = await exchange.fetchTickers()
    log ('---------------------------------------- (fetchAll) ----------------------------------------')
    printTickersAsTable(exchange, tickers)
}

async function fetchOneByOneAndPrint() {
    const markets = await exchange.loadMarkets()
    const symbols = Object.keys(markets)
    const tickers = []

    log ('---------------------------------------- (fetchEachByEach) ----------------------------------------')

    for (let i = 0; i < symbols.length; i++) {
        const ticker = await exchange.fetchTicker(symbols[i])
        tickers.push(ticker)
        log(`${i+1} / ${symbols.length}`)
        log('\u001b[1A'.repeat(2))  // cursor up
    }
    
    printTickersAsTable(exchange, tickers)
}

;(async () => {
    await fetchAllAndPrint()
    log('\n')
    await fetchOneByOneAndPrint()
}) ()
