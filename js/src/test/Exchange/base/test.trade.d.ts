import { Exchange } from "../../../../ccxt.js";
declare function testTrade(exchange: Exchange, skippedProperties: object, method: string, entry: object, symbol: string, now: number, isPublicTrade: boolean): void;
export default testTrade;
