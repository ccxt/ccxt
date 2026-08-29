import { Exchange, Ticker, Str } from "../../../../ccxt.js";
declare function testTicker(exchange: Exchange, skippedProperties: object, method: string, entry: Ticker, symbol: Str): void;
export default testTicker;
