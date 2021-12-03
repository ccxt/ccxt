'use strict'

module.exports = async (exchange) => {
    const skippedExchanges = [
        'bibox', // fetchFundingFees should be rewritten to fetchFundingFee
    ]
    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchFundingFees...')
        return
    }
    if (exchange.has.fetchFundingFees) {
        const method = 'fetchFundingFees'
        const fees = await exchange[method] ()
        console.log (fees)
        return fees
    } else {
        console.log ('fetching funding fees not supported')
    }
}
