import testStatus from './base/test.status.js';
async function testFetchStatus(exchange, skippedProperties) {
    const method = 'fetchStatus';
    const status = await exchange.fetchStatus();
    testStatus(exchange, skippedProperties, method, status, exchange.milliseconds());
    return true;
}
export default testFetchStatus;
