import { Exchange } from "../../../ccxt.js";
declare function testFetchDeposits(exchange: Exchange, skippedProperties: object, code: string): Promise<boolean>;
export default testFetchDeposits;
