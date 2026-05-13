import { Exchange } from '../../../../ccxt.js';
declare function testWatchTicker(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchTicker;
