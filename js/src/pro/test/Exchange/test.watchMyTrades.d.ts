import { Exchange } from '../../../../ccxt.js';
declare function testWatchMyTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchMyTrades;
