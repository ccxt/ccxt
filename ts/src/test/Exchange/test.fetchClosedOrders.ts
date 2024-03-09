
import assert from 'assert';
import testOrder from './base/test.order.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchClosedOrders (exchange, skippedProperties, symbol) {
    const method = 'fetchClosedOrders';
    const orders = await exchange.fetchClosedOrders (symbol);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, orders, symbol);
    const now = exchange.milliseconds ();
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        testOrder (exchange, skippedProperties, method, order, symbol, now);
        testSharedMethods.assertInArray (exchange, skippedProperties, method, order, 'status', [ 'closed', 'canceled' ]);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, symbol, orders);
}

export default testFetchClosedOrders;
