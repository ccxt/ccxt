import testDepositWithdrawal from './base/test.depositWithdrawal.js';
import testSharedMethods from './base/test.sharedMethods.js';
async function testFetchDeposits(exchange, skippedProperties, code) {
    const method = 'fetchDeposits';
    const transactions = await exchange.fetchDeposits(code);
    testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, transactions, code);
    const now = exchange.milliseconds();
    for (let i = 0; i < transactions.length; i++) {
        testDepositWithdrawal(exchange, skippedProperties, method, transactions[i], code, now);
    }
    testSharedMethods.assertTimestampOrder(exchange, method, code, transactions);
}
export default testFetchDeposits;
