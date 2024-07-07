import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testOrderBook from './base/test.orderBook.js';

async function testFetchOrderBooks (exchange: Exchange, skippedProperties: object) {
    const method = 'fetchOrderBooks';
    const symbol = exchange.symbols[0];
    const orderBooks = await exchange.fetchOrderBooks ([ symbol ]);
    assert (typeof orderBooks === 'object', exchange.id + ' ' + method + ' must return an object. ' + exchange.json (orderBooks));
    const orderBookKeys = Object.keys (orderBooks);
    assert (orderBookKeys.length, exchange.id + ' ' + method + ' returned 0 length data');
    for (let i = 0; i < orderBookKeys.length; i++) {
        const symbolInner = orderBookKeys[i];
        testOrderBook (exchange, skippedProperties, method, orderBooks[symbolInner], symbolInner);
    }
}

export default testFetchOrderBooks;
