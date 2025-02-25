import { Exchange } from "../../../ccxt";
declare function testLoadMarkets(exchange: Exchange, skippedProperties: object): Promise<boolean>;
export default testLoadMarkets;
