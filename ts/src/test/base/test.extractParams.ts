

import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testExtractParams () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // paths -> expected params, in order: single, multiple, none, hyphens, mixed,
    // empty, long url, edges, adjacent, underscores, single char, static only
    const paths = [
        '/users/{id}',
        '/users/{user_id}/orders/{order_id}',
        '/api/health',
        '/api/{resource-name}/{resource-id}',
        '/v1/{version}/users/{user_id}/profile',
        '',
        '/api/{org}/{repo}/pulls/{pull_number}/comments/{comment_id}',
        '{start}/middle/{end}',
        '{a}{b}{c}',
        '/api/{my_param_name}',
        '/api/{x}',
        '/api/v1/users/orders/items',
    ];
    const expected = [
        [ 'id' ],
        [ 'user_id', 'order_id' ],
        [],
        [ 'resource-name', 'resource-id' ],
        [ 'version', 'user_id' ],
        [],
        [ 'org', 'repo', 'pull_number', 'comment_id' ],
        [ 'start', 'end' ],
        [ 'a', 'b', 'c' ],
        [ 'my_param_name' ],
        [ 'x' ],
        [],
    ];
    for (let i = 0; i < paths.length; i++) {
        const result = exchange.extractParams (paths[i]);
        testSharedMethods.assertDeepEqual (exchange, undefined, 'testExtractParams', result, expected[i]);
    }
}

export default testExtractParams;
