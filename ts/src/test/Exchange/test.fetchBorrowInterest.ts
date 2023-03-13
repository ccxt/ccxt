
import assert from 'assert';
import testBorrowInterest from "./test.borrowInterest";

async function testFetchBorrowInterest (exchange, code, symbol) {
    const method = 'fetchBorrowInterest';
    const borrowInterest = await exchange[method] (code, symbol);
    assert (Array.isArray (borrowInterest), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json(borrowInterest));
    console.log (exchange.id, method, 'fetched', borrowInterest.length, 'entries, asserting each ...');
    for (let i = 0; i < borrowInterest.length; i++) {
        testBorrowInterest (exchange, method, borrowInterest[i], code, symbol);
    }
}

export default testFetchBorrowInterest;