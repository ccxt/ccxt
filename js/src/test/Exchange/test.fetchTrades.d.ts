import { Exchange } from "../../../ccxt.js";
declare function testFetchTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testFetchTrades;
