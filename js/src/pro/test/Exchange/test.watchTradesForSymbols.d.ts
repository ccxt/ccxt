import { Exchange } from '../../../../ccxt.js';
declare function testWatchTradesForSymbols(exchange: Exchange, skippedProperties: object, symbols: string[]): Promise<void>;
export default testWatchTradesForSymbols;
