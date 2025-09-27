import { Exchange } from "../../../ccxt";
declare function testFeatures(exchange: Exchange, skippedProperties: object): Promise<boolean>;
export default testFeatures;
