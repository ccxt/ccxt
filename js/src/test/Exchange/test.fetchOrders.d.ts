import { Exchange } from "../../../ccxt";
declare function testFetchOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testFetchOrders;
