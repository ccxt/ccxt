import { Exchange } from '../../../../ccxt.js';
declare function testWatchTicker(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testWatchTicker;
