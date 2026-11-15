import { Exchange } from "../../../ccxt.js";
declare function testFetchMarginModes(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchMarginModes;
