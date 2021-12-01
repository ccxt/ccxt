'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testBorrowRate = require ('./test.borrowRate.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange) => {

    if (exchange.has.fetchBorrowRates) {

        // log ('fetching all BorrowRates at once...')

        const method = 'fetchBorrowRates'
        let borrowRates = undefined

        try {

            borrowRates = await exchange[method] ()
            log ('fetched all', Object.keys (borrowRates).length.toString ().green, 'borrow rates')

        } catch (e) {

            log ('failed to fetch all borrow rates, fetching multiple borrow rates at once...')
            borrowRates = await exchange[method] ()
            log ('fetched', Object.keys (borrowRates).length.toString ().green, 'borrow rates')
        }

        Object.values (borrowRates).forEach ((borrowRate) => testBorrowRate (exchange, borrowRate, method))
        return borrowRates

    } else {

        log ('fetching all borrow rates at once not supported')
    }
}

