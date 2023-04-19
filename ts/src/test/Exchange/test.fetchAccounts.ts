
import assert from 'assert';
import testAccount from './base/test.account.js';

async function testFetchAccounts (exchange) {
    const method = 'fetchAccounts';
    const accounts = await exchange.fetchAccounts ();
    assert (typeof accounts === 'object', exchange.id + ' ' + method + ' must return an object. ' + exchange.json (accounts));
    const accountValues = Object.values (accounts);
    for (let i = 0; i < accountValues.length; i++) {
        testAccount (exchange, method, accounts[i]);
    }
}

export default testFetchAccounts;
