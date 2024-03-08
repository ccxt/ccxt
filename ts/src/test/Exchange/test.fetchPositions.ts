import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testPosition from './base/test.position.js';

async function testFetchPositions (exchange: Exchange, skippedProperties: string[], symbol: string) {
    const method = 'fetchPositions';
    const now = exchange.milliseconds ();
    // without symbol
    const positions = await exchange.fetchPositions ();
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, positions, symbol);
    for (let i = 0; i < positions.length; i++) {
        testPosition (exchange, skippedProperties, method, positions[i], undefined, now);
    }
    // testSharedMethods.assertTimestampOrder (exchange, method, undefined, positions); // currently order of positions does not make sense
    // with symbol
    const positionsForSymbol = await exchange.fetchPositions ([ symbol ]);
    assert (Array.isArray (positionsForSymbol), exchange.id + ' ' + method + ' must return an array, returned ' + exchange.json (positionsForSymbol));
    const positionsForSymbolLength = positionsForSymbol.length;
    assert (positionsForSymbolLength <= 4, exchange.id + ' ' + method + ' positions length for particular symbol should be less than 4, returned ' + exchange.json (positionsForSymbol));
    for (let i = 0; i < positionsForSymbol.length; i++) {
        testPosition (exchange, skippedProperties, method, positionsForSymbol[i], symbol, now);
    }
    // testSharedMethods.assertTimestampOrder (exchange, method, symbol, positionsForSymbol);
}

export default testFetchPositions;
