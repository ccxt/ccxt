import { Exchange } from "../../../ccxt.js";
declare function testProxies(exchange: Exchange, skippedProperties: object): Promise<boolean>;
export default testProxies;
