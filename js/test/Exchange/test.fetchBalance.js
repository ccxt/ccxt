

// ----------------------------------------------------------------------------

import testBalance from './test.balance.js'

// ----------------------------------------------------------------------------

export default async (exchange) => {

    if (!(exchange.has.fetchBalance)) {
        console.log (exchange.id, ' does not have fetchBalance')
        return
    }

    console.log ('fetching balance...')

    const response = await exchange.fetchBalance ()

    testBalance (exchange, response)

    return response
}
