import { Exchange } from '../../../../ccxt.js';
declare function testWatchOHLCVForSymbols(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchOHLCVForSymbols;
