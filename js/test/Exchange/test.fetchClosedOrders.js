'use strict'

const assert = require ('assert');
const testOrder = require ('./test.order.js');
const testSharedMethods = require ('./test.sharedMethods.js');

async function testFetchClosedOrders (exchange, symbol) {
    const method = 'fetchClosedOrders';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const orders = await exchange[method] (symbol);
    assert (Array.isArray (orders), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (orders));
    console.log (exchange.id, method, 'fetched', orders.length, 'entries, asserting each ...');
    const now = exchange.milliseconds ();
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        testOrder (exchange, method, order, symbol, now);
        assert (exchange.inArray (order['status'], [ 'closed', 'canceled' ]), exchange.id + ' ' + method + ' ' + symbol + ' returned an order with status ' + order['status'] + ' (expected "closed" or "canceled")');
    }
    testSharedMethods.reviseSortedTimestamps (exchange, method, symbol, orders);
}

module.exports = testFetchClosedOrders;
