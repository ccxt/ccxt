
import assert from 'assert';
import testOrderBook from './test.orderBook.js';

async function testFetchL2OrderBook (exchange, symbol) {
    const method = 'fetchL2OrderBook';
    const orderBook = await exchange[method] (symbol);
    assert (typeof orderBook === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (orderBook));
    console.log (exchange.id, method, 'fetched, with items length', orderBook['bids'].length, 'asserting now ...');
    testOrderBook (exchange, method, orderBook, symbol);
}

export default testFetchL2OrderBook;
