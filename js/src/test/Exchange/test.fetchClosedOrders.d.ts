import { Exchange } from "../../../ccxt";
declare function testFetchClosedOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testFetchClosedOrders;
