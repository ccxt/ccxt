import { Exchange, Str } from "../../../../ccxt.js";
declare function testPosition(exchange: Exchange, skippedProperties: object, method: string, entry: object, symbol: Str, now: number): void;
export default testPosition;
