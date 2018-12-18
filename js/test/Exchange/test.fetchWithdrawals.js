'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert
    , testTransaction = require ('./test.transaction.js')

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, code) => {

    if (exchange.has.fetchWithdrawals) {

        // log ('fetching deposits...')

        let transactions = await exchange.fetchWithdrawals (code)

        log ('fetched', transactions.length.toString ().green, 'withdrawals, asserting each...')

        assert (transactions instanceof Array)

        let now = Date.now ()

        for (let i = 0; i < transactions.length; i++) {
            let transaction = transactions[i]
            testTransaction (exchange, transaction, code, now)
        }

        // log (asTable (transactions))

    } else {

        log ('fetching withdrawals not supported')
    }
}