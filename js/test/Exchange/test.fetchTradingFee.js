'use strict'

const testTradingFee = require ('./test.tradingFee.js')

module.exports = async (exchange, symbol) => {
    const skippedExchanges = []
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchTradingFees...')
        return
    }
    if (exchange.has.fetchTradingFee) {
        const method = 'fetchTradingFees'
        const fee = await exchange[method] ()
        return testTradingFee(exchange, symbol, fee)
    } else {
        console.log ('fetching trading fees not supported')
    }
}
