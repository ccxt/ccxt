'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const format = {
        'currency': 'USDT',
        'info': {}, // Or []
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'rate': 0.0006,
    }

    if (exchange.has.fetchFundingRateHistory) {

        const method = 'fetchFundingRateHistory'
        const fundingRates = await exchange[method] ()
        console.log ('fetched all', fundingRates.length, 'funding rates')

        for (let i = 0; i < fundingRates.length; i++) {
            const fundingRate = fundingRates[i]
            const keys = Object.keys (format)
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                assert (key in fundingRate)
            }
            assert (fundingRate['rate'] >= 0)
            assert (fundingRate['timestamp'] >= 1199145600000) // 2008-01-01 00:00:00
        }
        return fundingRates

    } else {
        console.log ('fetchFundingRateHistory not supported')
    }
}
