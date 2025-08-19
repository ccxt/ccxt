import { Exchange } from "../../../ccxt";
declare function testFetchMarginModes(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchMarginModes;
