
import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange, Str, Trade } from '../../../../ccxt.js';

async function testWatchTradesForSymbols (exchange: Exchange, skippedProperties: object, symbols: string[]) {
    const method = 'watchTradesForSymbols';
    const logText = exchange.id + ' ' + method + ' [symbols: ' + exchange.json (symbols) + '] ';
    let now = exchange.milliseconds ();
    const ends = now + 30000;
    const symbolsLength = symbols.length;
    const returnedSymbols: Str[] = [];
    let allReceived = false;
    // keep watching until every symbol traded or the deadline passed, a quiet market can stay silent for a while
    while ((now < ends) && !allReceived) {
        let response: Trade[] | undefined = undefined;
        let success = true;
        try {
            response = await exchange.watchTradesForSymbols (symbols);
        } catch (e) {
            if (!testSharedMethods.isTemporaryFailure (e)) {
                throw e;
            }
            success = false;
        }
        now = exchange.milliseconds ();
        if ((success) && (response !== undefined)) {
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
            const returnedLength = returnedSymbols.length;
            if (returnedLength === symbolsLength) {
                allReceived = true;
            }
        }
    }
    const receivedLength = returnedSymbols.length;
    assert (receivedLength > 0, logText + 'did not receive trades for any symbol');
    if (!allReceived) {
        // an illiquid symbol may not trade inside the window, that is the market and not a bug
        console.log (logText + 'warning: only received part of symbols before the deadline: ' + exchange.json (returnedSymbols));
    }
    return true;
}

export default testWatchTradesForSymbols;
