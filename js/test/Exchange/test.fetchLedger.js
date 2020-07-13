'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , chai = require ('chai')
    , expect = chai.expect
    , assert = chai.assert
    , testLedgerItem = require ('./test.ledgerItem')

require ('ansicolor').nice

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, code) => {

    if (exchange.has.fetchLedger) {

        let items = await exchange.fetchLedger (code)

        assert (items instanceof Array)

        log ('fetched', items.length.toString ().green, 'ledger items')

        let now = Date.now ()

        for (let i = 0; i < items.length; i++) {
            testLedgerItem (exchange, items[i], code, now)
            if (i > 0) {
                assert (items[i].timestamp >= items[i - 1].timestamp)
            }
        }

        if (exchange.has.fetchLedgerItem) {
            let { id } = items.pop ()
            let item = await exchange.fetchLedgerItem (id)
            if (Array.isArray (item)) {
                item = item[0]
            }
            testLedgerItem (exchange, item, code, now)
        }

    } else {

        log ('fetching ledger items not supported')
    }
}