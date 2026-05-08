import { Exchange } from "../../../ccxt";
declare function testFetchMyTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchMyTrades;
