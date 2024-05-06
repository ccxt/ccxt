import { Exchange } from "../../../ccxt";
declare function testFetchTickers(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testFetchTickers;
