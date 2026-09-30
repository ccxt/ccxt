import { Exchange } from "../../../ccxt.js";
declare function testFetchL2OrderBook(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchL2OrderBook;
