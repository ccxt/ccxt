import { Exchange } from '../../../../ccxt.js';
declare function testWatchOHLCV(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchOHLCV;
