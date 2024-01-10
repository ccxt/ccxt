
import assert from 'assert';
import testAccount from './base/test.account.js';

async function testFetchAccounts (exchange, skippedProperties) {
    const method = 'fetchAccounts';
    const accounts = await exchange.fetchAccounts ();
    assert (Array.isArray (accounts), exchange.id + ' ' + method + ' must return an object. ' + exchange.json (accounts));
    for (let i = 0; i < accounts.length; i++) {
        testAccount (exchange, skippedProperties, method, accounts[i]);
    }
}

export default testFetchAccounts;
