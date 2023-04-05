
import testOrderBook from './test.orderBook.js';

async function testFetchOrderBook (exchange, symbol) {
    const method = 'fetchOrderBook';
    const orderbook = await exchange[method] (symbol);
    console.log (exchange.id, method, 'fetched succesfully, asserting now ...');
    testOrderBook (exchange, method, orderbook, symbol);
}

export default testFetchOrderBook;
