import { Exchange, Ticker } from "../../../../ccxt";
declare function testTicker(exchange: Exchange, skippedProperties: object, method: string, entry: Ticker, symbol: string): void;
export default testTicker;
