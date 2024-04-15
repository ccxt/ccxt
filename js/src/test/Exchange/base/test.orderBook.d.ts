import { Exchange, OrderBook } from "../../../../ccxt";
declare function testOrderBook(exchange: Exchange, skippedProperties: object, method: string, orderbook: OrderBook, symbol: string | undefined): void;
export default testOrderBook;
