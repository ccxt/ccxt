import { Exchange } from "../../../ccxt";
import testOrderBook from './base/test.orderBook.js';

async function testFetchOrderBook (exchange: Exchange, skippedProperties: string[], symbol: string) {
    const method = 'fetchOrderBook';
    const orderbook = await exchange.fetchOrderBook (symbol);
    testOrderBook (exchange, skippedProperties, method, orderbook, symbol);
}

export default testFetchOrderBook;
