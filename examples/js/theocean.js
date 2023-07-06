

import ccxt from '../../js/ccxt.js';
(async function main () {
    const walletAddress = process.env['WALLET_ADDRESS']
    const privateKey = process.env['PRIVATE_KEY']
    const apiKey = process.env['API_KEY']
    const secret = process.env['SECRET']

    const ocean = new ccxt.theocean({
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
    const id = placeResult['id'];
    console.log('result of placing order: ', placeResult);

    // cancel order
    if (placeResult['remaining'] > 0) {
        const cancelResult = await ocean.cancelOrder(id);
        console.log('cancel result: ', cancelResult);
    }

    // cancel all open user orders
    const cancelAllOrderssResult = await ocean.cancelAllOrders();
    console.log('cancel all orders result: ', cancelAllOrderssResult);

    process.exit ();
}) ()
