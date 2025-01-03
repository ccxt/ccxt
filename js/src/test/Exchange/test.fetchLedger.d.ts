import { Exchange } from "../../../ccxt";
declare function testFetchLedger(exchange: Exchange, skippedProperties: object, code: string): Promise<void>;
export default testFetchLedger;
