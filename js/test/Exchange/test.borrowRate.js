'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = (exchange, borrowRate, method, code) => {

    const format = {
        'currency':      'USDT',
        'info':          {},    // Or []
        'timestamp':     1638230400000,
        'datetime':      '2021-11-30T00:00:00.000Z',
        'rate':          0.0006,    // Interest rate
        'period':        86400000,  // Amount of time the interest rate is based on in milliseconds
    }

    expect (borrowRate).to.have.all.keys (format)

    const keys = [ 'currency', 'info', 'timestamp', 'datetime', 'rate', 'period' ]
    log (borrowRate['datetime'], exchange.id, method, borrowRate['currency'], borrowRate['rate'])
    keys.forEach ((key) => assert (key in borrowRate))

    const { currency, info, timestamp, datetime, rate, period } = borrowRate

    assert (borrowRate['period'] === 86400000 || borrowRate['period'] === 3600000)   // Milliseconds in an hour or a day
    assert (borrowRate['rate'] > 0)

    return borrowRate
}
