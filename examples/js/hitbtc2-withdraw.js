"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice

const getPositiveAccounts = function (balance) {
    const result = {}
    Object.keys (balance)
        .filter (currency => balance[currency] && (balance[currency] > 0))
        .forEach (currency => {
            result[currency] = balance[currency]
        })
    return result
}

;(async () => {

    // instantiate the exchange
    let exchange = new ccxt.hitbtc2  ({
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_SECRET",
    })

    try {

        let tradingBalance = await exchange.fetchBalance ()
        let accountBalance = await exchange.fetchBalance ({ type: 'account' })

        log.cyan    ('Trading balance:', getPositiveAccounts (tradingBalance.total))
        log.magenta ('Account balance:', getPositiveAccounts (accountBalance.total))

        // withdraw
        let withdraw = await exchange.withdraw ('ETH', 0.01, '0x811DCfeb6dC0b9ed825808B6B060Ca469b83fB81')

        // output the result
        log (exchange.name.green, 'withdraw', withdraw)

    } catch (e) {

        if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
            log.bright.yellow ('[DDoS Protection] ' + e.message)
        } else if (e instanceof ccxt.RequestTimeout) {
            log.bright.yellow ('[Request Timeout] ' + e.message)
        } else if (e instanceof ccxt.AuthenticationError) {
            log.bright.yellow ('[Authentication Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeNotAvailable) {
            log.bright.yellow ('[Exchange Not Available Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeError) {
            log.bright.yellow ('[Exchange Error] ' + e.message)
        } else if (e instanceof ccxt.NetworkError) {
            log.bright.yellow ('[Network Error] ' + e.message)
        } else {
            throw e
        }
    }

}) ()