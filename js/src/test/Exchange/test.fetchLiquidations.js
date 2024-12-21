import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testLiquidation from './base/test.liquidation.js';
async function testFetchLiquidations(exchange, skippedProperties, code) {
    const method = 'fetchLiquidations';
    if (!exchange.has['fetchLiquidations']) {
        return;
    }
    const items = await exchange.fetchLiquidations(code);
    assert(Array.isArray(items), exchange.id + ' ' + method + ' ' + code + ' must return an array. ' + exchange.json(items));
    const now = exchange.milliseconds();
    for (let i = 0; i < items.length; i++) {
        testLiquidation(exchange, skippedProperties, method, items[i], code);
    }
    testSharedMethods.assertTimestampOrder(exchange, method, code, items);
}
export default testFetchLiquidations;
