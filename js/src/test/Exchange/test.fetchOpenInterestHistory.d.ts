import { Exchange } from "../../../ccxt.js";
declare function testFetchOpenInterestHistory(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchOpenInterestHistory;
