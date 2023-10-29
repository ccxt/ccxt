
import assert from 'assert';
import testSharedMethods from './base/test.sharedMethods.js';
import testPosition from './base/test.position.js';

async function testFetchPositions (exchange, skippedProperties, symbol) {
    const method = 'fetchPositions';
    const now = exchange.milliseconds ();
    // without symbol
    const positions = await exchange.fetchPositions ();
    assert (Array.isArray (positions), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (positions));
    for (let i = 0; i < positions.length; i++) {
        testPosition (exchange, skippedProperties, method, positions[i], undefined, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, undefined, positions);
    // with symbol
    const positionsForSymbol = await exchange.fetchPositions ([ symbol ]);
    assert (Array.isArray (positionsForSymbol), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (positionsForSymbol));
    const positionsForSymbolLength = positionsForSymbol.length;
    assert (positionsForSymbolLength <= 4, exchange.id + ' ' + method + ' positions length for particular symbol should be less than 4, returned ' + exchange.json (positionsForSymbol));
    for (let i = 0; i < positionsForSymbol.length; i++) {
        testPosition (exchange, skippedProperties, method, positionsForSymbol[i], symbol, now);
    }
    testSharedMethods.assertTimestampOrder (exchange, method, symbol, positionsForSymbol);
}

export default testFetchPositions;
