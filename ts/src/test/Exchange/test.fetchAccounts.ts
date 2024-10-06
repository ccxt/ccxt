import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testAccount from './base/test.account.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchAccounts (exchange: Exchange, skippedProperties: object) {
    const method = 'fetchAccounts';
    const accounts = await exchange.fetchAccounts ();
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, accounts);
    for (let i = 0; i < accounts.length; i++) {
        testAccount (exchange, skippedProperties, method, accounts[i]);
    }
}

export default testFetchAccounts;
