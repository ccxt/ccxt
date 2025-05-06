import { Exchange } from '../../../../ccxt.js';
declare function testWatchOrderBookForSymbols(exchange: Exchange, skippedProperties: object, symbols: string[]): Promise<void>;
export default testWatchOrderBookForSymbols;
