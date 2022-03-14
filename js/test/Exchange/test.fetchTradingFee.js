'use strict'

const testTradingFee = require ('./test.tradingFee.js')

module.exports = async (exchange, symbol) => {
    const skippedExchanges = []
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchTradingFee...')
        return
    }
    if (exchange.has.fetchTradingFee) {
        const fee = await exchange.fetchTradingFee ()
        testTradingFee (exchange, symbol, fee)
        return fee
    } else {
        console.log ('fetching trading fees not supported')
    }
}
