let ccxt = require ('ccxt')

let exchange = new ccxt.bitfinex ({
    apiKey: '5A1VikyEtDpmFkrzX4e52LsaVgCxXyMnY9JElqvNMxo', 
    secret: 'Rgxxw1BGnq6NLTLq1hn0oQ5FBDRLYFFVRzyEKYbz1io',
})

await exchange.loadProducts ()
console.log (exchange.symbols)

let symbol = exchange.symbols[0]
console.log (symbol)

let ticker = await exchange.fetchTicker (symbol)
console.log (ticker)

let orderbook = await exchange.fetchOrderBook (symbol)
console.log (orderbook)

let balance = await exchange.fetchBalance ()
console.log (balance)