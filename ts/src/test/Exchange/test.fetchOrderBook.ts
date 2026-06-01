import { Exchange } from "../../../ccxt";
import testOrderBook from './base/test.orderBook.js';

async function testFetchOrderBook (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchOrderBook';
    const orderbook = await exchange.fetchOrderBook (symbol);
    testOrderBook (exchange, skippedProperties, method, orderbook, symbol);
    return true;
}

export default testFetchOrderBook;
