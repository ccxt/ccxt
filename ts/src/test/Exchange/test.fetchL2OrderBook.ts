
import testOrderBook from './base/test.orderBook.js';

async function testFetchL2OrderBook (exchange, symbol) {
    const method = 'fetchL2OrderBook';
    const orderBook = await exchange.fetchL2OrderBook (symbol);
    testOrderBook (exchange, method, orderBook, symbol);
}

export default testFetchL2OrderBook;
