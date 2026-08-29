import { Exchange } from "../../../ccxt.js";
declare function testFetchMarkets(exchange: Exchange, skippedProperties: object): Promise<boolean>;
export default testFetchMarkets;
