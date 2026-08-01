import { Exchange } from "../../../../ccxt.js";
import type { Liquidation } from '../../../base/types.js';
declare function testWatchLiquidations(exchange: Exchange, skippedProperties: object, symbol: string): Promise<false | Liquidation[]>;
export default testWatchLiquidations;
