
import testStatus from './base/test.status.js';

async function testFetchStatus (exchange) {
    const method = 'fetchStatus';
    const status = await exchange.fetchStatus ();
    testStatus (exchange, method, status, exchange.milliseconds ());
}

export default testFetchStatus;
