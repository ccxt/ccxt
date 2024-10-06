import { Exchange } from "../../../ccxt";
import testStatus from './base/test.status.js';

async function testFetchStatus (exchange: Exchange, skippedProperties: object) {
    const method = 'fetchStatus';
    const status = await exchange.fetchStatus ();
    testStatus (exchange, skippedProperties, method, status, exchange.milliseconds ());
}

export default testFetchStatus;
