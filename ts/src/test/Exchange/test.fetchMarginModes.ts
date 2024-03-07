
import assert from 'assert';
import testMarginMode from './base/test.marginMode.js';

async function testFetchMarginModes (exchange, skippedProperties, symbol) {
    const method = 'fetchMarginModes';
    const marginModes = await exchange.fetchMarginModes (symbol);
    assert (typeof marginModes === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (marginModes));
    const marginModeKeys = Object.keys (marginModes);
    const arrayLength = marginModeKeys.length;
    assert (arrayLength >= 1, exchange.id + ' ' + method + ' ' + symbol + ' must have at least one entry. ' + exchange.json (marginModes));
    for (let i = 0; i < arrayLength; i++) {
        const marginModesForSymbol = marginModes[marginModeKeys[i]];
        const arrayLengthSymbol = marginModesForSymbol.length;
        assert (arrayLengthSymbol >= 1, exchange.id + ' ' + method + ' ' + symbol + ' must have at least one entry. ' + exchange.json (marginModes));
        for (let j = 0; j < marginModesForSymbol.length; j++) {
            testMarginMode (exchange, skippedProperties, method, marginModesForSymbol[j]);
        }
    }
}

export default testFetchMarginModes;
