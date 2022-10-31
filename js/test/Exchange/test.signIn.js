'use strict'

// ----------------------------------------------------------------------------

async function testSignIn(exchange) {
    const method = 'signIn';
    if (exchange.has[method]) {
        await exchange[method] ();
        console.log (method + ' successful');
    } else {
        console.log (method + '() is not supported');
    }
}

module.exports = testSignIn;
