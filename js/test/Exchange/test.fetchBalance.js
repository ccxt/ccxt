'use strict'

// ----------------------------------------------------------------------------

const testBalance = require ('./test.balance.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    if (!(exchange.has.fetchBalance)) {
        console.log (exchange.id, ' does not have fetchBalance')
        return
    }

    console.log ('fetching balance...')

    const response = await exchange.fetchBalance ()

    testBalance (exchange, response)

    return response
}
