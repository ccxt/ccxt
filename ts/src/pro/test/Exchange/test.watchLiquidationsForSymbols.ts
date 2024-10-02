import assert from 'assert';
import { Exchange } from "../../../../ccxt";
import errors from '../../../base/errors.js';
import testLiquidation from '../../../test/Exchange/base/test.liquidation.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange: Exchange, skippedProperties: object, symbol: string) => {

    const method = 'watchLiquidationsForSymbols';

    // we have to skip some exchanges here due to the frequency of trading
    const skippedExchanges = [];

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, method + '() test skipped');
        return;
    }

    if (!exchange.has[method]) {
        console.log (exchange.id, method + '() is not supported');
        return;
    }

    let response = undefined;

    let now = Date.now ();
    const ends = now + 10000;

    while (now < ends) {

        try {

            response = await exchange[method] ([ symbol ]);

            now = Date.now ();

            assert (response instanceof Array);

            console.log (exchange.iso8601 (now), exchange.id, symbol, method, Object.values (response).length, 'liquidations');

            // log.noLocate (asTable (response))

            for (let i = 0; i < response.length; i++) {
                testLiquidation (exchange, skippedProperties, method, response[i], symbol);
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
