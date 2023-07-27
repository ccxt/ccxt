
import testOrderBook from './base/test.orderBook.js';

async function testFetchL2OrderBook (exchange, skippedProperties, symbol) {
    const method = 'fetchL2OrderBook';
    const orderBook = await exchange.fetchL2OrderBook (symbol);
    testOrderBook (exchange, skippedProperties, method, orderBook, symbol);
}

export default testFetchL2OrderBook;
