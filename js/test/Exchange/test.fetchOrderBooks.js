'use strict'

const testOrderBook = require ('./test.orderBook.js');

async function testFetchOrderBook (exchange) {
    const method = 'fetchOrderBooks';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const orderBooks = await exchange[method] (... args);
    assert (typeof orderBooks === 'object', exchange.id + ' ' + method + ' must return an indexed structure by key, returned ' + exchange.json (orderBooks));
    const orderBookKeys = Object.keys (orderBooks);
    assert (orderBookKeys.length > 0, exchange.id + ' ' + method + ' returned 0 length data');
    console.log (exchange.id, method, 'fetched', orderBookKeys.length, 'order books, asserting each...');
    for (let i = 0; i < orderBookKeys.length; i++) {
        const symbol = orderBookKeys[i];
        testOrderBook (exchange, method, orderBooks[symbol], symbol);
    }
}
