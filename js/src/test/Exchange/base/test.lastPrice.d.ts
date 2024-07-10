import { Exchange } from "../../../../ccxt";
import { LastPrice } from "../../../base/types";
declare function testLastPrice(exchange: Exchange, skippedProperties: object, method: string, entry: LastPrice, symbol: string): void;
export default testLastPrice;
