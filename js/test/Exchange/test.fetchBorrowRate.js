'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testBorrowRate = require ('./test.borrowRate.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, code) => {

    const method = 'fetchBorrowRate'

    if (exchange.has[method]) {

        const borrowRate = await exchange[method] (code)

        testBorrowRate (exchange, borrowRate, method, code)

        console.log (code, method, borrowRate['datetime'], 'rate:', borrowRate['rate'], 'period:', borrowRate['period'])

        if (code) {
            assert (borrowRate['currency'] === code)
        }

        return borrowRate

    } else {

        console.log (code, method + '() is not supported')
    }
}
