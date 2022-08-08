'use strict'

module.exports = async (exchange) => {
    const method = 'fetchTransactionFees'
    const skippedExchanges = [
        'bibox', // fetchTransactionFees should be rewritten to fetchTransactionFee
    ]
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }
    if (exchange.has[method]) {
        const fees = await exchange[method] ()
        console.log (fees)
        return fees
    } else {
        console.log (method + '() is not supported')
    }
}
