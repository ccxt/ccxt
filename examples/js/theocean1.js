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
    const response = await ocean.fetchOrderToSign('REP/ZRX', 'sell', '0.5', '30');
    const signedOrder = await ocean.signZeroExOrderV2(response['unsignedZeroExOrder'], privateKey);
    const result = await ocean.postSignedOrder(signedOrder, response);
    console.log('result of placing order: ', result);
    process.exit ();
}) ()