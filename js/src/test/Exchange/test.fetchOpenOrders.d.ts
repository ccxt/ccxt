import { Exchange } from "../../../ccxt";
declare function testFetchOpenOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testFetchOpenOrders;
