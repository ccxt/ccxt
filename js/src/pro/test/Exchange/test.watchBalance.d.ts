import { Exchange } from '../../../../ccxt.js';
declare function testWatchBalance(exchange: Exchange, skippedProperties: object, code: string): Promise<void>;
export default testWatchBalance;
