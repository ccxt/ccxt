'use strict'

module.exports = async (exchange) => {
    const skippedExchanges = [
        'bibox', // fetchTransactionFees should be rewritten to fetchTransactionFee
    ]
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchTransactionFees...')
        return
    }
    if (exchange.has.fetchTransactionFees) {
        const method = 'fetchTransactionFees'
        const fees = await exchange[method] ()
        console.log (fees)
        return fees
    } else {
        console.log ('fetching funding fees not supported')
    }
}
