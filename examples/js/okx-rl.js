"use strict";

import ccxt from '../../js/ccxt.js'

// instantiate the exchange
let exchange = new ccxt.okx  ({});
exchange.throttler.config.maxCapacity = 1000; 

async function checkOrders(){
    const arr = [];
    for (let i = 0; i < 1000; i++) {
        const prom = exchange.fetchTrades ('BTC/USDT', 1600000000000);
        arr.push(prom);
    }
    try {
        await Promise.all(arr);
    } catch (e) {
        console.log(e);
    }
    debugger;
}

checkOrders()
