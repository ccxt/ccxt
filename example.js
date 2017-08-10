let ccxt = require ('ccxt')

let exchange = new ccxt.bitfinex ({
    apiKey: '4FlEDtxDl35gdEiobnfZ72vJeZteE4Bb7JdvqzjIjHq', 
    secret: 'D4DXM8DZdHuAq9YptUsb42aWT1XBnGlIJgLi8a7tzFH',
})

await exchange.loadMarkets ()
console.log (exchange.symbols)

let symbol = exchange.symbols[0]
console.log (symbol)

let ticker = await exchange.fetchTicker (symbol)
console.log (ticker)

let orderbook = await exchange.fetchOrderBook (symbol)
console.log (orderbook)

let balance = await exchange.fetchBalance ()
console.log (balance)