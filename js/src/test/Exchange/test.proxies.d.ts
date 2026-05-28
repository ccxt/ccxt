import { Exchange } from "../../../ccxt";
declare function testProxies(exchange: Exchange, skippedProperties: object): Promise<boolean>;
export default testProxies;
