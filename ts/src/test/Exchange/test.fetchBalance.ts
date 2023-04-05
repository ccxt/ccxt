
import testBalance from './test.balance.js';

async function testFetchBalance (exchange, code, symbol) {
    const method = 'fetchBalance';
    const response = await exchange[method] ();
    console.log (exchange.id, method, 'fetched, asserting now  ...');
    testBalance (exchange, method, response);
}

export default testFetchBalance;
