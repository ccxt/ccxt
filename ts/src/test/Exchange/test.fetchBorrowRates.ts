

import assert from 'assert';
import testBorrowRate from './test.borrowRate.js';

async function testFetchBorrowRates (exchange) {
    const method = 'fetchBorrowRates';
    const borrowRates = await exchange[method] ();
    assert (typeof borrowRates === 'object', exchange.id + ' ' + method + ' must return an object. ' + exchange.json(borrowRates));
    const keysLength = (Object.keys (borrowRates)).length;
    console.log (exchange.id, method, 'fetched', keysLength, 'entries, asserting each ...');
    const values = Object.values (borrowRates);
    for (let i = 0; i < values.length; i++) {
        testBorrowRate (exchange, method, values[i], undefined);
    }
}

export default testFetchBorrowRates;