'use strict'

const testTradingFee = require ("./test.tradingFee")

module.exports = async (exchange) => {
    const method = "fetchTradingFees"
    const skippedExchanges = []
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }
    if (exchange.has[method]) {
        const fees = await exchange[method] ()
        const symbols = Object.keys (fees)
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i]
            testTradingFee (symbol, fees[symbol])
        }
        return fees
    } else {
        console.log (method + '() is not supported')
    }
}
