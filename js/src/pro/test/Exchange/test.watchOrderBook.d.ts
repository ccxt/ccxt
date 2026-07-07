import { Exchange } from '../../../../ccxt.js';
declare function testWatchOrderBook(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchOrderBook;
