// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testExtractParams () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // Test 1: Single param
    const result1 = exchange.extractParams ('/users/{id}');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result1, [ 'id' ]);

    // Test 2: Multiple params
    const result2 = exchange.extractParams ('/users/{user_id}/orders/{order_id}');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result2, [ 'user_id', 'order_id' ]);

    // Test 3: No params
    const result3 = exchange.extractParams ('/api/health');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result3, []);

    // Test 4: Params with hyphens
    const result4 = exchange.extractParams ('/api/{resource-name}/{resource-id}');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result4, [ 'resource-name', 'resource-id' ]);

    // Test 5: Mixed path and params
    const result5 = exchange.extractParams ('/v1/{version}/users/{user_id}/profile');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result5, [ 'version', 'user_id' ]);

    // Test 6: Empty string
    const result6 = exchange.extractParams ('');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result6, []);

    // Test 7: Multiple params in longer URL
    const result7 = exchange.extractParams ('/api/{org}/{repo}/pulls/{pull_number}/comments/{comment_id}');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result7, [ 'org', 'repo', 'pull_number', 'comment_id' ]);

    // Test 8: Param at start and end
    const result8 = exchange.extractParams ('{start}/middle/{end}');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result8, [ 'start', 'end' ]);

    // Test 9: Adjacent params
    const result9 = exchange.extractParams ('{a}{b}{c}');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result9, [ 'a', 'b', 'c' ]);

    // Test 10: Param with underscores
    const result10 = exchange.extractParams ('/api/{my_param_name}');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result10, [ 'my_param_name' ]);

    // Test 11: Single character param
    const result11 = exchange.extractParams ('/api/{x}');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result11, [ 'x' ]);

    // Test 12: Only static path
    const result12 = exchange.extractParams ('/api/v1/users/orders/items');
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result12, []);
}

export default testExtractParams;
