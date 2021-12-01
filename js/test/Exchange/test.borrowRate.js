'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = (exchange, borrowRate, method, code) => {

    const format = {
        'currency': 'USDT',
        'info': {}, // Or []
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'rate': 0.0006, // Interest rate
        'period': 86400000,  // Amount of time the interest rate is based on in milliseconds
    }

    const keys = Object.keys (format)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        assert (key in borrowRate)
    }

    console.log (borrowRate['datetime'], exchange.id, method, borrowRate['currency'], borrowRate['rate'])

    assert (borrowRate['period'] === 86400000 || borrowRate['period'] === 3600000) // Milliseconds in an hour or a day
    assert (borrowRate['rate'] > 0)

    return borrowRate
}
