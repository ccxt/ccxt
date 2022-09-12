'use strict'

// ----------------------------------------------------------------------------

const testAccount = require ('./test.account.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange) => {

    const method = 'fetchAccounts'

    if (!(exchange.has[method])) {
        console.log (exchange.id, method + '() is not supported')
        return
    }

    console.log ('fetching accounts...')

    const accounts = await exchange[method] ()
    
    Object.values (accounts).forEach ((account) => testAccount (exchange, account))

    return accounts
}
