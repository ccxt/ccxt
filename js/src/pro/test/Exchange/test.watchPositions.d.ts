import { Exchange } from '../../../../ccxt.js';
declare function testWatchPositions(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testWatchPositions;
