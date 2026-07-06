import { Exchange } from "../../../ccxt.js";
declare function testFetchPositions(exchange: Exchange, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchPositions;
