
import assert from 'assert';
import { Exchange } from "../../../../ccxt.js";
import testLiquidation from '../../../test/Exchange/base/test.liquidation.js';
import { NetworkError } from '../../../base/errors.js';
import testSharedMethods from '../../../test/Exchange/base/test.sharedMethods.js';


async function testWatchLiquidations (exchange: Exchange, skippedProperties: object, symbol: string) {

    // log (symbol.green, 'watching trades...')

    const method = 'watchLiquidations';

    // we have to skip some exchanges here due to the frequency of trading
    const skippedExchanges = [];

    if (exchange.inArray (exchange.id, skippedExchanges)) {
        const m1 = (exchange.id + ' ' + method + '() test skipped');
        console.log (m1);
        return false;
    }

    if (!exchange.has[method]) {
        const m2 = (exchange.id + ' does not support ' + method + '() method');
        console.log (m2);
        return false;
    }

    let response = undefined;

    let now = Date.now ();
    const ends = now + 10000;

    while (now < ends) {

        try {

            response = await exchange[method] (symbol);

            now = Date.now ();

            const isArray = Array.isArray (response);
            assert (isArray, "response must be an array");

            const m3 = (exchange.id + ' ' + method + '() returned ' + response.length + ' liquidations');
            console.log (m3);

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
export default testWatchLiquidations;
