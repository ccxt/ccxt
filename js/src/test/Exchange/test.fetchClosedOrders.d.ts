import { Exchange } from "../../../ccxt.js";
declare function testFetchClosedOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchClosedOrders;
