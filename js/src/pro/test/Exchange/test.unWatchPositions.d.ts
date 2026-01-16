import { Exchange } from '../../../../ccxt.js';
declare function testUnWatchPositions(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testUnWatchPositions;
