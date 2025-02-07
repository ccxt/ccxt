import { Exchange } from '../../../../ccxt.js';
declare function testWatchOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testWatchOrders;
