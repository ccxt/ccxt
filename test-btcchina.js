let ccxt = require ('./ccxt.js')

let btcchina = new ccxt.btcchina({'verbose':true})

async function test () {
    // console.log (await btcchina.fetchOrderBook ('BCH/CNY'))
    // console.log (await btcchina.fetchTicker ('BTC/CNY'))
    // console.log (await btcchina.fetchTicker ('BCH/CNY'))
    console.log (await btcchina.fetchTrades ('BTC/CNY'))
    // console.log (await btcchina.fetchTrades ('BCH/CNY'))
}

test ()
