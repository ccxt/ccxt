import { Exchange } from "../../../ccxt";
declare function testFetchL2OrderBook(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchL2OrderBook;
