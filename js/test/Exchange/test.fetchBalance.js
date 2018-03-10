'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    if (!(exchange.has.fetchBalance)) {
        log (exchange.id.green, ' does not have fetchBalance')
        return
    }

    log ('fetching balance...')

    let balance = await exchange.fetchBalance ()

    let currencies = [
        'USD',
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

    if ('info' in balance) {

        let result = currencies
            .filter (currency => (currency in balance) &&
                (typeof balance[currency]['total'] !== 'undefined'))

        if (result.length > 0) {
            result = result.map (currency => currency + ': ' + balance[currency]['total'])
            if (exchange.currencies.length > result.length)
                result = result.join (', ') + ' + more...'
            else
                result = result.join (', ')

        } else {

            result = 'zero balance'
        }

        log (result)

    } else {

        log (exchange.omit (balance, 'info'))
    }

    return balance
}