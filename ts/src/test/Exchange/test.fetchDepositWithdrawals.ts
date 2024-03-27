
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testDepositWithdrawal from './base/test.depositWithdrawal.js';

async function testFetchDepositsWithdrawals (exchange, skippedProperties, code) {
    const method = 'fetchTransactions';
    const transactions = await exchange.fetchTransactions (code);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, transactions, code);
    const now = exchange.milliseconds ();
    for (let i = 0; i < transactions.length; i++) {
        testDepositWithdrawal (exchange, skippedProperties, method, transactions[i], code, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, code, transactions);
}

export default testFetchDepositsWithdrawals;
