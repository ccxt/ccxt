import { Exchange } from "../../../ccxt.js";
declare function testFetchOrderBook(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchOrderBook;
