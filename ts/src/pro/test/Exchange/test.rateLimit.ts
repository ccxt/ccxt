import assert from 'assert';

async function testRateLimit (exchange, skippedProperties) {
    let errorThrown = false;
    let symbols = exchange.symbols;
    symbols = symbols.slice (0, 1000);
    // Test without rate limit
    exchange.enableRateLimit = false;
    let promises = [];
    try {
        for (let i = 0; i < symbols.length; i++) {
            promises.push (exchange.watchOHLCV (symbols[i], '1m'));
        }
        await Promise.all (promises);
    } catch (e) {
        errorThrown = true;
    }
    assert (errorThrown === true, 'Expected RateLimitExceeded error. Increase number of symbols or turn off if this exchange does not have a rate limit protection');
    // Reset exchange
    await exchange.close ();
    // Test with rate limit
    exchange.enableRateLimit = true;
    promises = [];
    try {
        for (let i = 0; i < symbols.length; i++) {
            promises.push (exchange.watchOHLCV (symbols[i], '1m'));
        }
        await Promise.all (promises);
    } catch (e) {
        assert (false, 'Recieved unexpected error: ' + e.toString ());
    }
    await exchange.close ();
}

export default testRateLimit;
