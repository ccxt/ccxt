"use strict";
const ccxt      = require ('../../ccxt.js')
    , asTable   = require ('as-table')
    , log       = require ('ololog').configure ({ locate: false })
    , verbose   = process.argv.includes ('--verbose')

let tokens = new ccxt.tokens ({
    'apiKey': process.env.TOKENS_NET_API_KEY,
    'secret': process.env.TOKENS_NET_SECRET,
})


let printMarkets = async () => {
    log.green ('printMarkets:', '--- start ----');
    let response = await tokens.loadMarkets ();
    log(response)
}

let printTickers = async () => {
    log.green ('printTicker:', '--- start ----');
    let response = await tokens.fetchTickers ();
    log(response)
}

let printTicker = async () => {
    log.green ('printTicker:', '--- start ----');
    let response = await tokens.fetchTicker ('BTC/USDT');
    log(response)
}

let printCurrencies = async () => {
    log.green ('printCurrencies:', '--- start ----');
    let response = await tokens.fetchCurrencies ();
    log(response)
}

let printOrderBook = async () => {
    log.green ('printOrderBook:', '--- start ----');
    let response = await tokens.fetchOrderBook ('BTC/USDT');
    log(response);
    log ('Bids:');
    log (asTable (response['bids']));
}

let printTrades = async () => {
    log.green ('printTrades:', '--- start ----');
    let response = await tokens.fetchTrades ('BTC/USDT');
    log(response)
}

let printBalance = async () => {
    log.green ('printBalance:', '--- start ----');
    let response = await tokens.fetchBalance ('BTC/USDT');
    log(response);
}

let printOpenOrders = async () => {
    log.green ('printOrders:', '--- start ----');
    let response = await tokens.fetchOpenOrders ();
    log (asTable (response));
}

let printOpenOrdersDtrUsdt = async () => {
    log.green ('printOpenOrdersDtrUsdt:', '--- start ----');
    let response = await tokens.fetchOpenOrders ('DTR/USDT');
    log (asTable (response));
}

let printOrder = async () => {
    log.green ('printOrder:', '--- start ----');
    let response = await tokens.fetchOrder ('4a8b9641-2e57-4847-a740-a739fb472ae2');
    console.log(response);
    log (response);
}

let printCreateOrder = async () => {
    log.green ('printCreateOrder:', '--- start ----');
    const symbol = 'DTR/USDT';
    const type = 'limit';
    const side = 'sell';
    const amount = 30.12345678901;
    const price = 0.0539;
    let response = await tokens.createOrder (symbol, type, side, amount, price);
    log (response);

    response = tokens.cancelOrder (response['id']);
    log (response);
}

let printCancelOrder = async () => {
    log.green ('printCancelOrder:', '--- start ----');
    let response = await tokens.cancelOrder ('f2ca8794-4cdf-4eee-9716-0375b99d12d5');
    log (response);
}

let printMyTrades = async () => {
    log.green ('printMyTrades:', '--- start ----');
    let response = await tokens.fetchMyTrades ();
    log (asTable (response));
}

let printMyTradesDtrUsdt = async () => {
    log.green ('printMyTradesDtrUsdt:', '--- start ----');
    let response = await tokens.fetchMyTrades ('DTR/USDT');
    log (asTable (response));
}

(async function main () {
    await printMarkets ();
    await printTickers ();
    await printTicker ();
    await printCurrencies ();
    await printOrderBook ();
    await printTrades ();
    await printBalance ();
    await printOpenOrders ();
    await printOpenOrdersDtrUsdt ();
    await printOrder();
    await printCreateOrder();
    await printCancelOrder();
    await printMyTrades();
    await printMyTradesDtrUsdt();

    process.exit ();
}) ()
