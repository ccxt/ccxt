
import assert from 'assert';
import testOrderBook from './base/test.orderBook.js';

async function testFetchL2OrderBook (exchange, symbol) {
    const method = 'fetchL2OrderBook';
    const orderBook = await exchange.fetchL2OrderBook (symbol);
    assert (typeof orderBook === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (orderBook));
    testOrderBook (exchange, method, orderBook, symbol);
}

export default testFetchL2OrderBook;
