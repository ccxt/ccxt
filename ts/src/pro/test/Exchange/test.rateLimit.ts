import assert from 'assert';
import { BaseError, Exchange } from "../../../../ccxt.js";

async function runUntilTimeout (exchange: Exchange) {
    await exchange.sleep (10000);
    throw new BaseError ('Timeout');
}

async function testRateLimit (exchange: Exchange, skippedProperties) {
    let errorThrown = false;
    const symbols = [];
    const exchangeSymbols = exchange.symbols;
    // TODO: can replace with slice once AST transpiler is updated
    const exchangeSymbolsLength = exchangeSymbols.length;
    for (let i = 0; i < 350 && i < exchangeSymbolsLength; i++) {
        symbols.push (exchangeSymbols[i]);
    }
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
        promises.push (runUntilTimeout (exchange));
        await Promise.all (promises);
    } catch (e) {
        assert (e['message'] === 'Timeout', 'Recieved unexpected error: ' + e.toString ());
    }
    await exchange.close ();
}

export default testRateLimit;
