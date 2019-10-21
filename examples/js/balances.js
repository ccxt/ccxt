"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

;(async () => {

    // instantiate the exchange
    let coinbasepro = new ccxt.coinbasepro  ({ // ... or new ccxt.coinbasepro ()
        'apiKey': '92560ffae9b8a01d012726c698bcb2f1', // standard
        'secret': '9aHjPmW+EtRRKN/OiZGjXh8OxyThnDL4mMDre4Ghvn8wjMniAr5jdEZJLN/knW6FHeQyiz3dPIL5ytnF0Y6Xwg==',
        'password': '6kszf4aci8r', // Coinbase Pro requires a password!
    })

    // use the testnet for Coinbase Pro
    coinbasepro.urls['api'] = coinbasepro.urls['test']

    let hitbtc = new ccxt.hitbtc ({
        'apiKey': '18339694544745d9357f9e7c0f7c41bb',
        'secret': '8340a60fb4e9fc73a169c26c7a7926f5',
    })

    try {

        // fetch account balance from the exchange
        let coinbaseproBalance = await coinbasepro.fetchBalance ()

        // output the result
        log (coinbasepro.name.green, 'balance', coinbaseproBalance)

        // fetch another
        let hitbtcBalance = await hitbtc.fetchBalance ()

        // output it
        log (hitbtc.name.green, 'balance', hitbtcBalance)

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
            throw e;
        }
    }

}) ()