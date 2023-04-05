
async function testFetchTransactionFees (exchange) {
    const method = 'fetchTransactionFees';
    const fees = await exchange.fetchTransactionFees ();
    const withdrawKeys = Object.keys (fees['withdraw']);
    console.log (exchange.id, method, 'fetched', withdrawKeys.length, 'entries');
    // todo : assert each entry
}

export default testFetchTransactionFees;
