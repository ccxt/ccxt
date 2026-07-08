import { Exchange } from "../../../../ccxt.js";
import { Liquidation } from '../../../base/types.js';
declare function testWatchLiquidationsForSymbols(exchange: Exchange, skippedProperties: object, symbol: string): Promise<false | Liquidation[]>;
export default testWatchLiquidationsForSymbols;
