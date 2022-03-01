'use strict'

const testTradingFee = require("./test.tradingFee")

module.exports = async (exchange) => {
    const skippedExchanges = []
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchTradingFees...')
        return
    }
    if (exchange.has.fetchTradingFees) {
        const method = 'fetchTradingFees'
        const fees = await exchange[method] ()
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            assert (fees[symbol])
            assert (testTradingFee(fees[symbol]))
        }
        return fees
    } else {
        console.log ('fetching trading fees not supported')
    }
}
