'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchFundingRateHistory'

    const format = {
        'symbol': 'BTC/USDT:USDT',
        'info': {}, // Or []
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'fundingRate': 0.0006,
    }

    if (exchange.has[method]) {

        const market = exchange.market (symbol);
        if (market.spot) {
            console.log (method + '() is not supported for spot markets');
            return;
        }
    
        const fundingRates = await exchange[method] (symbol)
        console.log ('fetched all', fundingRates.length, 'funding rates')

        for (let i = 0; i < fundingRates.length; i++) {
            const fundingRate = fundingRates[i]
            const keys = Object.keys (format)
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                assert (key in fundingRate)
            }
            assert (typeof fundingRate['fundingRate'] === 'number')
            assert (fundingRate['timestamp'] >= 1199145600000) // 2008-01-01 00:00:00
        }
        return fundingRates

    } else {
        console.log (method + '() is not supported')
    }
}
