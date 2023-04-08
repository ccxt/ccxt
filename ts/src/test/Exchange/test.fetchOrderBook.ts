
import testOrderBook from './base/test.orderBook.js';

async function testFetchOrderBook (exchange, symbol) {
    const method = 'fetchOrderBook';
    const orderbook = await exchange.fetchOrderBook (symbol);
    testOrderBook (exchange, method, orderbook, symbol);
}

export default testFetchOrderBook;
