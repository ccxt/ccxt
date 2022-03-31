'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')

// ----------------------------------------------------------------------------

module.exports = async (exchange, code, symbol) => {

    const method = 'fetchBorrowInterest'

    if (exchange.has[method]) {

        const format = {
            'account': 'BTC/USDT',
            'currency': 'USDT',
            'interest': '0.1444',
            'interestRate': 0.0006,
            'amountBorrowed': 30.0,
            'timestamp': 1638230400000,
            'datetime': '2021-11-30T00:00:00.000Z',
            'info': {},
        }

        const interest = await exchange.fetchBorrowInterest (code, symbol)

        console.log (code, method, interest['datetime'], 'symbol: ', symbol,  'interest: ', interest['interest'], 'interestRate: ', interest['interestRate'], 'amountBorrowed: ', interest['amountBorrowed'])

        if (code) {
            assert (interest['currency'] === code)
        }
        assert (interest['account'] === symbol || interest['account'] === undefined)

        const keys = Object.keys (format)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            assert (key in interest)
        }

        if (interest['amountBorrowed'] !== undefined) {
            assert (interest['amountBorrowed'] >= 0)
        }
        if (interest['interestRate'] !== undefined) {
            assert (interest['interestRate'] > 0)
        }
        if (interest['interest'] !== undefined) {
            assert (interest['interest'] >= 0)
        }
        if (interest['timestamp'] !== undefined) {
            assert (interest['timestamp'] > 1640933203000)
        }

        return interest

    } else {
        console.log (code, 'fetchBorrowInterest () not supported')
    }
}
