import { Exchange } from "../../../ccxt.js";
declare function testFetchLastPrices(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchLastPrices;
