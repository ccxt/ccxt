import assert from 'assert';
import { Exchange } from "../../../../ccxt";
import { NetworkError } from '../../../base/errors.js';
import testLiquidation from '../../../test/Exchange/base/test.liquidation.js';


async function testWatchLiquidationsForSymbols (exchange: Exchange, skippedProperties: object, symbol: string) {

    const method = 'watchLiquidationsForSymbols';

    // we have to skip some exchanges here due to the frequency of trading
    const skippedExchanges = [];

    if (exchange.inArray (exchange.id, skippedExchanges)) {
        console.log (exchange.id, method + '() test skipped');
        return false;
    }

    if (!exchange.has[method]) {
        console.log (exchange.id, method + '() is not supported');
        return false;
    }

    let response = undefined;

    let now = Date.now ();
    const ends = now + 10000;

    while (now < ends) {

        try {

            response = await exchange[method] ([ symbol ]);

            now = Date.now ();

            const isArray = Array.isArray (response);
            assert (isArray, "response must be an array");

            console.log (exchange.iso8601 (now), exchange.id, symbol, method, Object.values (response).length, 'liquidations');

            // log.noLocate (asTable (response))

            for (let i = 0; i < response.length; i++) {
                testLiquidation (exchange, skippedProperties, method, response[i], symbol);
            }

        } catch (e) {

            if (!(e instanceof NetworkError)) {
                throw e;
            }

            now = Date.now ();
        }

    }

    return response;
}

export default testWatchLiquidationsForSymbols;
