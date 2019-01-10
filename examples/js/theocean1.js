"use strict";

const ccxt = require ('../../ccxt.js')

;(async function main () {
    const walletAddress = process.env['WALLET_ADDRESS']
    const privateKey = process.env['PRIVATE_KEY']
    const apiKey = process.env['API_KEY']
    const secret = process.env['SECRET']

    const ocean = new ccxt.theocean1({
        walletAddress,
        privateKey,
        apiKey,
        secret
    });

    // get balance
    const balance = await ocean.fetchBalanceByCode('REP');
    console.log('REP balance: ', balance);

    // get order book
    const orderBook = await ocean.fetchOrderBook('REP/ZRX');
    console.log('REP/ZRX orderbook: ', orderBook);

    // placing order
    const placeResult = await ocean.createOrder('REP/ZRX', 'limit', 'sell', '0.5', '30');
    console.log('result of placing order: ', placeResult);

    // cancel order
    if (placeResult['remaining'] > 0) {
        const cancelResult = await ocean.cancelOrder(placeResult['id']);
        console.log('cancel result: ', cancelResult);
    }
    process.exit ();
}) ()