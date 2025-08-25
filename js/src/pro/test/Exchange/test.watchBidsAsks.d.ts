import { Exchange } from "../../../../ccxt";
declare function testWatchBidsAsks(exchange: Exchange, skippedProperties: object, symbol: string): Promise<void>;
export default testWatchBidsAsks;
