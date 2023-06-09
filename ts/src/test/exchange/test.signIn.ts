
async function testSignIn (exchange, skippedProperties) {
    const method = 'signIn';
    if (exchange.has[method]) {
        await exchange.signIn ();
    }
    // we don't print "else" message, because if signIn is not supported by exchange, that doesn't need to be printed, because it is not lack/missing method, just it is not needed
}

export default testSignIn;
