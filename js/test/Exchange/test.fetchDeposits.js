'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testTransaction = require ('./test.transaction.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, code) => {

    if (exchange.has.fetchDeposits) {

        const transactions = await exchange.fetchDeposits (code)

        console.log ('fetched', transactions.length, 'deposits, asserting each...')

        assert (transactions instanceof Array)

        const now = Date.now ()

        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i]
            testTransaction (exchange, transaction, code, now)
        }

    } else {

        console.log ('fetching deposits not supported')
    }
}
