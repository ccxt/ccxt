import assert from 'assert';
import ccxt from '../../../../ccxt.js';
async function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
async function main() {
    const exchange = new ccxt.pro.binanceusdm({
        'apiKey': '',
        'secret': ''
    });
    exchange.setSandboxMode(true);
    const symbol = 'XRP/USDT:USDT';
    exchange.spawn(exchange.watchOrders, symbol);
    await sleep(10);
    const order = await exchange.createOrder(symbol, 'limit', 'buy', 10, 0.5); // resolved by the spawn
    console.log('createOrder:', order['id']);
    await exchange.createOrder(symbol, 'limit', 'buy', 11, 0.49);
    console.log('createOrder:', order['id']);
    await exchange.createOrder(symbol, 'limit', 'buy', 11, 0.48);
    console.log('createOrder:', order['id']);
    const orders = await exchange.watchOrders('XRP/USDT');
    console.log('orders:', orders.length);
    assert(orders.length === 2, 'expecting 2 orders to be returned');
    await exchange.close();
}
main();
