import { Exchange } from "../../../ccxt.js";
declare function testFetchOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchOrders;
