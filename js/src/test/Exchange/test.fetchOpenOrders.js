import testOrder from './base/test.order.js';
import testSharedMethods from './base/test.sharedMethods.js';
async function testFetchOpenOrders(exchange, skippedProperties, symbol) {
    const method = 'fetchOpenOrders';
    const orders = await exchange.fetchOpenOrders(symbol);
    testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, orders, symbol);
    const now = exchange.milliseconds();
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        testOrder(exchange, skippedProperties, method, order, symbol, now);
        testSharedMethods.assertInArray(exchange, skippedProperties, method, order, 'status', ['open']);
    }
    testSharedMethods.assertTimestampOrder(exchange, method, symbol, orders);
    return true;
}
export default testFetchOpenOrders;
