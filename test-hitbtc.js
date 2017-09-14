"use strict";

let ccxt = require ('./ccxt.js')

let hitbtc = new ccxt.hitbtc ({
    "apiKey": "18339694544745d9357f9e7c0f7c41bb",
    "secret": "8340a60fb4e9fc73a169c26c7a7926f5",
    "verbose": true,
})

async function test () {
    await hitbtc.createLimitBuyOrder ("ETH/BTC", 0.141, 0.071, { 'timeInForce': 'FOK' })
}

test ()
