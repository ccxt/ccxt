
import testBalance from './base/test.balance.js';

async function testFetchBalance (exchange, code, symbol) {
    const method = 'fetchBalance';
    const response = await exchange.fetchBalance ();
    testBalance (exchange, method, response);
}

export default testFetchBalance;
