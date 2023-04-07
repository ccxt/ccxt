
import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';
import testOrder from './test.order.js';

async function testFetchOrders (exchange, symbol) {
    const method = 'fetchOrders';
    const orders = await exchange.fetchOrders (symbol);
    assert (Array.isArray (orders), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (orders));
    console.log (exchange.id, method, 'fetched', orders.length, 'entries, asserting each ...');
    const now = exchange.milliseconds ();
    for (let i = 0; i < orders.length; i++) {
        testOrder (exchange, method, orders[i], symbol, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, symbol, orders);
}

export default testFetchOrders;
