import { Exchange } from '../../../../ccxt.js';
declare function testWatchTickers(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testWatchTickers;
