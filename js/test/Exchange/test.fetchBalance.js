'use strict'

// ----------------------------------------------------------------------------

const log = require ('ololog')
    , testBalance = require ('./test.balance.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    if (!(exchange.has.fetchBalance)) {
        log (exchange.id.green, ' does not have fetchBalance')
        return
    }

    log ('fetching balance...')

    const response = await exchange.fetchBalance ()

    testBalance (exchange, response)

    return response
}
