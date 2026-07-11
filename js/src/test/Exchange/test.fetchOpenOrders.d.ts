import { Exchange } from "../../../ccxt.js";
declare function testFetchOpenOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchOpenOrders;
