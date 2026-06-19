import { Exchange } from "../../../../ccxt.js";
import { LastPrice } from "../../../base/types.js";
declare function testLastPrice(exchange: Exchange, skippedProperties: object, method: string, entry: LastPrice, symbol: string): void;
export default testLastPrice;
