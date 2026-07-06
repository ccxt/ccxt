import { Exchange } from "../../../ccxt.js";
declare function testFetchTickers(exchange: Exchange, skippedProperties: object, symbol: string): Promise<[import("../../base/types.js").Tickers, import("../../base/types.js").Tickers]>;
export default testFetchTickers;
