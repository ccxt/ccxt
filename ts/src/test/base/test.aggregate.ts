
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testAggregate () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const bids = [
        [ 789.1, 111.01 ],
        [ 789.100, 111.01 ],
        [ 123.3, 456.2 ],
        [ 784.20, 111.01 ],
        [ 789.10, 111.01 ],
    ];
    const expectedBids = [
        [ 123.3, 456.2 ],
        [ 784.20, 111.01 ],
        [ 789.1, 333.03 ],
    ];
    testSharedMethods.assertDeepEqual (exchange, undefined, 'aggregate', exchange.aggregate (exchange.sortBy (bids, 0)), expectedBids);

    const asks = [
        [ 123.2, 456.2 ],
        [ 784.20, 111.01 ],
        [ 789.10, 111.01 ],
    ];
    const expectedAsks = [
        [ 123.2, 456.2 ],
        [ 784.20, 111.01 ],
        [ 789.10, 111.01 ],
    ];
    testSharedMethods.assertDeepEqual (exchange, undefined, 'aggregate', exchange.aggregate (exchange.sortBy (asks, 0)), expectedAsks);


    testSharedMethods.assertDeepEqual (exchange, undefined, 'aggregate', exchange.aggregate ([]), []);

    // Test 1: Simple aggregation - same price combined
    const result1 = exchange.aggregate ([ [ 100, 1.0 ], [ 101, 2.0 ], [ 100, 0.5 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result1, [ [ 100, 1.5 ], [ 101, 2.0 ] ]);

    // Test 2: With extra fields (should be ignored)
    const result2 = exchange.aggregate ([ [ 100, 1.0, 'extra' ], [ 101, 2.0, 'data', 'more' ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result2, [ [ 100, 1.0 ], [ 101, 2.0 ] ]);

    // Test 3: Zero volumes should be skipped
    const result3 = exchange.aggregate ([ [ 100, 1.0 ], [ 101, 0 ], [ 102, 2.0 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result3, [ [ 100, 1.0 ], [ 102, 2.0 ] ]);

    // Test 4: Empty array
    const result4 = exchange.aggregate ([]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result4, []);

    // Test 5: Single entry
    const result5 = exchange.aggregate ([ [ 100, 1.0 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result5, [ [ 100, 1.0 ] ]);

    // Test 6: Many same prices aggregated
    const result6 = exchange.aggregate ([ [ 100, 0.1 ], [ 100, 0.2 ], [ 100, 0.3 ], [ 100, 0.4 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result6, [ [ 100, 1.0 ] ]);

    // Test 7: All zero volumes - empty result
    const result7 = exchange.aggregate ([ [ 100, 0 ], [ 101, 0 ], [ 102, 0 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result7, []);

    // // Test 8: Preserves order of first occurrence
    // const result8 = exchange.aggregate ([ [ 103, 1.0 ], [ 101, 1.0 ], [ 102, 1.0 ], [ 101, 0.5 ] ]);
    // testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result8, [ [ 103, 1.0 ], [ 101, 1.5 ], [ 102, 1.0 ] ]);

    // Test 9: Decimal prices
    const result9 = exchange.aggregate ([ [ 100.5, 1.0 ], [ 100.5, 2.0 ], [ 101.5, 1.0 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result9, [ [ 100.5, 3.0 ], [ 101.5, 1.0 ] ]);

    // Test 10: Mixed zero and non-zero for same price
    const result10 = exchange.aggregate ([ [ 100, 1.0 ], [ 100, 0 ], [ 100, 2.0 ] ]);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testAggregate', result10, [ [ 100, 3.0 ] ]);
}

export default testAggregate;
