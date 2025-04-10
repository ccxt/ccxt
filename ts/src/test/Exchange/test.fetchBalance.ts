import { Exchange } from "../../../ccxt";
import testBalance from './base/test.balance.js';

async function testFetchBalance (exchange: Exchange, skippedProperties: object) {
    const method = 'fetchBalance';
    const response = await exchange.fetchBalance ();
    testBalance (exchange, skippedProperties, method, response);
    return true;
}

export default testFetchBalance;
