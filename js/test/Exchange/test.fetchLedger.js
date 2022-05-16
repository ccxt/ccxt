'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testLedgerItem = require ('./test.ledgerItem')

// ----------------------------------------------------------------------------

module.exports = async (exchange, code) => {

    let method = 'fetchLedger'

    if (exchange.has[method]) {

        const items = await exchange[method] (code)

        assert (items instanceof Array)

        console.log ('Fetched', items.length, 'ledger items')

        const now = Date.now ()

        for (let i = 0; i < items.length; i++) {
            testLedgerItem (exchange, items[i], code, now)
            if (i > 0) {
                assert (items[i].timestamp >= items[i - 1].timestamp)
            }
        }

        method = 'fetchLedgerItem';

        if (exchange.has[method]) {
            const { id } = items.pop ()
            let item = await exchange[method] (id)
            if (Array.isArray (item)) {
                item = item[0]
            }
            testLedgerItem (exchange, item, code, now)
        }

    } else {

        console.log (method + '() is not supported')
    }
}
