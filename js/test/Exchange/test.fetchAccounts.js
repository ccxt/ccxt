'use strict'

const testAccount = require ('./test.account.js')

async function testFetchAccounts (exchange) {
    const method = 'fetchAccounts';
    const accounts = await exchange[method] ();
    assert (typeof accounts === 'object', exchange.id + ' ' + method + ' must return an object. ' + exchange.json(accounts));
    const accountValues = Object.values (accounts);
    console.log (exchange.id, method, 'fetched', accountValues.length, 'entries, asserting each ...');
    for (let i = 0; i < accountValues.length; i++) {
        testAccount (exchange, method, accounts[i]);
    }
}

module.exports = testFetchAccounts;