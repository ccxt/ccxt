import { Exchange } from "../../../ccxt";
declare function testFetchPositions(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testFetchPositions;
