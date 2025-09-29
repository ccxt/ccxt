
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testRemoveRepeatedElementsFromArray () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // CASE 1: by id
    const array1 = [
        { 'id': 'a', 'timestamp': 1, 'uniq': 'x1' },
        { 'id': 'b', 'timestamp': 2, 'uniq': 'x2' },
        { 'id': 'a', 'timestamp': 3, 'uniq': 'x3' }, // duplicate id
        { 'id': 'c', 'timestamp': 1, 'uniq': 'x4' }, // duplicate timestamp
    ];
    const res1 = exchange.removeRepeatedElementsFromArray (array1, false);
    const res1Length = res1.length;
    assert (res1Length === 3);
    assert (res1[0]['uniq'] === 'x1');
    assert (res1[1]['uniq'] === 'x2');
    assert (res1[2]['uniq'] === 'x4');

    // CASE 2: by timestamp
    const array2 = [
        { 'id': undefined, 'timestamp': 1, 'uniq': 'x1' },
        { 'id': undefined, 'timestamp': 2, 'uniq': 'x2' },
        { 'id': undefined, 'timestamp': 1, 'uniq': 'x3' }, // duplicate timestamp
        { 'id': undefined, 'timestamp': 3, 'uniq': 'x4' },
    ];
    const res2 = exchange.removeRepeatedElementsFromArray (array2, true);
    const res2Length = res2.length;
    assert (res2Length === 3);
    assert (res2[0]['uniq'] === 'x1');
    assert (res2[1]['uniq'] === 'x2');
    assert (res2[2]['uniq'] === 'x4');

    // CASE 3: by timestamp index (used in ohlcv)
    const array3 = [
        [ 555, 1.0, 1.0, "x1" ],
        [ 666, 1.0, 1.0, "x2" ],
        [ 555, 1.0, 1.0, "x3" ], // duplicate timestamp (0 index)
    ];
    const res3 = exchange.removeRepeatedElementsFromArray (array3, true);
    assert (res3.length === 2);
    assert (res3[0][3] === "x1");
    assert (res3[1][3] === "x2");
}

export default testRemoveRepeatedElementsFromArray;
