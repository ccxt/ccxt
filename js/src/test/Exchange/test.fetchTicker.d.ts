import { Exchange } from "../../../ccxt.js";
declare function testFetchTicker(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchTicker;
