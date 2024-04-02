import { Exchange } from "../../../ccxt";
declare function testFetchTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testFetchTrades;
