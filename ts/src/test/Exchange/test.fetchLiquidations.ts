import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testSharedMethods from './base/test.sharedMethods.js';
import testLiquidation from './base/test.liquidation.js';

async function testFetchLiquidations (exchange: Exchange, skippedProperties: object, code: string) {
    const method = 'fetchLiquidations';
    if (!exchange.has['fetchLiquidations']) {
        return true;
    }
    const items = await exchange.fetchLiquidations (code);
    assert (Array.isArray (items), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json (items));
    // const now = exchange.milliseconds ();
    for (let i = 0; i < items.length; i++) {
        testLiquidation (exchange, skippedProperties, method, items[i], code);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, code, items);
    return true;
}

export default testFetchLiquidations;
