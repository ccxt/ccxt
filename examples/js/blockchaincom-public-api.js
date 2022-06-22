"use strict";
const ccxt = require ('../../ccxt.js')
    , exchange = new ccxt.blockchaincom ()
    , symbol = 'BTC/USD'

;(async function main () {

    // Markets data
    const markets = await exchange.fetchMarkets ()
    console.log('Total number of markets: ', Object.keys(markets).length);

    // L2 Order Book
    const l2 = await exchange.fetchL2OrderBook (symbol)
    console.log ("L2" , l2.symbol, l2.asks[0], l2.bids[0])

    // L3 Order Book
    const l3 = await exchange.fetchL3OrderBook (symbol)
    console.log ("L3" , l3.symbol, l3.asks[0], l3.bids[0])

    // Order book data
    const orderbook = await exchange.fetchOrderBook (symbol)
    console.log ('Order book ', symbol, orderbook.asks[0], orderbook.bids[0])

    // Ticker
    const ticker = await exchange.fetchTicker (symbol)
    console.log ("Ticker", ticker.symbol, ticker.info)

    // Ticker
    const tickers = await exchange.fetchTickers ()
    console.log ("Ticker", tickers[symbol])

}) ()