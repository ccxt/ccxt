'use strict'

// ----------------------------------------------------------------------------

const log    = require ('ololog')
    , chai   = require ('chai')
    , assert = chai.assert

// ----------------------------------------------------------------------------

module.exports = (exchange, balance, method) => {

    const currencies = [
        'USD',
        'USDT',
        'CNY',
        'EUR',
        'BTC',
        'ETH',
        'JPY',
        'LTC',
        'DASH',
        'DOGE',
        'UAH',
        'RUB',
        'XRP',
    ]

    // log.yellow (balance)

    assert (typeof balance['total'] === 'object')
    assert (typeof balance['free'] === 'object')
    assert (typeof balance['used'] === 'object')

    const codes = Object.keys (balance['total'])
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i]
        const total = balance['total'][code]
        const free = balance['free'][code]
        const used = balance['used'][code]
        if ((total !== undefined) && (free !== undefined) && (used !== undefined)) {
            assert (total === free + used, 'free and used do not sum to total ' + exchange.id)
        }
    }

    let result = currencies
        .filter ((currency) => (currency in balance) &&
            (balance[currency]['total'] !== undefined))

    if (result.length > 0) {
        result = result.map ((currency) => currency + ': ' + balance[currency]['total'])
        if (exchange.currencies.length > result.length) {
            result = result.join (', ') + ' + more...'
        } else {
            result = result.join (', ')
        }

    } else {

        result = 'zero balance'
    }

    log (result)

}
