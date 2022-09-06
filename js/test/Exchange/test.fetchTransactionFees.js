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
        const length = Object.keys (fees['withdraw']).length
        console.log ('fetched items:', length)
        return fees
    } else {
        console.log (method + '() is not supported')
    }
}
