import testBalance from './base/test.balance.js';
async function testFetchBalance(exchange, skippedProperties) {
    const method = 'fetchBalance';
    const response = await exchange.fetchBalance();
    testBalance(exchange, skippedProperties, method, response);
}
export default testFetchBalance;
