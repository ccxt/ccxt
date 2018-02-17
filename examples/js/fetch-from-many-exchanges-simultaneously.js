'use strict'

const symbol = 'ETH/BTC'
const exchanges = [ 'gdax', 'hitbtc2', 'poloniex' ]

;(async () => {

    const result = await Promise.all (exchanges.map (id => {

        const exchange = new ccxt[id] ({ 'enableRateLimit': true })
        const ticker = exchange.fetchTicker (symbol)
        return exchange.extend (ticker, { 'exchange': id })

    }))

    log ('-------------------------------------------------------------------')
    log (result);
})