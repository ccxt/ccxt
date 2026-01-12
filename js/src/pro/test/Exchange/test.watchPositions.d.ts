import { Exchange } from '../../../../ccxt.js';
declare function testWatchPositions(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testWatchPositions;
