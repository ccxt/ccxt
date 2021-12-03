'use strict'

module.exports = async (exchange) => {
    const skippedExchanges = []
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchTradingFees...')
        return
    }
    if (exchange.has.fetchTradingFees) {
        const method = 'fetchTradingFees'
        const fees = await exchange[method] ()
        console.log ({ 'maker': fees['maker'], 'taker': fees['taker'] })
        return fees
    } else {
        console.log ('fetching trading fees not supported')
    }
}
