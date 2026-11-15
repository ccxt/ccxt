import { Exchange } from "../../../ccxt.js";
declare function testFetchOHLCV(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchOHLCV;
