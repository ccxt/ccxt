import { Exchange } from '../../../../ccxt.js';
declare function testUnwatchPositions(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testUnwatchPositions;
