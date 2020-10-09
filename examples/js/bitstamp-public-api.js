"use strict";
const ccxt = require ('../../ccxt.js')
    , log  = require ('ololog')
    , asTable = require ('as-table').configure ({ delimiter: ' | ' })
    , id = 'bitstamp'
    , exchange = new ccxt[id] ({ enableRateLimit: true })
    , symbol = 'BTC/USD'

;(async function main () {

    // Markets data
    const markets = await exchange.fetchMarkets ()
    console.log('Total number of markets: ', Object.keys(markets).length);

    // Currencies
    const currencies = await exchange.fetchCurrencies ()
    console.log('Currencies: ', JSON.stringify(currencies));

    // Order book data
    const orderbook = await exchange.fetchOrderBook (symbol)
    console.log ('Order book ', symbol, orderbook.asks[0], orderbook.bids[0])
    
    // Ticker
    const ticker = await exchange.fetchTicker (symbol)
    console.log ('Ticker ', symbol, " bid ", ticker.bid, " ask ", ticker.ask)

    // Trades
    const response = await exchange.fetchTrades (symbol, null, 10)
    log (asTable (response))

    // OHLC data
    const candles = await exchange.fetchOHLCV (symbol, '1m', undefined, 10);
    const first = candles[0]
    const last = candles[candles.length - 1]
    console.log (
        'Fetched', candles.length, symbol, 'candles',
        'from', exchange.iso8601 (first[0]),
        'to', exchange.iso8601 (last[0])
    )

}) ()