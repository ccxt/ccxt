'use strict'

async function testFetchTransactionFees (exchange) {
    const method = 'fetchTransactionFees';
    const skippedExchanges = [
        'bibox', // fetchTransactionFees should be rewritten to fetchTransactionFee
        'exmo', // todo: fetchTransactionFees should be rewritten, it's a bit messy atm for quick fix
        'bkex', // todo: temporary skip
        'stex', // todo: temporary skip
        'crex24', // todo: temporary skip
    ];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const fees = await exchange[method] ();
    const withdrawKeys = Object.keys (fees['withdraw']);
    console.log (exchange.id, method, 'fetched', withdrawKeys.length, 'entries');
    // todo : assert each entry
}

module.exports = testFetchTransactionFees;
