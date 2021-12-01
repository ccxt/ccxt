'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testTransaction = require ('./test.transaction.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, code) => {

    if (exchange.has.fetchTransactions) {

        const transactions = await exchange.fetchTransactions (code)

        console.log ('fetched', transactions.length, 'transactions, asserting each...')

        assert (transactions instanceof Array)

        const now = Date.now ()

        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i]
            testTransaction (exchange, transaction, code, now)
        }

    } else {

        console.log ('fetching transactions not supported')
    }
}
