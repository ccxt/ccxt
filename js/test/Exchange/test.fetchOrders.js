'use strict'

const assert = require ('assert');
const testOrder = require ('./test.order.js');

async function testFetchOrders (exchange, symbol) {
    const method = 'fetchOrders';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const orders = await exchange[method] (symbol);
    assert (exchange.isArray (orders), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (orders));
    console.log (exchange.id, method, 'fetched', orders.length, 'orders for symbol, asserting each...');
    const now = exchange.milliseconds ();
    for (let i = 0; i < orders.length; i++) {
        testOrder (exchange, method, orders[i], symbol, now);
    }
}

module.exports = testFetchOrders;
