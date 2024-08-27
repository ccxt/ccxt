import { Exchange } from '../../../../ccxt.js';
declare function testWatchTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testWatchTrades;
