'use strict'

async function testSignIn(exchange) {
    const method = 'signIn';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    await exchange[method] ();
    console.log (exchange.id, method, 'successful');
}

module.exports = testSignIn;
