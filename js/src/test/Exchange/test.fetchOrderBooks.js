import assert from 'assert';
import testOrderBook from './base/test.orderBook.js';
async function testFetchOrderBooks(exchange, skippedProperties) {
    const method = 'fetchOrderBooks';
    const symbols = exchange.symbols;
    assert(symbols !== undefined, exchange.id + ' ' + method + ' requires exchange.symbols to be loaded');
    const symbol = symbols[0];
    const orderBooks = await exchange.fetchOrderBooks([symbol]);
    assert(exchange.isDictionary(orderBooks), exchange.id + ' ' + method + ' must return a dict. ' + exchange.json(orderBooks));
    const orderBookKeys = Object.keys(orderBooks);
    assert(orderBookKeys.length, exchange.id + ' ' + method + ' returned 0 length data');
    for (let i = 0; i < orderBookKeys.length; i++) {
        const symbolInner = orderBookKeys[i];
        testOrderBook(exchange, skippedProperties, method, orderBooks[symbolInner], symbolInner);
    }
    return true;
}
export default testFetchOrderBooks;
