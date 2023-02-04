'use strict'

// ----------------------------------------------------------------------------

const testBalance = require ('./test.balance.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const method = 'fetchBalance'

    if (!(exchange.has[method])) {
        console.log (exchange.id, method + '() is not supported')
        return
    }

    console.log ('fetching balance...')

    const response = await exchange[method] ()

    testBalance (exchange, response)

    console.log ('fetched balance items:', Object.keys(response).length)

    return response
}
