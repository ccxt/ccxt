import { Exchange } from "../../../ccxt.js";
declare function testFetchTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchTrades;
