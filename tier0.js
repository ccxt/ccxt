"use strict";

const ccxt = require ('./ccxt.js')
const fs = require ('fs')
const asTable = require ('as-table')

// const keys = JSON.parse (fs.readFileSync ('./keys.json', 'utf8'))

const keys = {
    "binance":       { "apiKey": "XBVtcbAfK7119GAXaXra47lBXA8sfcANKNu2sja7VbC1PiCZ0OUms5HnGRWvJLlo", "secret": "ZESxhBWQqO9AsqW7spC7251ibR35ERIZNxZ3PoNooRcT55DFzGphsYYBRevTDci6" },
    "bittrex":       { "apiKey": "c5af1d0ceeaa4729ad87da1b05d9dfc3", "secret": "d055d8e47fdf4c3bbd0ec6c289ea8ffd" },
    "cryptopia":     { "apiKey": "1b1a398d7d4c415287a3ca04107257aa", "secret": "ODXmrj4JWDxVo2kaGhJ8m/BmwEcDUNmSBIf2bQtGvtA=" },
    "kraken":        { "apiKey": "+Q+/gSeFJKavyTu7wQ4IZKI56eZXl4bOXX9Lv1IQ44NvctNpYlcav29b", "secret": "NpyX8ffMfrMiD2iWuXJ3ntMiCdbKV0zgn8HgSTEFQW0ZEaxiHim7w1IF7G/KSAnfqbr8oej7i+ttO6lGiJSjhg==" },
    "liqui":         { "apiKey": "3CCPNOH2-7W0SYD8F-UNEVV304-NDU3MVJE-Z43H2I05", "secret": "9c6aad97f1e0b97b58fc3a69ac88b57483215f9b4037c668151d946871e177f4" },
    "poloniex":      { "apiKey": "286TRWWF-NY11PUJ5-TYLN778R-TT30T8YL", "secret": "4750d46b5496f0ec4e17bd80a3a93eb6f7d2f72c6deacf4f0adea6b9f16ed5025cc50b6d42f3cc29b9ad0b55c4779fa60fd19295157578fc18e7080260a8af6c" },
}


const binance   = new ccxt['binance']   (keys['binance'])
const bittrex   = new ccxt['bittrex']   (keys['bittrex'])
const cryptopia = new ccxt['cryptopia'] (keys['cryptopia'])
const kraken    = new ccxt['kraken']    (keys['kraken'])
const liqui     = new ccxt['liqui']     (keys['liqui'])
const poloniex  = new ccxt['poloniex']  (keys['poloniex'])

let exchanges = {
    // binance,
    // bittrex,
    // cryptopia,
    kraken,
    // liqui,
    // poloniex,
}

async function printExchangeOrders (exchange, params = {}) {

    try {

        console.log ('-------------------------------------------------------')

        console.log (exchange.id)
        let balance = await exchange.fetchBalance ()
        console.log (balance)
        let orders = await exchange.fetchClosedOrders (params)
        // console.log (orders)
        let order = await exchange.fetchOrder (orders[0]['id'])
        console.log (order)
        process.exit ()
        console.log (exchange.id, '\n' + asTable.configure ({ delimiter: ' | ' }) (orders))

    } catch (e) {

        console.log ('Error: ', e)
        process.exit ()

    }
}

async function test () {

    for (let id in exchanges) {
        await printExchangeOrders (exchanges[id], { 'symbol': 'BTC/USDT' })    
    }
    
    // printExchangeOrders (bittrex)
    // printExchangeOrders (cryptopia, { 'symbol': 'BTC/USDT' })
    
    process.exit ()
}

test ()
