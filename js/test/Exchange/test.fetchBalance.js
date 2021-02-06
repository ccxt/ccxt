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

    exchange.options.set ('numbersAsStrings', 1)
    
    const responseNaS = await exchange.fetchBalance ()

    // This will fail because you can't do math on strings.
    testBalance (exchange, response)
    
    exchange.options.delete ('numbersAsStrings')
    
    return response
}
