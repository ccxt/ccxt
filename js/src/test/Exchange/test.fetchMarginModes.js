import assert from 'assert';
import testMarginMode from './base/test.marginMode.js';
import testSharedMethods from './base/test.sharedMethods.js';
async function testFetchMarginModes(exchange, skippedProperties, symbol) {
    const method = 'fetchMarginModes';
    const marginModes = await exchange.fetchMarginModes(['symbol']);
    assert(typeof marginModes === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json(marginModes));
    const marginModeKeys = Object.keys(marginModes);
    testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, marginModes, symbol);
    for (let i = 0; i < marginModeKeys.length; i++) {
        const marginMode = marginModes[marginModeKeys[i]];
        testSharedMethods.assertNonEmtpyArray(exchange, skippedProperties, method, marginMode, symbol);
        testMarginMode(exchange, skippedProperties, method, marginMode);
    }
}
export default testFetchMarginModes;
