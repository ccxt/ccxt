import { Exchange } from "../../../ccxt.js";
declare function testFetchMarginMode(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchMarginMode;
