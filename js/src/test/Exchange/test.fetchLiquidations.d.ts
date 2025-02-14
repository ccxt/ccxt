import { Exchange } from "../../../ccxt";
declare function testFetchLiquidations(exchange: Exchange, skippedProperties: object, code: string): Promise<boolean>;
export default testFetchLiquidations;
