// ----------------------------------------------------------------------------

import assert from 'assert';
import testTrade from '../../../test/Exchange/base/test.trade.js';
import errors from '../../../base/errors.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbol) => {

    // log (symbol.green, 'watching my trades...')

    const method = 'watchMyTrades';
    const skippedProperties = {};

    if (!exchange.has[method]) {
        console.log (exchange.id, 'does not support', method, '() method');
        return;
    }

    let response = undefined;

    let now = Date.now ();
    const ends = now + 10000;

    while (now < ends) {

        try {

            response = await exchange[method] (symbol);

            now = Date.now ();

            assert (response instanceof Array);

            console.log (exchange.iso8601 (now), exchange.id, symbol.green, method, (Object.values (response).length.toString () as any).green, 'trades');

            // log.noLocate (asTable (response))

            for (let i = 0; i < response.length; i++) {
                const trade = response[i];
                testTrade (exchange, skippedProperties, method, trade, symbol, now);
                if (i > 0) {
                    const previousTrade = response[i - 1];
                    if (trade.timestamp && previousTrade.timestamp) {
                        assert (trade.timestamp >= previousTrade.timestamp);
                    }
                }
            }
        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e;
            }

            now = Date.now ();
        }
    }

    return response;
};
