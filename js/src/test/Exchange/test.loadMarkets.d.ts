import { Exchange } from "../../../ccxt.js";
declare function testLoadMarkets(exchange: Exchange, skippedProperties: object): Promise<boolean>;
export default testLoadMarkets;
