import { Exchange } from '../../../../ccxt.js';
declare function testWatchOrders(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchOrders;
