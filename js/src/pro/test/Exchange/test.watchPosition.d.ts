import { Exchange } from '../../../../ccxt.js';
declare function testWatchPosition(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchPosition;
