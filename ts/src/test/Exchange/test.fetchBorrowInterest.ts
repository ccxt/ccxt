
import assert from 'assert';
import testBorrowInterest from './base/test.borrowInterest.js';

async function testFetchBorrowInterest (exchange, code, symbol) {
    const method = 'fetchBorrowInterest';
    const borrowInterest = await exchange.fetchBorrowInterest (code, symbol);
    assert (Array.isArray (borrowInterest), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json (borrowInterest));
    for (let i = 0; i < borrowInterest.length; i++) {
        testBorrowInterest (exchange, method, borrowInterest[i], code, symbol);
    }
}

export default testFetchBorrowInterest;
