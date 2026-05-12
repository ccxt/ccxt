import { Exchange } from "../../../ccxt";
declare function testFetchTradingFee(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchTradingFee;
