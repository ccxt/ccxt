'use strict'

// ----------------------------------------------------------------------------

const testBorrowRate = require ('./test.borrowRate.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const method = 'fetchBorrowRates'

    if (exchange.has[method]) {

        const borrowRates = await exchange[method] ()
        console.log ('fetched all', Object.keys (borrowRates).length, 'borrow rates')

        const values = Object.values (borrowRates)
        for (let i = 0; i < values.length; i++) {
            const borrowRate = values[i]
            testBorrowRate (exchange, borrowRate, method)
        }
        return borrowRates

    } else {

        console.log (method + '() fetching all borrow rates at once is not supported')
    }
}
