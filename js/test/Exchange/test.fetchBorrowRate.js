'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testBorrowRate = require ('./test.borrowRate.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, code) => {

    const method = 'fetchBorrowRate'

    if (exchange.has[method]) {

        let borrowRate = undefined;
        try {
            borrowRate = await exchange[method] (code)
        } catch (ex) {
            const message = ex.message;
            // for exchanges, atm, we don't have the correct lists of currencies, which currency is borrowable and which not. So, because of our predetermined list of test-currencies, some of them might not be borrowable, and thus throws exception. However, we shouldn't break tests for that specific exceptions, and skip those occasions.
            if (message.indexOf ('could not find the borrow rate for currency code') < 0) {
                throw new Error (message);
            }
            // console.log (method + '() : ' + code + ' is not borrowable for this exchange. Skipping the test method.');
            return;
        }
        
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
