import { Exchange } from "../../../ccxt.js";
declare function testFetchBorrowInterest(exchange: Exchange, skippedProperties: object, code: string, symbol: string): Promise<boolean>;
export default testFetchBorrowInterest;
