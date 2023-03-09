'use strict'

async function testFetchTransactionFees (exchange) {
    const method = 'fetchTransactionFees';
    const fees = await exchange[method] ();
    const withdrawKeys = Object.keys (fees['withdraw']);
    console.log (exchange.id, method, 'fetched', withdrawKeys.length, 'entries');
    // todo : assert each entry
}

module.exports = testFetchTransactionFees;
