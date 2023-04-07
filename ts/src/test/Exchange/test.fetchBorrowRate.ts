
import testBorrowRate from './test.borrowRate.js';

async function testFetchBorrowRate (exchange, code) {
    const method = 'fetchBorrowRate';
    let borrowRate = undefined;
    try {
        borrowRate = await exchange[method] (code);
    } catch (ex : any) {
        const message = ex.message;
        // for exchanges, atm, we don't have the correct lists of currencies, which currency is borrowable and which not. So, because of our predetermined list of test-currencies, some of them might not be borrowable, and thus throws exception. However, we shouldn't break tests for that specific exceptions, and skip those occasions.
        if (message.indexOf ('could not find the borrow rate for currency code') < 0) {
            throw new Error (message);
        }
        // console.log (method + '() : ' + code + ' is not borrowable for this exchange. Skipping the test method.');
        return;
    }
    testBorrowRate (exchange, method, borrowRate, code);
}

export default testFetchBorrowRate;
