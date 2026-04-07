
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testAggregate () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.milliseconds () > 0, 'go transpiler workaround');
    assert ('GO_SKIP_START');
    const bids = [
        [ 789.1, 111.05 ],
        [ 789.100, 111.05 ],
        [ 123.3, 456.2 ],
        [ 784.20, 111.05 ],
        [ 789.10, 111.05 ],
    ];
    const expectedBids = [
        [ 123.3, 456.2 ],
        [ 784.20, 111.05 ],
        [ 789.1, 333.15 ],
    ];
    testSharedMethods.assertDeepEqual (exchange, undefined, 'aggregate', exchange.aggregate (exchange.sortBy (bids, 0)), expectedBids);

    const asks = [
        [ 123.2, 456.2 ],
        [ 784.20, 222.44 ],
        [ 789.10, 111.01 ],
    ];
    const expectedAsks = [
        [ 123.2, 456.2 ],
        [ 784.20, 222.44 ],
        [ 789.10, 111.01 ],
    ];
    testSharedMethods.assertDeepEqual (exchange, undefined, 'aggregate', exchange.aggregate (exchange.sortBy (asks, 0)), expectedAsks);


    testSharedMethods.assertDeepEqual (exchange, undefined, 'aggregate', exchange.aggregate ([]), []);

    // Test 1: Simple aggregation - same price combined
    const result1 = exchange.aggregate ([ [ 100.2, 1.01 ], [ 101.5, 2.01 ], [ 100.2, 0.5 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result1, [ [ 100.2, 1.51 ], [ 101.5, 2.01 ] ]);

    // Test 2: With extra fields (should be ignored)
    const result2 = exchange.aggregate ([ [ 100.2, 1.01, 'extra' ], [ 101.5, 2.01, 'data', 'more' ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result2, [ [ 100.2, 1.01 ], [ 101.5, 2.01 ] ]);

    // Test 3: Zero volumes should be skipped
    const result3 = exchange.aggregate ([ [ 100.2, 1.01 ], [ 101.5, 0 ], [ 102.4, 2.01 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result3, [ [ 100.2, 1.01 ], [ 102.4, 2.01 ] ]);

    // Test 4: Empty array
    const result4 = exchange.aggregate ([]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result4, []);

    // Test 5: Single entry
    const result5 = exchange.aggregate ([ [ 100.2, 1.01 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result5, [ [ 100.2, 1.01 ] ]);

    // Test 6: Many same prices aggregated
    const result6 = exchange.aggregate ([ [ 100.2, 0.12 ], [ 100.2, 0.2 ], [ 100.2, 0.3 ], [ 100.2, 0.4 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result6, [ [ 100.2, 1.02 ] ]);

    // Test 7: All zero volumes - empty result
    const result7 = exchange.aggregate ([ [ 100.2, 0 ], [ 101.5, 0 ], [ 102.4, 0 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result7, []);

    // // Test 8: Preserves order of first occurrence
    // const result8 = exchange.aggregate ([ [ 103, 1.0 ], [ 101.5, 1.0 ], [ 102.4, 1.0 ], [ 101.5, 0.5 ] ]);
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result8, [ [ 103, 1.0 ], [ 101.5, 1.5 ], [ 102.4, 1.0 ] ]);

    // Test 9: Decimal prices
    const result9 = exchange.aggregate ([ [ 100.5, 1.04 ], [ 100.5, 2.04 ], [ 101.5, 1.05 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result9, [ [ 100.5, 3.08 ], [ 101.5, 1.05 ] ]);

    // Test 10: Mixed zero and non-zero for same price
    const result10 = exchange.aggregate ([ [ 100.2, 1.04 ], [ 100.2, 0 ], [ 100.2, 2.04 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result10, [ [ 100.2, 3.08 ] ]);
    assert ('GO_SKIP_END');
}

export default testAggregate;
