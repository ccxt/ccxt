'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert');

// ----------------------------------------------------------------------------


async function testSignIn(exchange) {
    const method = 'signIn';
    if (exchange.has[method]) {
        await exchange[method] (code)
        console.log (method + ' successful');
    } else {
        console.log (method + '() is not supported');
    }
}

module.exports = testSignIn;
