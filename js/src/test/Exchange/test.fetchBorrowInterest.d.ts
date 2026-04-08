import { Exchange } from "../../../ccxt";
declare function testFetchBorrowInterest(exchange: Exchange, skippedProperties: object, code: string, symbol: string): Promise<boolean>;
export default testFetchBorrowInterest;
