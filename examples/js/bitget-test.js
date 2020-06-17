const ccxt      = require ('../../ccxt.js')


let bitget = new ccxt.bitget({
    apiKey:'ak0763a55ffa29445a',
    secret:'01dfb872cd124ba3b9ea44fca3d195f3'
})
// bitget.load_markets().then((res)=>{
//     console.log(JSON.stringify(res));
// })

// bitget.fetchMarkets().then((res)=>{
//     console.log('fetchmarkets',JSON.stringify(res));
// })


//获取账户余额
// bitget.fetchBalance().then((res)=>{
//     console.log('fetchBalance',JSON.stringify(res));
// })

// 未找到
// bitget.fetchCurrencies().then((res)=>{
//     console.log('fetchCurrencies',JSON.stringify(res));
// })

//fetchTickers
// bitget.fetchTickers().then((res)=>{
//     console.log('fetchTickers',JSON.stringify(res));
// })

//fetchTicker
// bitget.fetchTicker('btcusd').then((res)=>{
//     console.log('fetchTicker',JSON.stringify(res));
// })

//fetchOrderBook
// bitget.fetchOrderBook('btcusd',20).then((res)=>{
//     console.log('fetchOrderBook',JSON.stringify(res));
// })

//fetchTrades
// bitget.fetchTrades('cmt_btcusdt',20).then((res)=>{
//     console.log('fetchTrades',JSON.stringify(res));
// })

//fetchOHLCV
// let since= new Date().getTime();
// bitget.fetchOHLCV('cmt_btcusdt','1m',undefined,100).then((res)=>{
//     console.log('fetchOHLCV',JSON.stringify(res));
// })

//createOrder
// cmt_btcsusdt
// languageType: 1
// matchType: 0
// instrument_id: "cmt_btcsusdt"
// size: 10
// match_price: "9428.0"
// type: 1
//  bitget.createOrder('cmt_ethsusdt',1,10,'224.14').then((res)=>{
//      console.log('createOrder',JSON.stringify(res));
//  })
 //656268519482064813
 //656329155016654813


 //fetchOrder
//  bitget.fetchOrder('656268519482064813','cmt_ethsusdt').then((res)=>{
//     console.log('fetchOrder',JSON.stringify(res));
// })

//fetchOrders
// bitget.fetchOrders('cmt_ethsusdt').then((res)=>{
//     console.log('fetchOrders',JSON.stringify(res));
// })

//fetchOpenOrders

// bitget.fetchOpenOrders('cmt_ethsusdt').then((res)=>{
//     console.log('fetchOpenOrders',JSON.stringify(res));
// })

//fetchMyTrades
// return await this.fetchOrdersByState ('1', symbol, since, limit, params);
// bitget.fetchMyTrades('cmt_ethsusdt').then((res)=>{
//     console.log('fetchMyTrades',JSON.stringify(res));
// })

// bitget.cancelOrder('656329155016654813','cmt_ethsusdt').then((res)=>{
//     console.log('cancelOrder',JSON.stringify(res));
// })

//okex
// okex.fetchTickers().then((res)=>{
//     console.log('fetchTickers',JSON.stringify(res));
// })