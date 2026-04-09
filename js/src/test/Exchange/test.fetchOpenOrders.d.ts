import { Exchange } from "../../../ccxt";
declare function testFetchOpenOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchOpenOrders;
