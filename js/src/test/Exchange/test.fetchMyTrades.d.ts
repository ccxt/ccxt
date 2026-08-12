import { Exchange } from "../../../ccxt.js";
declare function testFetchMyTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchMyTrades;
