'use strict'

// ----------------------------------------------------------------------------

async function testSignIn(exchange) {
    const method = 'signIn';
    if (exchange.has[method]) {
        await exchange[method] ();
        console.log (method + ' successful');
    }
    // we don't print "else" message, because if signIn is not supported by exchange, that doesn't need to be printed, because it is not lack/missing method, but because it is not needed
}

module.exports = testSignIn;
