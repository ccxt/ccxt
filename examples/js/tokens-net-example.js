const ccxt      = require ('../../ccxt.js')
const log       = require ('ololog').configure ({ locate: false })

let tokens = new ccxt.tokens  ({ 
        'apiKey': process.env.TOKENS_NET_API_KEY, 
        'secret': process.env.TOKENS_NET_SECRET,
        'options' : {
        	'fetchBalanceCurrencies' : ['ETH', 'DPP']
        }
    })

// tokens.fetchMarkets().then(function(r){
// 	log(r)
// })

// tokens.fetchOrderBook('DPP/ETH').then(function(r){
// 	log(r)
// })

// tokens.fetchTrades('DPP/ETH').then(function(r){
// 	log(r)
// })

tokens.fetchBalance().then(function(r){
	log(r)
})

// or if you did not define 'fetchBalanceCurrencies' in the options:
tokens.fetchBalance({codes:['DPP', 'ETH']}).then(function(r){
	log(r)
})


// tokens.createOrder('DPP/ETH', null, 'buy', 253, 0.00004290).then(function(r){
// 	log(r)
// 	setTimeout(function(){
// 		tokens.fetchOrder(r.id).then(function(_r){
// 			log(_r)
// 		})	
// 	},1000)
// 	setTimeout(function(){
// 		tokens.cancelOrder(r.id).then(function(_r){
// 			log(_r)
// 		})
// 	},5000)
// })