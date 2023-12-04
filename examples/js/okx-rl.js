"use strict";

import ccxt from '../../js/ccxt.js'

// instantiate the exchange
let exchange = new ccxt.okx  ({});
exchange.throttler.config.maxCapacity = 1000; 
// exchange.throttler.costMultiplier = 1.1;

async function checkOrders(){
    const promises = [];
    let results = [];
    for (let i = 0; i < 1000; i++) {
        promises.push(exchange.fetchTrades ('BTC/USDT'));
    }
    try {
        results = await Promise.all(promises);
    } catch (e) {
        console.log(e);
    }
    debugger;
}

checkOrders()
