'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testBorrowRate = require ('./test.borrowRate.js')

// ----------------------------------------------------------------------------

const printBorrowRateOneLiner = (borrowRate, method, code) => {

    log (code.toString ().green,
        method,
        borrowRate['datetime'],
        'rate: '       + (borrowRate['rate']),
        'period: '     + (borrowRate['period']))
}

// ----------------------------------------------------------------------------

module.exports = async (exchange, code) => {

    const method = 'fetchBorrowRate'

    if (exchange.has[method]) {

        // log (symbol.green, 'fetching borrowRate...')

        const borrowRate = await exchange.fetchBorrowRate (code)

        testBorrowRate (exchange, borrowRate, method, code)

        printBorrowRateOneLiner (borrowRate, method, code)

        if (code) {
            assert (borrowRate['currency'] === code)
        }

        return borrowRate

    } else {

        log (code.green, 'fetchBorrowRate () not supported')
    }
}
