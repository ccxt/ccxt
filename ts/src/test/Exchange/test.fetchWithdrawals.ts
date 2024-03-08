import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testDepositWithdrawal from './base/test.depositWithdrawal.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchWithdrawals (exchange: Exchange, skippedProperties: string[], code: string) {
    const method = 'fetchWithdrawals';
    const transactions = await exchange.fetchWithdrawals (code);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, transactions, code);
    const now = exchange.milliseconds ();
    for (let i = 0; i < transactions.length; i++) {
        testDepositWithdrawal (exchange, skippedProperties, method, transactions[i], code, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, code, transactions);
}

export default testFetchWithdrawals;
