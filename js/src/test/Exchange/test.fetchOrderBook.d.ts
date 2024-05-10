import { Exchange } from "../../../ccxt";
declare function testFetchOrderBook(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testFetchOrderBook;
