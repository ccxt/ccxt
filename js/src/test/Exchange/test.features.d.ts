import { Exchange } from "../../../ccxt.js";
declare function testFeatures(exchange: Exchange, skippedProperties: object): Promise<boolean>;
export default testFeatures;
