
// ----------------------------------------------------------------------------

import testAccount from './test.account.js';

// ----------------------------------------------------------------------------

async function testFetchAccounts (exchange) {
    const method = 'fetchAccounts';
    if (!(exchange.has[method])) {
        console.log (exchange.id, method + '() is not supported');
        return;
    }
    console.log ('fetching accounts...');
    const accounts = await exchange[method] ();
    Object.values (accounts).forEach ((account) => testAccount (exchange, account, undefined));
    return accounts;
}

export default testFetchAccounts;
