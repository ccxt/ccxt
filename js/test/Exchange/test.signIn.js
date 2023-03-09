'use strict'

async function testSignIn (exchange) {
    const method = 'signIn';
    await exchange[method] ();
    console.log (exchange.id, method, 'successful');
}

module.exports = testSignIn;
