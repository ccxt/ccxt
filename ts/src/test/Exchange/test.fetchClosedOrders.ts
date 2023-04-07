
import assert from 'assert';
import testOrder from './test.order.js';
import testSharedMethods from './test.sharedMethods.js';

async function testFetchClosedOrders (exchange, symbol) {
    const method = 'fetchClosedOrders';
    const orders = await exchange.fetchClosedOrders (symbol);
    assert (Array.isArray (orders), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (orders));
    console.log (exchange.id, method, 'fetched', orders.length, 'entries, asserting each ...');
    const now = exchange.milliseconds ();
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        testOrder (exchange, method, order, symbol, now);
        assert (exchange.inArray (order['status'], [ 'closed', 'canceled' ]), exchange.id + ' ' + method + ' ' + symbol + ' returned an order with status ' + order['status'] + ' (expected "closed" or "canceled")');
    }
    testSharedMethods.assertTimestampOrder (exchange, method, symbol, orders);
}

export default testFetchClosedOrders;
