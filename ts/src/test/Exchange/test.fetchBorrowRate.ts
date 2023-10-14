
import testBorrowRate from './base/test.borrowRate.js';

async function testFetchBorrowRate (exchange, skippedProperties, code) {
    const method = 'fetchBorrowRate';
    const borrowRate = await exchange.fetchBorrowRate (code);
    testBorrowRate (exchange, skippedProperties, method, borrowRate, code);
}

export default testFetchBorrowRate;
