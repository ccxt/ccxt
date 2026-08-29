import { Exchange } from '../../../../ccxt.js';
declare function testWatchTrades(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchTrades;
