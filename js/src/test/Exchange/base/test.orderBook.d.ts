import { Exchange, OrderBook } from "../../../../ccxt";
declare function testOrderBook(exchange: Exchange, skippedProperties: object, method: string, orderbook: OrderBook, symbol: string): void;
export default testOrderBook;
