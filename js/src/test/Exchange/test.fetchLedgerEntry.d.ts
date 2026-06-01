import { Exchange } from "../../../ccxt";
declare function testFetchLedgerEntry(exchange: Exchange, skippedProperties: object, code: string): Promise<boolean>;
export default testFetchLedgerEntry;
