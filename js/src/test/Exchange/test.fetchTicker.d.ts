import { Exchange } from "../../../ccxt";
declare function testFetchTicker(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchTicker;
