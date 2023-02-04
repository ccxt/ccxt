'use strict'

module.exports = async (exchange) => {
    const method = 'fetchTransactionFees'
    const skippedExchanges = [
        'bibox', // fetchTransactionFees should be rewritten to fetchTransactionFee
        'exmo', // todo: fetchTransactionFees should be rewritten, it's a bit messy atm for quick fix
        'bkex', // todo: temporary skip
        'stex', // todo: temporary skip
        'crex24', // todo: temporary skip
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
