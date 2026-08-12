import { Exchange } from "../../../../ccxt.js";
declare function testLedgerEntry(exchange: Exchange, skippedProperties: object, method: string, entry: object, requestedCode: string, now: number): void;
export default testLedgerEntry;
