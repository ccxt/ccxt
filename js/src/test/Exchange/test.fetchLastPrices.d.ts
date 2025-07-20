import { Exchange } from "../../../ccxt";
declare function testFetchLastPrices(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchLastPrices;
