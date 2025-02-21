import { Exchange } from "../../../ccxt";
declare function testFetchFundingRateHistory(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchFundingRateHistory;
