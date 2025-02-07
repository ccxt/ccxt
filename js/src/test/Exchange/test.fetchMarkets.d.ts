import { Exchange } from "../../../ccxt";
declare function testFetchMarkets(exchange: Exchange, skippedProperties: object): Promise<boolean>;
export default testFetchMarkets;
