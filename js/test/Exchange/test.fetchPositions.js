'use strict'

const assert = require ('assert');
const testPosition = require ('./test.position.js');
const testSharedMethods = require ('./test.sharedMethods.js');

async function testFetchPositions (exchange, symbol) {
    const method = 'fetchPositions';
    const skippedExchanges = [];
    if (exchange.inArray(exchange.id, skippedExchanges)) {
        console.log (exchange.id, method, 'found in ignored exchanges, skipping ...');
        return;
    }
    const now = exchange.milliseconds ();
    // without symbol
    const positions = await exchange[method] ();
    assert (Array.isArray (positions), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (positions));
    console.log (exchange.id, method, 'fetched', positions.length, 'entries, asserting each ...');
    for (let i = 0; i < positions.length; i++) {
        testPosition (exchange, method, positions[i], undefined, now);
    }
    testSharedMethods.reviseSortedTimestamps (exchange, method, positions);
    // with symbol
    const positionsForSymbol = await exchange[method] ([ symbol ]);
    assert (Array.isArray (positionsForSymbol), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (positionsForSymbol));
    const positionsForSymbolLength = positionsForSymbol.length;
    assert (positionsForSymbolLength <= 4, exchange.id + ' ' + method + ' positions length for particular symbol should be less than 4, returned ' + exchange.json (positionsForSymbol));
    console.log (exchange.id, method, 'fetched', positionsForSymbol.length, 'entries, asserting each ...');
    for (let i = 0; i < positionsForSymbol.length; i++) {
        testPosition (exchange, method, positionsForSymbol[i], symbol, now);
    }
    const testSharedMethods = require ('./test.sharedMethods.js');
    testSharedMethods.reviseSortedTimestamps (exchange, method, positionsForSymbolLength);
}

module.exports = testFetchPositions;