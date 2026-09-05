
import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';
import { Exchange, Trade } from '../../../../ccxt.js';

async function testWatchTradesForSymbols (exchange: Exchange, skippedProperties: object, symbols: string[]) {
    const method = 'watchTradesForSymbols';
    let now = exchange.milliseconds ();
    const ends = now + 15000;
    const maxIdleTime = 5000;
    let idle = false;
    const returnedSymbols: string[] = [];
    while ((now < ends || returnedSymbols.length < symbols.length) && !idle) {
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
        if ((success === true) && (response !== undefined)) {
            assert (Array.isArray (response), exchange.id + ' ' + method + ' ' + exchange.json (symbols) + ' must return an array. ' + exchange.json (response));
            for (let i = 0; i < response.length; i++) {
                const trade = response[i];
                const symbol: string = trade['symbol'] as string;
                testTrade (exchange, skippedProperties, method, trade, symbol, now, true);
                testSharedMethods.assertInArray (exchange, skippedProperties, method, trade, 'symbol', symbols);
                if (!exchange.inArray (symbol, returnedSymbols)) {
                    returnedSymbols.push (symbol);
                }
            }
            if ((now - startTime) > maxIdleTime) {
                idle = true;
            }
        }
    }
    return true;
}

export default testWatchTradesForSymbols;
