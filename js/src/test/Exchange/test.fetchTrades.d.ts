import { Exchange } from "../../../ccxt";
declare function testFetchTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchTrades;
