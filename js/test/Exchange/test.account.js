'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = (exchange, account, method) => {

    const format = {
        'info': {},
        'code': 'BTC',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    }

    const types = [ 'funding', 'main', 'spot', 'margin', 'future', 'swap', 'lending', 'subaccount' ]

    const keys = Object.keys (format)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        assert (key in account)
    }

    assert (types.includes (account['type']))

    return account
}
