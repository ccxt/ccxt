import { Exchange } from "../../../ccxt.js";
declare function testFetchTransfers(exchange: Exchange, skippedProperties: object, code: string): Promise<boolean>;
export default testFetchTransfers;
