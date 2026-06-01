import { Exchange } from "../../../ccxt";
declare function testFetchTickers(exchange: Exchange, skippedProperties: object, symbol: string): Promise<[import("../../base/types").Tickers, import("../../base/types").Tickers]>;
export default testFetchTickers;
