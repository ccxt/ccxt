let ccxt = require ('./ccxt.js')

let chbtc = new ccxt.chbtc({'verbose':true})

async function test () {
    console.log (await chbtc.fetchOrderBook ('EOS/CNY'))
    // console.log (await chbtc.fetchTicker ('BTC/CNY'))
    // console.log (await chbtc.fetchTicker ('BCH/CNY'))
    // console.log (await chbtc.fetchTrades ('BTC/CNY'))
    // console.log (await chbtc.fetchTrades ('BCH/CNY'))
}

test ()
