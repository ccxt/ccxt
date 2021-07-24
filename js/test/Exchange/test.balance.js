'use strict'

// ----------------------------------------------------------------------------

const log    = require ('ololog')
const assert = require ('assert')

// ----------------------------------------------------------------------------

function testBalance (exchange, balance, method) {

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
            if (typeof exchange.number('0') === 'number') {
                assert (total === free + used, 'free and used do not sum to total ' + exchange.id);
            } else if (typeof exchange.number('0') === 'string') {
                assert (Precise.stringEquals (total, Precise.stringAdd (free, used)), 'free and used do not sum to total ' + exchange.id);
            } else {
                assert (false, 'typeof exchange.number(0) is unknown');
            }
        }
    }

    let result = []
    for (let i = 0; i < currencies.length; i++) {
        if ((currencies[i] in balance) && (balance[currencies[i]]['total'] !== undefined)) {
            result.push (currencies[i] + ': ' + balance[currencies[i]]['total']);
        }
    }

    if (result.length > 0) {
        if (exchange.currencies.length > result.length) {
            result = result.join (', ') + ' + more...';
        } else {
            result = result.join (', ');
        }
    } else {
        result = 'zero balance';
    }
    log (result);
}

module.exports = testBalance;
