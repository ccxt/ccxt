const ccxt = require("./ccxt")
const bitbnsApi = require('bitbns');
const bitbns2 = new bitbnsApi({
      apiKey :  '***REMOVED***',
      apiSecretKey : '***REMOVED***'
}); 
// console.log(ccxt.version);

// console.log(ccxt.exchanges);
// KEY: DC6A865DC713A9D99A9C9B1374C35771
// SECRET: E593FD73BB3B91536339697077A9A77D

let bitbns = new ccxt.bitbns();

(async () => {
    // await bitbns.loadMarkets();

    // let cs = await bitbns.fetchOHLCV('BTC/INR', '1d');
    // console.log(cs);
    

    // console.log(bitbns.symbols);
    // console.log(bitbns.markets["BTC/USDT"]);

    // let tickers = await bitbns.fetchTickers();
    // console.log(tickers);
    
    // let tickerone = await bitbns.fetchTicker("BTC/INR");
    // console.log(tickerone);
    
    // let trades = await bitbns.fetchTrades("BTC/INR", Date.now()-360000000);
    // console.log(trades);
    // console.log(trades.length);
    
    // let ob = await bitbns.fetchOrderBook("BTC/INR", 100);
    // console.log(ob);

    // let data1 = bitbns.sign('orders', 'private', 'POST', params = {
    //     'symbol': 'BTC',
    //     'side': 'BUY',
    //     'quantity': '0.001',
    //     'rate': '766000',
    // }, undefined,undefined)

    // let data2 = bitbns2.populateHeadersForPost('BTC', 'orders',{
    //     symbol: 'BTC',
    //     side: 'BUY',
    //     quantity: '0.001',
    //     rate: '766000'
    // })
    // bitbns2.getPayload('/orders/BTC',{
    //         symbol: 'BTC',
    //         side: 'BUY',
    //         quantity: '0.001',
    //         rate: '766000'
    // })
    // let order2 = bitbns2.placeOrders({
    //     symbol: 'BTC',
    //     side: 'BUY',
    //     quantity: '0.001',
    //     rate: '766000'
    // }, (e,d)=>{
    //     if(e) console.log(e);
        
    //     console.log(d);
        
    // })

    // let order = await bitbns.createOrder("BTC/INR", "", 'buy', '0.001', '766000');
    // console.log(order);
    // let cancel = await bitbns.cancelOrder('asd', 'BTC/INR');
    // console.log(cancel);
    
    // console.log(order2);
    // closed: '2583833'
    // canceled: 2583798
    // let status = await bitbns.fetchOrder('2583833', 'BTC/INR');
    // console.log(status);

    let openOrder = await bitbns.fetchOpenOrders ('BTC/INR');
    console.log(openOrder);
    
    
    
    
    // let cancelOrder = await bitbns.cancelOrder('1234', 'BTC/INR');
    // console.log(cancelOrder);
    
    
    

})()
