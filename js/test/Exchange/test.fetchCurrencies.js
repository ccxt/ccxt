'use strict'

// ----------------------------------------------------------------------------

const testCurrency = require ('./test.currency.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const skippedExchanges = []

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchCurrencies...')
        return
    }

    if (exchange.has.fetchCurrencies === true || exchange.has.fetchCurrencies === 'emulated') {

        const method = 'fetchCurrencies'
        const currencies = await exchange[method] ()
        if (currencies !== undefined) {
            const values = Object.values (currencies)
            for (let i = 0; i < values.length; i++) {
                const currency = values[i]
                testCurrency (exchange, currency, method)
            }
        }
        return currencies

    } else {

        console.log ('fetching currencies not supported')
    }
}
