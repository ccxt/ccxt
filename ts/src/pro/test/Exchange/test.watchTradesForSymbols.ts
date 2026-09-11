
import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange, Str, Trade } from '../../../../ccxt.js';

async function testWatchTradesForSymbols (exchange: Exchange, skippedProperties: object, symbols: string[]) {
    const method = 'watchTradesForSymbols';
    const logText = exchange.id + ' ' + method + ' [symbols: ' + exchange.json (symbols) + '] ';
    let now = exchange.milliseconds ();
    const ends = now + 30000;
    const maxIdleTime = 5000;
    let idle = false;
    const returnedSymbols: Str[] = [];
    while ((now < ends) && !idle) {
        let response: Trade[] | undefined = undefined;
        let success = true;
        const startTime = exchange.milliseconds ();
        try {
            response = await exchange.watchTradesForSymbols (symbols);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            success = false;
        }
        now = exchange.milliseconds ();
        const elapsedMs = now - startTime;
        if ((success === true) && (response !== undefined)) {
            assert (Array.isArray (response), logText + 'must return an array. ' + exchange.json (response));
            for (let i = 0; i < response.length; i++) {
                const trade = response[i];
                const symbol = trade['symbol'];
                assert (symbol !== undefined, logText + 'returned a trade without a symbol ' + exchange.json (trade));
                testTrade (exchange, skippedProperties, method, trade, symbol as string, now, true);
                testSharedMethods.assertInArray (exchange, skippedProperties, method, trade, 'symbol', symbols);
                if (!exchange.inArray (symbol, returnedSymbols)) {
                    returnedSymbols.push (symbol);
                }
            }
            if (elapsedMs > maxIdleTime) {
                idle = true;
            }
        }
    }
    assert (returnedSymbols.length < symbols.length, logText + 'only received part of symbols: ' + exchange.json (returnedSymbols));
    return true;
}

export default testWatchTradesForSymbols;
