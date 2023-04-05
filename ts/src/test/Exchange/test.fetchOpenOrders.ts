
import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';
import testOrder from './test.order.js';

async function testFetchOpenOrders (exchange, symbol) {
    const method = 'fetchOpenOrders';
    const orders = await exchange.fetchOpenOrders (symbol);
    assert (Array.isArray (orders), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (orders));
    console.log (exchange.id, method, 'fetched', orders.length, 'entries, asserting each ...');
    const now = exchange.milliseconds ();
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        testOrder (exchange, method, order, symbol, now);
        assert (order['status'] === 'open', exchange.id + ' ' + method + ' ' + symbol + ' returned an order with status ' + order['status'] + ' (expected "open")');
    }
    testSharedMethods.reviseSortedTimestamps (exchange, method, symbol, orders);
}

export default testFetchOpenOrders;
