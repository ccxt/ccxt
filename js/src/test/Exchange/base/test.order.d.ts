import { Exchange } from "../../../../ccxt";
declare function testOrder(exchange: Exchange, skippedProperties: object, method: string, entry: object, symbol: string, now: number): void;
export default testOrder;
