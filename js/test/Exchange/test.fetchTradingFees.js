'use strict'

const testTradingFee = require("./test.tradingFee")

module.exports = async (exchange) => {
    const skippedExchanges = []
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchTradingFees...')
        return;
    }
    if (exchange.has.fetchTradingFees) {
        const fees = await exchange.fetchTradingFees ()
        const symbols = Object.keys (fees)
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i]
            testTradingFee (exchange, symbol, fees[symbol])
        }
        return fees
    } else {
        console.log ('fetching trading fees not supported')
    }
}
