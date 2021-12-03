'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testLedgerItem = require ('./test.ledgerItem')

// ----------------------------------------------------------------------------

module.exports = async (exchange, code) => {

    if (exchange.has.fetchLedger) {

        const items = await exchange.fetchLedger (code)

        assert (items instanceof Array)

        console.log ('Fetched', items.length, 'ledger items')

        const now = Date.now ()

        for (let i = 0; i < items.length; i++) {
            testLedgerItem (exchange, items[i], code, now)
            if (i > 0) {
                assert (items[i].timestamp >= items[i - 1].timestamp)
            }
        }

        if (exchange.has.fetchLedgerItem) {
            const { id } = items.pop ()
            let item = await exchange.fetchLedgerItem (id)
            if (Array.isArray (item)) {
                item = item[0]
            }
            testLedgerItem (exchange, item, code, now)
        }

    } else {

        console.log ('Fetching ledger items not supported')
    }
}
