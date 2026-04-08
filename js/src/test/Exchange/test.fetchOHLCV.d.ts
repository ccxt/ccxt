import { Exchange } from "../../../ccxt";
declare function testFetchOHLCV(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchOHLCV;
