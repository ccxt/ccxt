let ccxt = require ('ccxt')

let exchange = new ccxt.bitfinex ({
    apiKey: '5A1VikyEtDpmFkrzX4e52LsaVgCxXyMnY9JElqvNMxo', 
    secret: 'Rgxxw1BGnq6NLTLq1hn0oQ5FBDRLYFFVRzyEKYbz1io',
})

(async function () {

	await exchange.loadProducts ()
	console.log (exchange.symbols)
	
	let symbol = exchange.symbols[0]
	
	let ticker = await exchange.fetchTicker (symbol)
	console.log (symbol, ticker)
	
	let orderbook = await exchange.fetchTicker (symbol)
	console.log (symbol, orderbook)
	
	let balance = await exchange.fetchBalance ()
	console.log (symbol, balance)

}) ()
