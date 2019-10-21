const ccxt = require("./ccxt")
console.log(ccxt.version);

// console.log(ccxt.exchanges);
// KEY: DC6A865DC713A9D99A9C9B1374C35771
// SECRET: E593FD73BB3B91536339697077A9A77D

let bitbns = new ccxt.bitbns();

(async () => {
    await bitbns.loadMarkets();

    // let cs = await bitbns.fetchOHLCV('BTC/INR', '1d');
    // console.log(cs);
    

    // console.log(bitbns.symbols);
    // console.log(bitbns.markets["BTC/USDT"]);
    
    // let tickers = await bitbns.fetchTicker("BTC/INR");
    // console.log(tickers);
    
    // let trades = await bitbns.fetchTrades("BTC/INR", Date.now()-360000000);
    // console.log(trades);
    // console.log(trades.length);
    
    // let ob = await bitbns.fetchOrderBook("BTC/INR", 100);
    // console.log(ob);
    
    let order = await bitbns.createOrder("BTC/INR", "", 'buy', '0.0001', '766000');
    console.log(order);
    
    // let cancelOrder = await bitbns.cancelOrder('1234', 'BTC/INR');
    // console.log(cancelOrder);
    
    
    

})()
